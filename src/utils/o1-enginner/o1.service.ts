import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as fnmatch from 'fnmatch';
import difflib from 'diff';
import { openAi } from '../Ai/openAi-native';
import { flatten, values } from 'lodash';
import { ChatCompletionUserMessageParam } from 'openai/resources/index';
import { createInterface } from 'readline';

function Table(diff) {
  const headers = ['状态', '行', '内容'];
  const colWidths = [10, 5, 50]; // 列宽

  // 打印表头
  const headerRow = headers
    .map((header, index) => header.padEnd(colWidths[index]))
    .join(' | ');
  console.log(headerRow);
  console.log('-'.repeat(headerRow.length)); // 分隔线

  let lineNumber = 1;
  for (const line of diff) {
    const status = line[0];
    const content = line.slice(2).trim();
    if (status === ' ') continue;

    let statusText;
    if (status === '-') {
      statusText = '已删除';
    } else if (status === '+') {
      statusText = '已添加';
    } else {
      continue; // 如果状态不是 '+' 或 '-'，则跳过
    }

    // 打印行
    const row = [
      statusText.padEnd(colWidths[0]),
      String(lineNumber).padEnd(colWidths[1]),
      content.padEnd(colWidths[2]),
    ].join(' | ');

    console.log(row);
    lineNumber++;
  }
}

function promptSync(question): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

const MODEL = 'o1-mini';
const client = openAi;
export const CREATE_SYSTEM_PROMPT = `你是一个先进的 o1 工程师，旨在根据用户的指示创建文件和文件夹。你的主要目标是生成要创建的文件的内容，以代码块的形式提供。每个代码块应指定它是文件还是文件夹，以及它的路径。

当给定用户请求时，执行以下步骤：

1. 理解用户请求：仔细解释用户想要创建的内容。
2. 生成创建指令：提供每个要创建的文件的内容，使用适当的代码块。每个代码块应以特殊注释行开始，指明它是文件还是文件夹，以及它的路径。
3. 你创建完整功能的代码文件，而不仅仅是片段。没有近似或占位符。完整的工作代码。

重要提示：你的响应必须仅包含代码块，没有额外的文本。不要在代码块外使用 Markdown 格式。使用以下格式作为特殊注释行。不要包含任何解释或附加文本：

对于文件夹：
\`\`\`
### FOLDER: path/to/folder
\`\`\`

对于文件：
\`\`\`language
### FILE: path/to/file.extension
文件内容在这里...
\`\`\`

确保每个文件和文件夹都被正确指定，以便脚本可以无缝创建。`;

export const CODE_REVIEW_PROMPT = `你是一个专家代码审查员。你的任务是分析提供的代码文件并提供全面的代码审查。对于每个文件，考虑：

1. 代码质量：评估可读性、可维护性和遵循最佳实践的程度
2. 潜在问题：识别错误、安全漏洞或性能问题
3. 建议：提供具体的改进建议

将你的审查格式如下：
1. 开始时简要概述所有文件
2. 对于每个文件，提供：
   - 文件目的的摘要
   - 关键发现（正面和负面）
   - 具体建议
3. 结束时提供对代码库的总体建议

你的审查应该详细但简洁，专注于代码的最重要方面。`;

const EDIT_INSTRUCTION_PROMPT = `你是一个先进的 o1 工程师，旨在分析文件并根据用户请求提供编辑指令。你的任务是：

1. 理解用户请求：仔细解释用户希望通过修改实现的目标。
2. 分析文件：审查提供的文件内容。
3. 生成编辑指令：提供清晰的逐步说明，说明如何修改文件以满足用户请求。

你的响应应采用以下格式：

\`\`\`
File: [file_path]
Instructions:
1. [第一条编辑指令]
2. [第二条编辑指令]
...
\`\`\`

只提供需要更改的文件的指令。要具体和清晰。`;

const APPLY_EDITS_PROMPT = `
使用另一个 AI 提供的编辑指令重写整个文件或多个文件。

确保从头到尾重写整个内容，包含指定的更改。

# 步骤

1. **接收输入：** 获取文件和编辑指令。文件可以是各种格式（例如，.txt，.docx）。
2. **分析内容：** 理解文件的内容和结构。
3. **审查指令：** 仔细检查编辑指令以理解所需的更改。
4. **应用更改：** 从头到尾重写文件的整个内容，包含指定的更改。
5. **验证一致性：** 确保重写的内容保持逻辑一致性和连贯性。
6. **最终审查：** 进行最终检查以确保遵循了所有指令，重写的内容符合质量标准。
7. 不要包含任何解释、附加文本或代码块标记（例如 \`\`\`html 或 \`\`\`）。

将输出作为完全重新编写的文件。
绝不要在文件的开头或结尾添加任何代码块标记（例如 \`\`\`html 或 \`\`\`）。 
`;

export const PLANNING_PROMPT = `你是一个 AI 规划助手。你的任务是根据用户的请求创建一个详细的计划。考虑任务的各个方面，将其分解为步骤，并提供一个全面的实现策略。你的计划应清晰、可操作且全面。`;

@Injectable()
export class O1Service {
  private lastAiResponse: string | null = null;
  private conversationHistory: string[] = [];

  constructor() {}

  private isBinaryFile(filePath: string): boolean {
    try {
      const chunk = fs.readFileSync(filePath, { encoding: 'binary' });

      if (chunk.includes('\0')) return true;

      const textCharacters = new Set([
        ...Array.from({ length: 0x100 }, (_, i) => i).filter(
          (i) => (i >= 7 && i <= 13) || i === 27 || (i >= 0x20 && i < 0x100),
        ),
      ]);
      const nonText = Array.from(chunk).filter(
        (char) => !textCharacters.has(char.charCodeAt(0)),
      );

      return nonText.length / chunk.length > 0.3;
    } catch (e) {
      console.error(`读取文件 ${filePath} 时出错: ${e}`);
      return true;
    }
  }

  private loadGitignorePatterns(directory: string): string[] {
    const gitignorePath = path.join(directory, '.gitignore');
    const patterns: string[] = [];

    if (fs.existsSync(gitignorePath)) {
      const lines = fs.readFileSync(gitignorePath, 'utf-8').split('\n');
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          patterns.push(trimmedLine);
        }
      }
    }
    return patterns;
  }

  private shouldIgnore(filePath: string, patterns: string[]): boolean {
    return patterns.some((pattern) => fnmatch.fnmatch(filePath, pattern));
  }

  private addFileToContext(
    filePath: string,
    addedFiles: Record<string, string>,
    action: string = '到聊天上下文',
  ): void {
    const excludedDirs = new Set([
      '__pycache__',
      '.git',
      'node_modules',
      'venv',
      'env',
      '.vscode',
      '.idea',
      'dist',
      'build',
      '__mocks__',
      'coverage',
      '.pytest_cache',
      '.mypy_cache',
      'logs',
      'temp',
      'tmp',
      'secrets',
      'private',
      'cache',
      'addons',
    ]);

    const gitignorePatterns = this.loadGitignorePatterns('.');

    if (fs.existsSync(filePath)) {
      if (Array.from(excludedDirs).some((exDir) => filePath.includes(exDir))) {
        console.log(`跳过排除目录文件: ${filePath}`);
        console.info(`跳过排除目录文件: ${filePath}`);
        return;
      }

      if (this.shouldIgnore(filePath, gitignorePatterns)) {
        console.log(`跳过与 .gitignore 模式匹配的文件: ${filePath}`);
        console.info(`跳过与 .gitignore 模式匹配的文件: ${filePath}`);
        return;
      }

      if (this.isBinaryFile(filePath)) {
        console.log(`跳过二进制文件: ${filePath}`);
        console.info(`跳过二进制文件: ${filePath}`);
        return;
      }

      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        addedFiles[filePath] = content;
        console.log(`已添加 ${filePath} ${action}.`);
        console.info(`已添加 ${filePath} ${action}.`);
      } catch (e) {
        console.log(`读取文件 ${filePath} 时出错: ${e}`);
        console.error(`读取文件 ${filePath} 时出错: ${e}`);
      }
    } else {
      console.log(`错误: ${filePath} 不是一个文件。`);
      console.error(`${filePath} 不是一个文件。`);
    }
  }

  async applyModifications(newContent: string, filePath: string) {
    try {
      const oldContent = fs.readFileSync(filePath, 'utf-8');

      if (oldContent.trim() === newContent.trim()) {
        console.log(`在 ${filePath} 中未检测到更改`);
        return true;
      }

      this.displayDiff(oldContent, newContent, filePath);

      const answer = await promptSync(
        `将这些更改应用于 ${filePath} 吗？（是/否）： `,
      );
      const prompt = answer.trim().toLowerCase();
      if (prompt === '是') {
        fs.writeFileSync(filePath, newContent);
        console.log(`成功将修改应用于 ${filePath}。`);
        console.info(`成功将修改应用于 ${filePath}。`);
        return true;
      } else {
        console.log(`未将更改应用于 ${filePath}。`);
        console.info(`用户选择不将更改应用于 ${filePath}。`);
        return false;
      }
    } catch (e) {
      console.log(`在应用修改 ${filePath} 时发生错误: ${e}`);
      console.error(`在应用修改 ${filePath} 时发生错误: ${e}`);
      return false;
    }
  }

  private displayDiff(
    oldContent: string,
    newContent: string,
    filePath: string,
  ): void {
    const diff = difflib.unifiedDiff(
      oldContent.split('\n'),
      newContent.split('\n'),
      {
        fromFile: `a/${filePath}`,
        toFile: `b/${filePath}`,
        lineterm: '',
        n: 5,
      },
    );

    if (diff.length === 0) {
      console.log(`在 ${filePath} 中未检测到更改`);
      return;
    }

    Table(diff);
  }

  getCodeBlockFromMarkdown(content: string, type: string = '.*') {
    const parser = String.raw(
      { raw: ['```(', ')[\\n|\\s]((\\s|\\S)*?)```'] },
      `${type.toLowerCase()}|${type.toLocaleUpperCase()}`,
    );
    const blocks = new RegExp(parser, 'g');

    let matches;
    const results: Record<string, string[]> = {};

    while ((matches = blocks.exec(content)) !== null) {
      const type = matches[1];
      if (!results[type]) {
        results[type] = [];
      }
      results[type].push(matches[2]); // 提取每个 \$2
    }

    return results;
  }

  applyCreationSteps(
    creationResponse: string,
    addedFiles: Record<string, string>,
    retryCount: number = 0,
  ): boolean {
    const maxRetries = 3;
    try {
      const codeBlocks = flatten(
        values(this.getCodeBlockFromMarkdown(creationResponse)),
      );
      if (!codeBlocks) throw new Error('在 AI 响应中未找到代码块。');

      console.log('成功提取代码块:');
      console.info('成功从创建响应中提取代码块。');

      for (const code of codeBlocks) {
        const infoMatch = code.trim().match(/### (FILE|FOLDER): (.+)/);

        if (infoMatch) {
          const itemType = infoMatch[1];
          const filePath = infoMatch[2];

          if (itemType === 'FOLDER') {
            // 创建文件夹
            fs.mkdirSync(filePath, { recursive: true });
            console.log(`已创建文件夹: ${filePath}`);
            console.info(`已创建文件夹: ${filePath}`);
          } else if (itemType === 'FILE') {
            const fileContent = code.replace(/### FILE: .+\n/, '').trim();

            // 创建必要的目录
            const directory = path.dirname(filePath);
            if (directory && !fs.existsSync(directory)) {
              fs.mkdirSync(directory, { recursive: true });
              console.log(`已创建文件夹: ${directory}`);
              console.info(`已创建文件夹: ${directory}`);
            }

            // 将内容写入文件
            fs.writeFileSync(filePath, fileContent, { encoding: 'utf-8' });
            console.log(`已创建文件: ${filePath}`);
            console.info(`已创建文件: ${filePath}`);
          }
        } else {
          console.log('错误: 无法从代码块中确定文件或文件夹信息。');
          console.error('无法从代码块中确定文件或文件夹信息。');
          continue;
        }
      }

      return true;
    } catch (e) {
      if (retryCount < maxRetries) {
        console.log(`错误: ${e.message} 正在重试...（尝试 ${retryCount + 1}）`);
        console.warn(
          `创建解析失败: ${e.message}。正在重试...（尝试 ${retryCount + 1}）`,
        );
        const errorMessage = `${e.message} 请使用指定格式再次提供创建指令。`;
        setTimeout(async () => {
          const newResponse = await this.chatWithAI(
            errorMessage,
            false,
            addedFiles,
          );
          if (newResponse) {
            return this.applyCreationSteps(
              newResponse,
              addedFiles,
              retryCount + 1,
            );
          } else {
            return false;
          }
        }, Math.pow(2, retryCount) * 1000);
      } else {
        console.log(`在多次尝试后解析创建指令失败: ${e.message}`);
        console.error(`在多次尝试后解析创建指令失败: ${e.message}`);
        console.log('未能解析的创建响应:');
        console.log(creationResponse);
        return false;
      }
    }
  }

  parseEditInstructions(response: string): Record<string, string> {
    const instructions: Record<string, string> = {}; // 存储文件及其对应的编辑指令
    let currentFile: string | null = null; // 当前处理的文件名
    const currentInstructions: string[] = []; // 当前文件的指令列表

    for (const line of response.split('\n')) {
      if (line.startsWith('File: ')) {
        // 检查是否为文件行
        if (currentFile) {
          instructions[currentFile] = currentInstructions.join('\n'); // 保存当前文件的指令
        }
        currentFile = line.slice(6).trim(); // 更新当前文件名
        currentInstructions.length = 0; // 清空当前指令列表
      } else if (line.trim() && currentFile) {
        // 检查是否为有效指令行
        currentInstructions.push(line.trim()); // 添加指令到当前指令列表
      }
    }

    if (currentFile) {
      instructions[currentFile] = currentInstructions.join('\n'); // 保存最后一个文件的指令
    }

    return instructions; // 返回所有文件及其指令
  }

  async applyEditInstructions(
    editInstructions: Record<string, string>,
    originalFiles: Record<string, string>,
  ) {
    const modifiedFiles: Record<string, string> = {};
    for (const filePath in originalFiles) {
      const content = originalFiles[filePath];
      if (filePath in editInstructions) {
        const instructions = editInstructions[filePath];
        const prompt = `${APPLY_EDITS_PROMPT}\n\n原始文件: ${filePath}\n内容:\n${content}\n\n编辑指令:\n${instructions}\n\n更新后的文件内容:`;
        const response = await this.chatWithAI(prompt, true);
        if (response) {
          modifiedFiles[filePath] = response.trim();
        }
      } else {
        modifiedFiles[filePath] = content; // 该文件没有更改
      }
    }
    return modifiedFiles;
  }

  async chatWithAI(
    userMessage: string,
    isEditRequest: boolean = false,
    addedFiles: Record<string, string> = {},
    retryCount: number = 0,
  ) {
    try {
      // 包含添加的文件内容和对话历史
      if (Object.keys(addedFiles).length > 0) {
        let fileContext = '已添加的文件:\n';
        for (const filePath in addedFiles) {
          fileContext += `文件: ${filePath}\n内容:\n${addedFiles[filePath]}\n\n`;
        }
        userMessage = `${fileContext}\n${userMessage}`;
      }

      // 包含对话历史
      if (!isEditRequest) {
        const history = this.conversationHistory
          .map((msg, index) => `用户: ${msg}`)
          .join('\n');
        if (history) {
          userMessage = `${history}\n用户: ${userMessage}`;
        }
      }

      // 准备消息内容
      const messageContent = isEditRequest
        ? `${EDIT_INSTRUCTION_PROMPT}\n\n用户请求: ${userMessage}`
        : userMessage;

      const messages = [
        {
          role: 'user',
          content: messageContent,
        } as ChatCompletionUserMessageParam,
      ];

      if (isEditRequest && retryCount === 0) {
        console.log('正在分析文件并生成修改...');
        console.info('正在将编辑请求发送给 AI。');
      } else if (!isEditRequest) {
        console.log('o1 工程师正在思考...');
        console.info('正在将一般查询发送给 AI。');
      }

      const response = await client.chat.completions.create({
        model: MODEL,
        messages: messages,
        // max_tokens: 60000,
      });

      console.info('已收到 AI 响应。');
      this.lastAiResponse = response.choices[0].message.content;

      if (!isEditRequest) {
        // 更新对话历史
        this.conversationHistory.push(userMessage);
        this.conversationHistory.push(this.lastAiResponse);
        if (this.conversationHistory.length > 20) {
          this.conversationHistory = this.conversationHistory.slice(-20);
        }
      }

      return this.lastAiResponse;
    } catch (e) {
      console.log(`与 OpenAI 通信时发生错误: ${e}`);
      console.error(`与 OpenAI 通信时发生错误: ${e}`);
      return null;
    }
  }
}

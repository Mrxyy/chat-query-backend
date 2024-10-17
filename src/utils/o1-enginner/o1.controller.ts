import { Controller, Post, Body } from '@nestjs/common';
import {
  CODE_REVIEW_PROMPT,
  CREATE_SYSTEM_PROMPT,
  O1Service,
  PLANNING_PROMPT,
} from './o1.service';

@Controller('o1')
export class O1Controller {
  constructor(private readonly o1Service: O1Service) {}

  @Post('create')
  async createFiles(@Body() createDto: { prompt: string }) {
    const { prompt } = createDto;
    const addedFiles = {};
    const creationResponse = await this.o1Service.chatWithAI(
      `${CREATE_SYSTEM_PROMPT}\n\n用户请求: ${prompt}`,
    );

    if (creationResponse) {
      const success = this.o1Service.applyCreationSteps(
        creationResponse,
        addedFiles,
      );
      if (success) {
        return { message: '文件创建成功', files: addedFiles };
      } else {
        return { message: '文件创建失败' };
      }
    }
    return { message: '生成响应失败' };
  }

  @Post('edit')
  async editFiles(@Body() editDto: { instructions: string }) {
    const { instructions } = editDto;
    const originalFiles = {}; // 这里应该从某个地方获取原始文件内容
    const editInstructions = this.o1Service.parseEditInstructions(instructions);
    const modifiedFiles = await this.o1Service.applyEditInstructions(
      editInstructions,
      originalFiles,
    );

    return { message: '文件编辑完成', modifiedFiles };
  }

  @Post('review')
  async reviewCode(@Body() reviewDto: { code: string }) {
    const { code } = reviewDto;
    const reviewResponse = await this.o1Service.chatWithAI(
      `${CODE_REVIEW_PROMPT}\n\n代码:\n${code}`,
    );

    return { message: '代码审查完成', review: reviewResponse };
  }

  @Post('plan')
  async createPlan(@Body() planDto: { task: string }) {
    const { task } = planDto;
    const planResponse = await this.o1Service.chatWithAI(
      `${PLANNING_PROMPT}\n\n任务:\n${task}`,
    );

    return { message: '计划生成完成', plan: planResponse };
  }

  @Post('apply-edits')
  async applyEdits(@Body() applyDto: { filePath: string; newContent: string }) {
    const { filePath, newContent } = applyDto;
    const success = await this.o1Service.applyModifications(
      newContent,
      filePath,
    );

    return { message: success ? '更改已成功应用' : '更改应用失败' };
  }
}

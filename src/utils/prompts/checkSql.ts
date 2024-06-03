import { parse } from 'path';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from '@langchain/core/prompts';
import { z } from 'zod';
import { getChatOpenAi } from '../Ai';
import { RunnableSequence } from '@langchain/core/runnables';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
const model = getChatOpenAi();

const zodSchema = z.object({
  answerMeetsRequirements: z
    .boolean()
    .describe('判断沟通记录中给出的答案是否满足你最后一条记录中的需求'),
  why: z
    .string()
    .describe(
      '你现在是用户,下一次你将输入什么内容(中文)保证上面你最后一条记录中的需求能被正确的被理解。',
    ),
});

export const parser = StructuredOutputParser.fromZodSchema(zodSchema);
const prompt = ChatPromptTemplate.fromMessages([
  SystemMessagePromptTemplate.fromTemplate(`沟通记录:\n
    {messageList}
  `),
  HumanMessagePromptTemplate.fromTemplate(
    `你需要谨慎查看这个沟通记录，你扮演对话中的用户, 对比需求和回答,以判断你最后一条记录中的需求是否被正确理解且能被正确解决。
    如果需求和答案没有对齐,你现在是用户,下一次你将输入什么内容(中文)保证上面你最后一条记录中的需求能被正确的被理解。{format_instructions}`,
  ),
]);

export const GET_CHECK_RESULT = RunnableSequence.from([prompt, model, parser]);

import { PromptTemplate } from '@langchain/core/prompts';
import { getChatOpenAi } from '../Ai';
const model = getChatOpenAi();

const prompt = PromptTemplate.fromTemplate(
  `作为一个数据模型业务分析专家，您需要根据当前数据模型(DBML格式)进行精确的分析,根据模型的提供的信息，分析该模型并输出简要描述。当前数据库模型为：
<dbml>
{sql}
</dbml>`,
);

export const GET_SCHEMA_INFO = prompt.pipe(model);

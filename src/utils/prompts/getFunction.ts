import { OpenAI } from 'langchain/llms/openai';
import { PromptTemplate } from 'langchain/prompts';
import { LLMChain } from 'langchain/chains';
import { getOpenAi } from '../Ai';
const model = getOpenAi();

const prompt = PromptTemplate.fromTemplate(
  `作为js代码编程专家，你需要分析我的需求，请你编写一个函数处理我的需求并返回我的需要的结果,这个是固定第一个入参：
    {data}。
  需求:
    {need}。
  请按照需求生成代码之后,将结果按照以下模版中的标签中的内容进行分析并且替换模版中标签的内容(必须保留标签)作为最后结果输出:
    <FunctionDescription>该函数描述说明</FunctionDescription>
    <FunctionName>函数名称</FunctionName>
    <FunctionCode>函数代码</FunctionCode>
    <FunctionExample>函数实例</FunctionExample>
  `,
);

export const GET_FUNCTION_CODE_CHAIN = new LLMChain({ llm: model, prompt });

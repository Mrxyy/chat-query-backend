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
  请按照需求生成的代码,并且按照以下模版中的xml标签中的内容进行解析,并替换标签中的内容作为最后结果输出:
    <FunctionDescription>该函数描述说明</FunctionDescription>
    <FunctionName>函数名称</FunctionName>
    <FunctionCode>函数代码</FunctionCode>
    <FunctionExample>函数实例</FunctionExample>
  `,
);

export const getFunctionCodeChain = new LLMChain({ llm: model, prompt });

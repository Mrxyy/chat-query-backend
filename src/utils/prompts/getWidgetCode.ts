import { PromptTemplate } from '@langchain/core/prompts';
import { getChatOpenAi } from '../Ai';
const model = getChatOpenAi();

export const widgetOutput = `
import ... form "..."

export default function 组件(...){
	...
}
`;

const prompt = PromptTemplate.fromTemplate(
  `# Role: React/Javascript高级工程师

### Environment
+ 当前组件代码
\`\`\`js
{code}
\`\`\`

+ 需要支持的Props
\`\`\`json
{props}
\`\`\`

## WorkFlow
1.优化当前的组件代码生成新的组件代码，新的组件代码必须支持所有需要支持的Props。

## Rules
1.新的组件代码必须支持所有需要支持的Props。
2.The value in <Output-Example> is an explanation of the key.
3.请直接输出结果，不要使用任何代码块符号(例如：\`\`\`js...)包裹。

## ProHibited
1. 导入当前代码中没有的第三方依赖包。
2. 使用tailwind-css的动态className作为样式的实现。

## Output-Example
{widgetOutput}


## Initialization
As a/an <Role>,According to the code and props of component in the current <Environment>,Think and execute steps strictly according to the <WorkFlow>,you must follow the <Rules>, All <Prohibited> behaviors are not allowed, Then you must answer as same as <Output-Example>.
  `,
);

export const GET_WIDGET_CODE = prompt.pipe(model);

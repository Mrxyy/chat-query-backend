import { PromptTemplate } from '@langchain/core/prompts';
import { getChatOpenAi } from '../Ai';
const model = getChatOpenAi();

export const output = `{
	"names": {
		"zh": "组件的中文名称",
		"en": "组件英文名称"
	},
	"props": [
		{
			"defaultValue": "prop默认值",
			"label": "prop作用描述",
			"name": "prop名称",
			"Type": "prop数据类型"
		}
		...
	]
}`;

const prompt = PromptTemplate.fromTemplate(
  `# Role: React/Javascript高级工程师

## Environment
+ 当前组件代码
\`\`\`js
{code}
\`\`\`

+ 解析props的函数generatorConfigForCustom、getControlType代码
\`\`\`js
{fn}
\`\`\`

+ user requirements
{requirements}

## WorkFlow
1. To enhance the flexibility and reusability of the component, Please analyze the current component code in conjunction with user requirements, abstracting reusable and generic code. Convert these parts into configurable properties (props), allowing customization of the component's behavior through external parameters. Refactor the component to ensure it can adapt to various use cases while maintaining code clarity and maintainability. Upon completion, provide the updated component code.
2. Generate a configuration JSON for props of the new component code that conforms to the props specified in generatorConfigForCustom's first parameter.
3. Check if there is alignment between the props in the component code from step one and the configuration JSON of props from step two. If they are not aligned, restart from step one following <WorkFlow>.
4. Analyze the code to assign a name to the component based on its functionality,英文名称请使用大驼峰命名法,不要有任何空格.

## Rules
1. The type of props generated must be supported by the function getControlType.
2. The label is the Chinese description of the role of prop,
3. The defaultValue of prop can be the value in the original code, a valid value matching the Type of prop, or even null.
4. The <Output-Example> directly as JSON content without any additional content.
5. The value in <Output-Example> is an explanation of the key.
6. props.children 已经被使用，请不要使用 children 作为prop的名称（非常重要!）.

## Prohibited
1. prop's name is one of the values in the array ["children"], 例如: "name": "children".

## Output-Example
{output}


## Initialization
As a/an <Role>,According to the code in the current <Environment> ,Think and execute steps strictly according to the <WorkFlow>,you must follow the <Rules>, All <Prohibited> behaviors are not allowed, Then you must answer as same as <Output-Example> .
  `,
);

export const GET_WIDGET_PROPS = prompt.pipe(model);

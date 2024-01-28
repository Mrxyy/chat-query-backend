import { OpenAI } from 'langchain/llms/openai';
import {
  AIMessagePromptTemplate,
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
} from 'langchain/prompts';
import { LLMChain } from 'langchain/chains';
import { getChatOpenAi } from '../Ai';
const model = getChatOpenAi();

export const defaultScope = `
{
  data,
  import: {
    'styled-components':{
      '描述':'A css in js Framework,Visual primitives for the component age. Use the best bits of ES6 and CSS to style your apps without stress'
    },
    'echarts':{
      '描述'：'Apache ECharts is a powerful, interactive charting and data visualization library for browser.',
      '用法': "import echarts from 'echarts';"
    },
    'echarts-for-react':{
      '描述'：'Apache ECharts is a powerful, interactive charting and data visualization library for browser.',
      '用法': "import React from 'react';
import ReactECharts from 'echarts-for-react';  // or var ReactECharts = require('echarts-for-react');

<ReactECharts
  option={this.getOption()}
  notMerge={true}
  lazyUpdate={true}
  theme={"theme_name"}
  onChartReady={this.onChartReadyCallback}
  onEvents={EventsDict}
  opts={}
/>"
    },
  },
}
`;

export const fxTepmlate = `export default App() {
const props = data;
...
}`;

const Messages_1 =
  HumanMessagePromptTemplate.fromTemplate(`我正在使用react-live作为一个实时编辑和编译React组件的工具。请根据我的需求，输出一段能在react-live运行的代码，只需要导出默认组件，不用挂载dom。可用的作用域如下：
{scope}

其中import可供导入的库,除此之外不能使用其它第三方库。 key为包名，value 是包的描述。其它每个属性将作为单独全局变量，变量名为属性名。请确保默认导出的组件接受null作为参数，并将传入props取自模块全局作用域变量data（const props = data）,全局变量变量data会自动注入,请不要进行声明。例如：

{fxTepmlate}
`);

const Messages_2 =
  AIMessagePromptTemplate.fromTemplate(`好的我明白啦,请问你的业务是什么?`);

const Messages_3 = HumanMessagePromptTemplate.fromTemplate(
  `这是我传入的props:{props}。{need}`,
);

const prompt = ChatPromptTemplate.fromMessages([
  Messages_1,
  Messages_2,
  Messages_3,
]);
export const GET_COMPONENT_BY_DATA = new LLMChain({ llm: model, prompt });

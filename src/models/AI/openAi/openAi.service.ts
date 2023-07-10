import { defaultScope, fxTepmlate } from './../../../utils/prompts/reactLive';
import { OpenAI } from 'langchain/llms/openai';
// import { PromptTemplate } from 'langchain/prompts';
// import { OpenAIEmbeddings } from 'langchain/embeddings/openai';

// import { APIChain } from 'langchain/chains';

import { DataSource } from 'typeorm';
import { SqlDatabase } from 'langchain/sql_db';
import { createSqlAgent, SqlToolkit } from 'langchain/agents/toolkits/sql';
// import { SqlDatabaseChain } from 'langchain/chains';
import { get, nth } from 'lodash';
import { Tool } from 'langchain/tools';
import {
  disableConstraints,
  enableConstraints,
} from 'src/utils/knex/executeSQLWithDisabledForeignKeys';
import { GET_COMPONENT_BY_DATA } from 'src/utils/prompts/reactLive';
import { extractCodeBlocks } from 'src/utils/parse/getCode';
import { GET_FUNCTION_CODE_CHAIN } from 'src/utils/prompts/getFunction';
export const openAIApiKey = process.env['OPEN_AI_API_KEY'];

console.log(Tool);
export class TestSqlTool extends Tool {
  name = 'execute-sql';

  db: SqlDatabase;

  constructor(db: SqlDatabase) {
    super();
    this.db = db;
  }

  /** @ignore */
  async _call(input: string) {
    try {
      await this.db.appDataSource.query(disableConstraints['mysql']);
      await this.db.appDataSource.query(input);
      await this.db.appDataSource.query(enableConstraints['mysql']);
      return input;
    } catch (error) {
      return `${error}`;
    }
  }
  // 此工具的输入是一个逗号分隔的表列表，输出是这些表的模式和示例行。请务必先调用list-tables-sql来确保这些表实际存在！
  description = `
  Input to this tool is specifically for executing SQL DDL statements and insert, update, delete statements and only one SQL statement can be executed each time.
  `;
}

export class OpenAIService {
  async test() {
    // this.run();
  }

  async run() {
    const model = new OpenAI(
      {
        modelName: 'gpt-4-0613',
        openAIApiKey: openAIApiKey,
        temperature: 0,
      },
      {
        basePath:
          'https://chat-gpt-next-qwn676aj7-mrxyy.vercel.app/api/openai/v1/',
      },
    );

    const datasource = new DataSource({
      type: 'mysql',
      host: '127.0.0.1',
      port: 3306,
      username: 'root',
      password: '123789xyy',
      database: 'test-10',
      connectorPackage: 'mysql2',
    });

    const db = await SqlDatabase.fromDataSourceParams({
      appDataSource: datasource,
    });

    console.log(db);

    const toolkit = new SqlToolkit(db, model);

    toolkit.tools.push(new TestSqlTool(db));

    toolkit.dialect = 'mysql';
    const executor = createSqlAgent(model, toolkit, {
      prefix: `You are an agent designed to interact with a SQL database.
Given an input question, create a syntactically correct {dialect} query to run, then look at the results of the query and return the answer.
Unless the user specifies a specific number of examples they wish to obtain, always limit your query to at most {top_k} results using the LIMIT clause.
You can order the results by a relevant column to return the most interesting examples in the database.
Never query for all the columns from a specific table, only ask for a the few relevant columns given the question.
You have access to tools for interacting with the database.
Only use the below tools. Only use the information returned by the below tools to construct your final answer.
You MUST double check your query before executing it. If you get an error while executing a query, rewrite the query and try again.


If the question does not seem related to the database, just return "I don't know" as the answer.`,
    });

    // const chain = new SqlDatabaseChain({
    //   llm: model,
    //   database: db,
    //   sqlOutputKey: 'sql',
    // });

    const result = await executor.call({
      input: '每个表中都插入一条假数据,id 为自增字段',
    });

    // const res = await chain.call({
    //   query: '查出所有订单对应的用户和对应地址？',
    // });

    console.log(get(nth(result.intermediateSteps, -1), 'observation'));

    await datasource.destroy();
  }

  async getReactLiveCode(props: Record<string, any>, need: string) {
    const result = await GET_COMPONENT_BY_DATA.call({
      props: JSON.stringify(props),
      need,
      scope: defaultScope,
      fxTepmlate: fxTepmlate,
    });

    return {
      code: extractCodeBlocks(result.text)[0],
    };
  }

  async getFunctionCode(data: Record<string, any>, need: string) {
    const result = await GET_FUNCTION_CODE_CHAIN.call({
      data: JSON.stringify(data),
      need,
    });

    return {
      code: result.text,
    };
  }
}

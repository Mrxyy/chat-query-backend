import { bind, get, mapValues } from 'lodash';
import SequelizeAuto from 'sequelize-auto-model';
import {
  ollamaOpenAi,
  cloudflareOpenAi,
  huggingfaceOpenAi,
} from './utils/Ai/openAi-native';
import { readFileSync } from 'fs';
import { join } from 'path';
import { extractCodeBlocks } from './utils/parse/getCode';
import { parse } from 'best-effort-json-parser';
import { Sequelize } from 'sequelize';

export function printModelDDL(
  sequelize: Sequelize,
  dbHost: string,
  dbPort: number,
) {
  const queryInterface = sequelize.getQueryInterface();
  queryInterface.showAllTables({}).then(async (tables) => {
    const options: any = { caseFile: 'c', caseModel: 'c', caseProp: 'c' };
    const sequelizeDemo = new Sequelize({
      dialect: 'mysql',
      host: dbHost,
      port: dbPort,
      username: 'root',
      password: '123789',
      database: 'DD3',
    });
    const auto = new SequelizeAuto(sequelizeDemo, null, null, options);
    const tableData = await auto.build();
    const modelSql = [];
    const queryGenerator: any = queryInterface.queryGenerator;
    const keys = await queryInterface.getForeignKeysForTables(tables);

    console.log(keys);

    for (const tableName in tableData.tables) {
      let attributes = tableData.tables[tableName];
      attributes = mapValues(attributes, (attribute) =>
        bind(
          get(queryInterface, 'normalizeAttribute', (attrs) => false),
          queryInterface,
        )(attribute),
      );

      attributes = queryGenerator.attributesToSQL(attributes, {
        table: tableName,
        context: 'createTable',
        withoutForeignKeyConstraints: false,
      });
      modelSql.push(
        queryGenerator.createTableQuery(tableName, attributes, {
          withoutForeignKeyConstraints: false,
        }),
      );
    }
    console.log(modelSql.join('\n'));
  });
}

export async function functionCallTest() {
  const functionCall = `[
    {
      type: 'function',
      function: [
        {
          name: 'saveExecuteSqlInfo',
          description:
            'Unique and mandatory execution (no other functions can be executed), storing the key information required to execute this requirement',
          parameters: {
            type: 'object',
            properties: {
              simulation: {
                type: 'boolean',
                description:
                  'This requirement needs you to generate simulated data, with true or false options.',
              },
              sql: {
                type: 'string',
                description:
                  "If the user's requirements include generating simulated data, you should generate this data first and ensure that it is included in the SQL output.,The SQL statement required to execute the operation must adhere to standard syntax.  Additionally, the data inserted must comply with the existing table structure.",
              },
              variablesArr: {
                type: 'array',
                description:
                  'Execute SQL statement containing an array of variables and their descriptions: If the requirement specifies simulated data, the parameter should be null.',
                items: {
                  type: 'object',
                  properties: {
                    variable: {
                      type: 'string',
                      description:
                        'The name of the variables.The information that needs to be filled in by the user should be treated as variables, and the variable names must be enclosed between $ signs.',
                    },
                    varDescription: {
                      type: 'string',
                      description: 'The description of the variable',
                    },
                  },
                  required: ['variable', 'varDescription'],
                },
              },
              queryName: {
                type: 'string',
                description: 'The name of the query',
              },
              queryDescription: {
                type: 'string',
                description: 'The description of the query',
              },
            },
            required: ['sql', 'queryName', 'queryDescription', 'simulation'],
          },
        },
      ],
    },
  ]`;

  const chatCompletion = await ollamaOpenAi.chat.completions.create({
    messages: [
      {
        role: 'system',
        content:
          '作为一个数据库模型业务分析专家:擅长分析各种业务且精通各种数据库语言。',
      },
      {
        role: 'user',
        content:
          '作为一个数据库模型业务分析专家，您需要根据当前数据库模型(DBML格式)生成对应的 Mysql 数据库可执行的 SQL 文本，并列出执行该 SQL 所需的变量及其解释，最后为此条查询命名。当前数据库模型为：\n\n```dbml\nTable "classrooms" {\n  "id" int [pk, increment]\n  "name" varchar\n  "capacity" int\n  "teacher_id" int\n}\n\nTable "students" {\n  "id" int [pk, increment]\n  "name" varchar\n  "age" int\n  "classroom_id" int\n}\n\nTable "teachers" {\n  "id" int [pk, increment]\n  "name" varchar\n  "subject" varchar\n}\n\nRef:"classrooms"."id" < "students"."classroom_id"\n\nRef:"teachers"."id" < "classrooms"."teacher_id"\n\n```\n\n请将以下中的xml标签中的内容进行分析(用户需要填入的信息作为变量,如果需要变量:变量的命名必须请放在$和$之间,例如：$tab$、$name$...)。:\n\n根据您提供的数据库模型，已为您生成查询:\n<sql>按照需要生产的sql语句</sql>\n\n执行所需变量:\n\n判断解决当前问题的查询执行时是否需要变量。若不需要变量，则无需提供任何信息。 若条件成立,请使用：\n<var>$执行SQL所需变量名称$</var>: <varDescription>变量解释</varDescription>\n\n查询命名和描述:\n<queryName>查询名称</queryName>\n<queryDescription>查询描述</queryDescription>\n',
      },
      {
        role: 'system',
        content:
          '你第一步应该思考分析：用户是否指定生成模拟数据，如果有，你还需要生成模拟数据,你第二步应该思考分析：用户需求中是否需要变量(例如：生成模拟数据就不需要变量,因为数据由你生成),如果需要变量:变量的命名必须请放在$和$之间,例如："variablesArr": [\n    {\n        "variable": "$variable$",\n        "varDescription": "这个变量的描述"\n    }):\n                    ',
      },
      {
        role: 'assistant',
        content: '好的，我明白了。请问你的业务是什么?',
      },
      {
        role: 'user',
        content: `You have access to the following tools:
\`\`\`json
${functionCall}
\`\`\`

Write 'Action:' followed by a list of actions in JSON that you want to call, e.g.
Action:
\`\`\`json
[
    {
        "tool_name": "tool name (one of [internet_search, directly_answer])",
        "parameters": "the input to the tool"
    }
]
\`\`\`

查出每个班级对应的所有学生。
`,
      },
    ],
    model: 'wangrongsheng/mistral-7b-v0.3-chinese:latest',
    raw: true,
    // model: '@cf/defog/sqlcoder-7b-2',
  } as any);
  console.log(
    parse(
      extractCodeBlocks(
        chatCompletion.choices[0]?.message.content || '',
        'json',
      )[0],
    ),
  );
}
export async function testSqlModel() {
  const filePath = join(__dirname, './utils/Ai/prompts/sqlcoder-3.md');
  const sqlcoderPrompt = readFileSync(filePath, 'utf8');
  const chatCompletion = await ollamaOpenAi.chat.completions.create({
    messages: [{ role: 'user', content: sqlcoderPrompt }],
    model: 'mannix/defog-llama3-sqlcoder-8b',
    // model: '@cf/defog/sqlcoder-7b-2',
  });
  const mysqlSql = await huggingfaceOpenAi.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: `
        ## require
        + According sql:${get(
          chatCompletion,
          'choices[0].message.content',
        )}, The sql only support pg sql currently,Convert to SQL syntax that supports MySQL, please output the SQL directly without any other text.
        ## output
        \`\`\`mysql\`\`\`
        ## example
        select * from table;
        `,
      },
    ],
    model: 'meta-llama/Meta-Llama-3-70B-Instruct',
    // web_search: true,
    // stream: true,
  });
  console.log(get(mysqlSql, 'choices[0].message.content.text'));
}

import { Sequelize } from 'sequelize-typescript';
import { Module } from '@nestjs/common';
import { SChemaModel } from './modules/Schema';
import { SequelizeModule } from '@nestjs/sequelize';
import { Kenx } from './utils/knex';
import { QueriesModel } from './modules/Querys';
import { OpenAIModule } from './modules/AI/openAi';
import { config } from 'dotenv';
import { EventsModule } from './modules/events/events.module';
import { WidgetsModule } from './modules/widgets';
import { FlowNodeModel } from './modules/FlowNode';
import { WorkFlowModel } from './modules/Flow';
import { functionCallTest, testSqlModel } from './Example';
import { ActionModule } from './modules/Action';
import { AppProviderModule } from './AppProvider';
import { DBModule } from './modules/Database';
import { O1 } from './utils/o1-enginner';
import { AuthModule } from './modules/auth';
import { SequelizeDatabaseModule } from './modules/Model';
config();
export const dbHost = process.env['DB_HOST'];
export const dbPort = Number(process.env['DB_PORT']);
export const dbUser = process.env['DB_USER'];
export const dbPassword = process.env['DB_PASSWORD'];

const env = [
  SequelizeModule.forRoot({
    dialect: 'mysql',
    host: dbHost,
    port: dbPort,
    username: dbUser || 'root',
    password: dbPassword || '123789',
    database: 'chat_query',
    autoLoadModels: true,
    synchronize: true,
    // logging: (sql) => {
    // console.log(sql);
    // },
    // sync: {
    //   alter: true, // 设置 alter 为 true
    // },
  }),
];

@Module({
  imports: [
    ...env,
    SChemaModel,
    QueriesModel,
    OpenAIModule,
    EventsModule,
    WidgetsModule,
    FlowNodeModel,
    WorkFlowModel,
    AppProviderModule,
    ActionModule,
    DBModule,
    Kenx,
    O1,
    AuthModule,
    SequelizeDatabaseModule,
  ],
})
export class AppModule {
  constructor(sequelize: Sequelize) {
    // sequelize.sync({
    //   logging: (sql) => {
    //     console.log(sql.replace(sqlPrefix, ''));
    //   },
    // });
    (async () => {
      // functionCallTest();
      // const fn = new Function(
      //   'functionCallTest',
      //   'console.log(functionCallTest)',
      // );
      // eval('console.log(functionCallTest)');
      // fn(functionCallTest);
      // testSqlModel();
    })();
  }
}

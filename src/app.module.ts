import { Sequelize } from 'sequelize-typescript';
import { Module } from '@nestjs/common';
import { SChemaModel } from './models/Schema';
import { SequelizeModule } from '@nestjs/sequelize';
import { Kenx } from './utils/knex';
import { QueriesModel } from './models/Querys';
import { OpenAIModule } from './models/AI/openAi';
import { config } from 'dotenv';
import { EventsModule } from './models/events/events.module';
import { WidgetsModule } from './models/widgets';
import { FlowNodeModel } from './models/FlowNode';
import { WorkFlowModel } from './models/Flow';
import { functionCallTest } from './Example';

config();
export const dbHost = process.env['DB_HOST'];
export const dbPort = Number(process.env['DB_PORT']);

const env = [
  SequelizeModule.forRoot({
    dialect: 'mysql',
    host: dbHost,
    port: dbPort,
    username: 'root',
    password: '123789',
    database: 'chat_query',
    autoLoadModels: true,
    synchronize: true,
    // logging: (sql) => {
    // console.log(sql);
    // },
  }),
];

@Module({
  imports: [
    ...env,
    SChemaModel,
    QueriesModel,
    Kenx,
    OpenAIModule,
    EventsModule,
    WidgetsModule,
    FlowNodeModel,
    WorkFlowModel,
  ],
})
export class AppModule {
  constructor(sequelize: Sequelize) {
    // sequelize.sync({
    //   logging: (sql) => {
    //     console.log(sql.replace(sqlPrefix, ''));
    //   },
    // });
    // (async () => {})();
  }
}

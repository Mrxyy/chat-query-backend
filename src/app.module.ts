import { Sequelize } from 'sequelize-typescript';
import { Module } from '@nestjs/common';
import { SChemaModel } from './models/Schema';
import { SequelizeModule } from '@nestjs/sequelize';
import { Kenx } from './utils/knex';
import { QueriesModel } from './models/Querys';
import { OpenAIModule } from './models/AI/openAi';

const env = [
  SequelizeModule.forRoot({
    dialect: 'mysql',
    host: '139.198.179.193',
    port: 32094,
    username: 'root',
    password: '123789',
    database: 'chat_query',
    autoLoadModels: true,
    synchronize: true,
  }),
];

@Module({
  imports: [...env, SChemaModel, QueriesModel, Kenx, OpenAIModule],
})
export class AppModule {
  constructor(sequelize: Sequelize) {
    // console.log(sequelize, "sequelize实例")
  }
}

import { Sequelize } from 'sequelize-typescript';
import { Module } from '@nestjs/common';
import { SChemaModel } from './models/Schema';
import { SequelizeModule } from '@nestjs/sequelize';
import { Kenx } from './utils/knex';
import { QueriesModel } from './models/Querys';
import { OpenAIModule } from './models/AI/openAi';
import { config } from 'dotenv';
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

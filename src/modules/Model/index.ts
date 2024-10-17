import { SequelizeModule } from '@nestjs/sequelize';
import { ActionModel } from 'src/models/Action.model';
import { DB } from 'src/models/DB.model';
import { DBSchema } from 'src/models/DBSchema.model';
import { FlowNode } from 'src/models/flowNode.model';
import { Workflow } from 'src/models/flow.model';
import { User } from 'src/models/User.model';
import { Schema } from 'src/models/schema.model';
import { SchemaLog } from 'src/models/SchemaLog.model';
import { Widgets } from 'src/models/widgets.model';
import { Global, Module } from '@nestjs/common';
import { Query } from 'src/models/Query.model';

const models = [
  User,
  ActionModel,
  DB,
  DBSchema,
  FlowNode,
  Workflow,
  Schema,
  SchemaLog,
  Widgets,
  Query,
];

const module1 = SequelizeModule.forFeature(models);

@Global() // 将模块标记为全局模块
@Module({
  imports: [module1],
  providers: module1.providers,
  exports: module1.exports,
})
export class SequelizeDatabaseModule {}

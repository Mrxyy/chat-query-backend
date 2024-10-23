import { User } from './../../src/models/User.model';
import { readdirSync } from 'fs';
import * as path from 'path';
import * as jsonConfig from '../database.json';
import { ActionModel } from '../../src/models/Action.model';
import { DBSchema } from '../../src/models/DBSchema.model';
import { DB } from '../../src/models/DB.model';
import { FlowNode } from '../../src/models/flowNode.model';
import { Workflow } from '../../src/models/flow.model';
import { Query } from '../../src/models/Query.model';
import { Schema } from '../../src/models/schema.model';
import { SchemaLog } from '../../src/models/SchemaLog.model';
import { Widgets } from '../../src/models/widgets.model';
import { forEach } from 'lodash';
import { Model, Sequelize } from 'sequelize-typescript';
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = jsonConfig[env];

const allModels = [
  User,
  ActionModel,
  DBSchema,
  DB,
  Workflow,
  FlowNode,
  Query,
  Schema,
  SchemaLog,
  Widgets,
];

const db: {
  sequelize: Sequelize;
  Sequelize: typeof Sequelize;
  User: User & typeof Model;
  ActionModel: ActionModel;
  DBSchema: DBSchema;
  DB: DB;
  Workflow: Workflow;
  FlowNode: FlowNode;
  Query: Query;
  Schema: Schema;
  SchemaLog: SchemaLog;
  Widgets: Widgets;
} = {} as any;

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(
    process.env[config.use_env_variable] as string,
    config,
  );
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config,
  );
}

sequelize.addModels(allModels);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export { sequelize, Sequelize };

export default db;

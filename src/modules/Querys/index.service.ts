import { ActionService } from './../Action/Action.service';
import { Schema } from '../../models/schema.model';
import {
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { KnexContainer } from 'src/utils/knex';
import { Query } from '../../models/Query.model';
import { InjectModel } from '@nestjs/sequelize';
import { DB } from '../../models/DB.model';
import knex from 'knex';
import { generateDbDiagramDsl } from 'src/utils/knex/DB2DBML';
import { get, invoke, map, mapValues, pick } from 'lodash';
import { Knex } from 'knex';
import { executeSQLWithDisabledForeignKeys } from 'src/utils/knex/executeSQLWithDisabledForeignKeys';
import exportDsl from 'src/utils/knex/export-dsl';
import { ExecutionService } from '../Execution/execution.service';
import { Sequelize, SequelizeOptions } from 'sequelize-typescript';
import SequelizeAuto, { TableData } from 'sequelize-auto';

import { importer } from '@dbml/core';
import schemaInspector from 'knex-schema-inspector';
import { dbDrivers } from '../Database/DBTypes';
import { getBatchSqlItems } from 'src/utils/parse/ batchSql';

function pureCode(raw: string): string {
  const codeRegex = /```.*\n([\s\S]*?)\n```/;
  const match = raw.match(codeRegex);
  if (match) {
    const code = match[1];
    return code;
  } else {
    return raw;
  }
}

@Injectable()
export class QueriesService implements OnModuleInit {
  constructor(
    private knex: KnexContainer,
    @InjectModel(Query) private QueryModel: typeof Query,
    @InjectModel(DB) private DbModel: typeof DB,
    @InjectModel(Schema) private SchemaModel: typeof Schema,
    private actionService: ActionService,
    private executor: ExecutionService,
  ) {}
  async executeQuery(
    params: {
      config: Record<string, any>;
      execution: {
        content: string;
        type: string;
      }[];
      dbID: string;
    },
    userId: string,
  ) {
    let db = this.knex.get(params.dbID);
    const dbConfig = await this.DbModel.findByPk(params.dbID);
    if (dbConfig.userId !== userId) {
      throw new UnauthorizedException();
    }
    const { client, host, port, user, password, database }: any = get(
      dbConfig,
      'dataValues.config',
      {},
    );
    if (!db) {
      db = await this.knex.create(
        {
          client: dbDrivers.get(client),
          asyncStackTraces: true,
          debug: true,
          connection: {
            host: host,
            port: port,
            user: user,
            password: password,
            database: database,
          },
        },
        dbConfig.id,
      );
    }
    const { execution = [], config } = params;
    if (db) {
      const results: string[] = [];
      const fx = async ({
        content,
        type,
      }: {
        content: string;
        type: string;
      }) => {
        if (type === 'sql') {
          const sqlArr = getBatchSqlItems(content, client) as string[];

          const params = [];
          const templateSqlArr = [];
          for (let i = 0; i < sqlArr.length; i++) {
            const paramsItem = [];
            templateSqlArr.push(
              pureCode(sqlArr[i]).replace(/\$.*?\$/g, (string) => {
                paramsItem.push(config[string]);
                return '?';
              }),
            );
            params.push(paramsItem);
          }
          const data = await executeSQLWithDisabledForeignKeys(
            db,
            templateSqlArr,
            params,
          );

          return data;
        }
      };
      const data = [];
      for (const item of execution) {
        // 保证执行顺序
        data.push(await fx(item));
      }
      return {
        data,
      };
    }
  }

  async createQuery(schemaId: Schema['id'], userId: string): Promise<Query> {
    return this.QueryModel.create({
      schemaId,
      name: 'unknown',
      content: '',
      userId,
    });
  }
  async createDatabaseAndExecuteDDL(dbConfig, ddl, dbName) {
    // 创建连接到默认数据库的 knex 实例
    const defaultKnex = knex(dbConfig);

    // 根据不同数据库系统的语法，创建数据库
    switch (dbConfig.client) {
      case 'mysql':
      case 'mysql2':
        await defaultKnex.schema.raw(
          `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
        );
        break;
      case 'mssql':
        await defaultKnex.schema.raw(
          `CREATE DATABASE [${dbName}] COLLATE Latin1_General_CI_AS`,
        );
        break;
      case 'pg':
        await defaultKnex.schema.raw(
          `CREATE DATABASE "${dbName}" WITH ENCODING 'UTF8' LC_COLLATE = 'en_US.UTF-8' LC_CTYPE = 'en_US.UTF-8' TEMPLATE template0`,
        );
        break;
      case 'oracledb':
        // Oracle 不支持在 CREATE DATABASE 语句中直接设置字符集，请参考官方文档进行配置。
        await defaultKnex.schema.raw(`CREATE DATABASE "${dbName}"`);
        break;
      default:
        throw new Error(`Unsupported database client: ${dbConfig.client}`);
    }

    // 断开连接到默认数据库的 knex 实例
    await defaultKnex.destroy();

    // 创建连接到新数据库的 knex 实例
    const knexForNewDb = knex({
      ...dbConfig,
      connection: {
        ...dbConfig.connection,
        password: get(dbConfig.connection, 'password'),
        database: dbName,
      },
    });

    // 执行原始的 DDL SQL 语句
    // await knexForNewDb.schema.raw(a);
    await executeSQLWithDisabledForeignKeys(knexForNewDb, ddl);
    // 断开连接到新数据库的 knex 实例。
    await knexForNewDb.destroy();
  }

  async createDbConnectConfigWithSchema(
    dbConfig: Pick<DB, 'config' | 'name'> & { schemaId: string },
    userId: string,
  ): Promise<DB | { err: string }> {
    const schema = await this.SchemaModel.findOne({
      where: {
        userId,
        id: dbConfig.schemaId || '',
      },
    });
    if (get(dbConfig, 'config.create')) {
      if (!get(dbConfig, 'config.newDbName')) {
        return { err: 'please input database info' };
      }
      const { tableDict, linkDict } = get(schema, 'dataValues.graph', {
        tableDict: {},
        linkDict: {},
      });

      const { client, host, port, user, password, database, newDbName }: any =
        dbConfig.config;

      const sqlOfCreateDatabase = exportDsl(
        tableDict,
        linkDict,
        client,
        // get(dbConfig, 'config.newDbType'),
      ).split(/\n\s*\n/);
      if (sqlOfCreateDatabase && get(dbConfig.config, 'newDbName')) {
        await this.createDatabaseAndExecuteDDL(
          {
            client: dbDrivers.get(client),
            asyncStackTraces: true,
            debug: true,
            connection: {
              host: host,
              port: port,
              user: user,
              password: password,
              database: database,
            },
          },
          sqlOfCreateDatabase,
          newDbName,
        );
      }
    }
    const saveConfig = {
      ...dbConfig,
      userId,
      config: {
        ...dbConfig.config,
        database: get(
          dbConfig.config,
          'newDbName',
          get(dbConfig.config, 'newDbName', get(dbConfig.config, 'database')),
        ),
      },
      schemas: [], // 仅传递现有 Schema 的 ID
    };

    // 创建 DB 实例并关联现有的 Schema
    const db = await this.DbModel.create(saveConfig, {
      include: [
        {
          model: Schema,
        },
      ],
    });
    if (db.userId !== userId) {
      throw new UnauthorizedException();
    }
    await invoke(db, 'setSchemas', [schema]);
    return db;
  }

  async getSchemaAllDb(schemaId: Schema['id'], userId: string): Promise<DB[]> {
    const { DBs } = await this.SchemaModel.findOne({
      where: {
        id: schemaId,
        userId,
      },
      include: [
        {
          model: DB,
        },
      ],
    });
    return DBs;
  }

  async deleteDb(id: DB['id'], userId: string): Promise<{ id: DB['id'] }> {
    await this.DbModel.destroy({
      where: {
        id,
        userId,
      },
    });
    return { id };
  }

  async testConnectDb(dbConfig: DB['config']) {
    const { client, host, port, user, password, database } = dbConfig as any;
    const db: Knex = this.knex.create({
      client: dbDrivers.get(client),
      asyncStackTraces: true,
      debug: true,
      connection: {
        host: host,
        port: port,
        user: user,
        password: password,
        database: database,
      },
    });
    try {
      const inspector = schemaInspector(db);
      await inspector.tables();
      this.knex.destroy(db);
      return {
        status: 200,
      };
    } catch (err) {
      console.log(err, 'err');
      this.knex.destroy(db);
      return {
        err: '参数错误，连接失败',
        status: 401,
      };
    }
  }

  /**
   * ! @deprecated
   */
  async getDbDBML(config: Knex.Config) {
    const { client, host, port, user, password, database }: any = config;
    const db: Knex = this.knex.create({
      client: client,
      asyncStackTraces: true,
      debug: true,
      connection: {
        host: host,
        port: port,
        user: user,
        password: password,
        database: database,
      },
    });
    try {
      const data = await generateDbDiagramDsl(db);
      this.knex.destroy(db);
      return {
        data: data,
        status: 200,
      };
    } catch (err) {
      console.log(err, 'err');
      this.knex.destroy(db);
      return {
        err: '参数错误，连接失败',
        status: 401,
      };
    }
  }

  async setupAssociations(
    models: Record<string, any>,
    relations: TableData['relations'],
  ) {
    relations.forEach((relation) => {
      const parentModel = models[relation.parentModel];
      const childModel = models[relation.childModel];

      if (relation.isM2M) {
        // Many-to-Many relationship
        parentModel.belongsToMany(childModel, {
          through: models[relation.joinModel],
          foreignKey: relation.parentId,
          otherKey: relation.childId,
          // as: relation.parentProp,
        });
        childModel.belongsToMany(parentModel, {
          through: models[relation.joinModel],
          foreignKey: relation.childId,
          otherKey: relation.parentId,
          // as: relation.childProp,
        });
      } else if (relation.isOne) {
        // One-to-One relationship
        parentModel.hasOne(childModel, {
          foreignKey: relation.parentId,
          // as: relation.childProp,
        });
        childModel.belongsTo(parentModel, {
          foreignKey: relation.parentId,
          // as: relation.parentProp,
        });
      } else {
        // One-to-Many relationship
        parentModel.hasMany(childModel, {
          foreignKey: relation.parentId,
          // as: relation.childProp,
        });
        childModel.belongsTo(parentModel, {
          foreignKey: relation.parentId,
          // as: relation.parentProp,
        });
      }
    });
  }

  async getModelFromDB(config: SequelizeOptions) {
    const sequelizeInstance = new Sequelize(config);
    const options: any = { caseFile: 'c', caseModel: 'c', caseProp: 'c' };
    const auto = new SequelizeAuto(sequelizeInstance, null, null, options);
    let tableData = await auto.build(false);
    tableData = auto.relate(tableData);
    auto.generateModelsFn(tableData)(); //without relation
    // auto.getCreateModelsFn(tableData)();

    this.setupAssociations(sequelizeInstance.models, tableData.relations);
    return sequelizeInstance;
  }

  async getDbModel(config: Knex.Config & { DBId?: string }, userId: string) {
    let dbConfig = config;
    if (config.DBId) {
      const db = await this.DbModel.findOne({
        where: {
          id: config.DBId,
          userId,
        },
      });
      dbConfig = db.config as any;
    }
    const { client, host, port, user, password, database }: any = dbConfig;
    const sequelizeInstance = await this.getModelFromDB({
      dialect: client,
      host,
      port,
      username: user,
      password,
      database,
    });
    const tableSql = map(sequelizeInstance.models, (model: any) => {
      let { tableName } = model;
      // model.queryInterface.createTable(tableName, attributes, options, model);
      const options: Record<string, any> = {};
      if (model) {
        options.uniqueKeys = options.uniqueKeys || model.uniqueKeys;
      }
      let attributes = mapValues(model.tableAttributes, (attribute) =>
        model.sequelize.normalizeAttribute(attribute),
      );
      if (!tableName.schema && (options.schema || (!!model && model._schema))) {
        tableName = model.queryInterface.queryGenerator.addSchema({
          tableName,
          _schema: (!!model && model._schema) || options.schema,
        });
      }
      attributes = model.queryInterface.queryGenerator.attributesToSQL(
        attributes,
        {
          table: tableName,
          context: 'createTable',
          withoutForeignKeyConstraints: options.withoutForeignKeyConstraints,
        },
      );
      const sql: string =
        model.queryInterface.queryGenerator.createTableQuery(
          tableName,
          attributes,
          options,
        ) || '';
      switch (client) {
        case 'oracle':
          //TODO dbml 当前不支持 ql/sql
          return sql.slice(25, -73) + ';';
        default:
          return sql;
      }
    });
    try {
      const data = importer.import(tableSql.join('\n'), client as any);
      sequelizeInstance.close();
      return {
        data: data,
        status: 200,
      };
    } catch (err) {
      console.log(err, 'err');
      sequelizeInstance.close();
      return {
        err: '参数错误，连接失败',
        status: 401,
      };
    }
  }

  async addQuery(query: Query, userId: string) {
    return this.QueryModel.create({
      ...pick(query, 'name', 'content', 'schemaId', 'DbID'),
      userId,
    });
  }

  async updateQuery(
    queryId: string,
    functions: string,
    option: {
      customComponentsHistory?: Record<
        string,
        {
          code: string;
          type: string;
        }
      >;
    },
    userId: string,
  ) {
    const query = await this.QueryModel.findByPk(queryId);
    if (query.userId !== userId) {
      throw new UnauthorizedException();
    }
    // query.content
    const content: any = query.content;
    return await query.update({
      content: {
        ...content,
        functions: functions || content.functions,
        option: option || content.option,
      },
    });
  }

  async getQueries(schemaId: Schema['id'], userId: string) {
    return this.QueryModel.findAll({
      where: {
        schemaId,
        userId,
      },
    });
  }

  async deleteQuery(queryId: Query['id'], userId: string) {
    return this.QueryModel.destroy({
      where: {
        id: queryId,
        userId,
      },
    });
  }

  async runQuery(
    queryId: string,
    params: Record<string, any>,
    userId: string,
    type?,
    fnName?,
  ) {
    const query = await this.QueryModel.findByPk(queryId);
    console.log(query.content, this.executor);
    let data: any = await this.executeQuery(
      {
        config: params,
        execution: get(query.content, 'executions'),
        dbID: query.DbID,
      },
      userId,
    );

    // if (type === '1') {

    // }

    const result = [];
    if (fnName) {
      const fnNameArr = JSON.parse(fnName);
      // 假设 get 函数已经定义，并且 fnNameArr 数组也已经定义
      const outerArray = get(data, 'data', []); // 使用假设的 get 函数获取数据
      const fns = get(query.content, 'functions', []);

      for (let index = 0; index < outerArray.length; index++) {
        const item = outerArray[index];
        const innerResult = [];

        for (let i = 0; i < item.length; i++) {
          const v = item[i];
          const fn = fnNameArr[i];
          if (fn) {
            const item = await this.executor.executeJsFunction(
              query.id,
              `
            ${fns[i]}
            exports.handler = ${fn}
                    `,
              v[0],
            );
            innerResult.push([{ data: item }]);
          } else {
            innerResult.push(v);
          }
        }

        // 将处理过的内部数组添加到结果中
        result.push(innerResult);
      }
      data = {
        data: result,
      };
    }
    if (type === '1') {
      // data = result;
      let result = [];
      get(data, 'data', []).map((item) => {
        item.map((v) => {
          result = result.concat(get(v, '0'));
        });
      });
      data = result;
    }
    return data;
  }

  async sync(dbId: DB['id'], userId: string) {
    // inject new route
    const Db: any = await this.DbModel.findByPk(dbId);

    if (Db.userId !== userId) {
      throw new UnauthorizedException();
    }

    const { client, host, port, user, password, database } = Db.config;
    const modelSequelize = await this.getModelFromDB({
      dialect: client,
      host,
      port,
      username: user,
      password,
      database,
    });
    const prefix = '/' + Db.id;

    await this.actionService.exportApi(modelSequelize, prefix);
    const action = await this.actionService.findAction(dbId, userId);
    return action || this.actionService.createAction(dbId, userId);
  }

  async onModuleInit() {
    console.log(233);
    // const actions = await this.actionService.findAllAction();

    // for (const action of actions) {
    //   await this.sync(action.DbId);
    // }
  }
}

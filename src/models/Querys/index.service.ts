import { ActionService } from './../Action/Action.service';
import { Schema } from './../Schema/schema.model';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { KnexContainer } from 'src/utils/knex';
import { Query } from './Query.model';
import { InjectModel } from '@nestjs/sequelize';
import { DB } from './DB.model';
import knex from 'knex';
import { generateDbdiagramDsl } from 'src/utils/knex/DB2DBML';
import { each, get, map, mapValues, pick } from 'lodash';
import { Knex } from 'knex';
import { executeSQLWithDisabledForeignKeys } from 'src/utils/knex/executeSQLWithDisabledForeignKeys';
import exportDsl from 'src/utils/knex/export-dsl';
import { ExecutionService } from '../Execution/execution.service';
import { Sequelize, SequelizeOptions } from 'sequelize-typescript';
import SequelizeAuto, { TableData } from 'sequelize-auto-model';

import { importer } from '@dbml/core';
import schemaInspector from 'knex-schema-inspector';
import { dbDrivers } from './DBTypes';
import { DataTypes } from 'sequelize';

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
    private actionService: ActionService,
    private executor: ExecutionService,
  ) {}
  async executeQuery(params: {
    config: Record<string, any>;
    execution: {
      content: string;
      type: string;
    }[];
    dbID: string;
  }) {
    console.log(params);
    let db = this.knex.get(params.dbID);
    if (!db) {
      const dbConfig = await this.DbModel.findByPk(params.dbID);
      const { client, host, port, user, password, database }: any = get(
        dbConfig,
        'dataValues.config',
        {},
      );
      db = await this.knex.create({
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
          const sqlArr = content.split(/;\n/);
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
  async createQuery(schemaId: Schema['id']): Promise<Query> {
    return this.QueryModel.create({
      schemaId,
      name: 'unknown',
      content: '',
    });
  }
  async createDatabaseAndExecuteDDL(dbConfig, ddl, dbName) {
    // 创建连接到默认数据库的 knex 实例
    const defaultKnex = knex(dbConfig);

    // 根据不同数据库系统的语法，创建数据库
    if (dbConfig.client === 'mysql' || dbConfig.client === 'mysql2') {
      await defaultKnex.schema.raw(
        `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
      );
    } else if (dbConfig.client === 'mssql') {
      await defaultKnex.schema.raw(
        `CREATE DATABASE [${dbName}] COLLATE Latin1_General_CI_AS`,
      );
    } else if (dbConfig.client === 'pg') {
      await defaultKnex.schema.raw(
        `CREATE DATABASE "${dbName}" WITH ENCODING 'UTF8' LC_COLLATE = 'en_US.UTF-8' LC_CTYPE = 'en_US.UTF-8'`,
      );
    } else if (dbConfig.client === 'oracle') {
      // Oracle 不支持在 CREATE DATABASE 语句中直接设置字符集，请参考官方文档进行配置。
      await defaultKnex.schema.raw(`CREATE DATABASE "${dbName}"`);
    } else {
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
    dbConfig: Pick<DB, 'config' | 'schemaId' | 'name'>,
  ): Promise<DB | { err: string }> {
    if (get(dbConfig, 'config.create')) {
      if (!get(dbConfig, 'config.newDbName')) {
        return { err: 'please input database info' };
      }
      const { Schema: schema } = await this.DbModel.findOne({
        include: [
          {
            model: Schema,
            required: false,
            right: true,
          },
        ],
        where: {
          '$Schema.id$': dbConfig.schemaId,
        },
        paranoid: false,
        attributes: [],
      });
      const { tableDict, linkDict } = get(schema, 'dataValues.graph', {
        tableDict: {},
        linkDict: {},
      });
      const ddl = exportDsl(
        tableDict,
        linkDict,
        // get(dbConfig, 'config.newDbType'),
      ).split(/\n\s*\n/);
      const { client, host, port, user, password, database, newDbName }: any =
        dbConfig.config;
      if (ddl && get(dbConfig.config, 'newDbName')) {
        await this.createDatabaseAndExecuteDDL(
          {
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
          },
          ddl,
          newDbName,
        );
      }
    }
    const saveConfig = {
      ...dbConfig,
      config: {
        ...dbConfig.config,
        database: get(
          dbConfig.config,
          'newDbName',
          get(dbConfig.config, 'newDbName', get(dbConfig.config, 'database')),
        ),
      },
    };
    return this.DbModel.create(saveConfig);
  }
  async getSchemaAllDb(schemaId: Schema['id']): Promise<DB[]> {
    return this.DbModel.findAll({
      where: {
        schemaId,
      },
    });
  }
  async deleteDb(id: DB['id']): Promise<{ id: DB['id'] }> {
    await this.DbModel.destroy({
      where: {
        id,
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
      const data = await generateDbdiagramDsl(db);
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
    // auto.generateFn(tableData)(); without relation
    auto.getCreateModelsFn(tableData)();
    // this.setupAssociations(sequelizeInstance.models, tableData.relations);
    return sequelizeInstance;
  }

  async getDbModel(config: Knex.Config) {
    const { client, host, port, user, password, database }: any = config;

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
      return sql;
    });
    try {
      console.log(tableSql, 'tableSql');
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

  async addQuery(query: Query) {
    return this.QueryModel.create(
      pick(query, 'name', 'content', 'schemaId', 'DbID'),
    );
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
  ) {
    const query = await this.QueryModel.findByPk(queryId);
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
  async getQueries(schemaId: Schema['id']) {
    return this.QueryModel.findAll({
      where: {
        schemaId,
      },
    });
  }
  async deleteQuery(queryId: Query['id']) {
    return this.QueryModel.destroy({
      where: {
        id: queryId,
      },
    });
  }
  async runQuery(queryId: string, params: Record<string, any>, type?, fnName?) {
    const query = await this.QueryModel.findByPk(queryId);
    console.log(query.content, this.executor);
    let data: any = await this.executeQuery({
      config: params,
      execution: get(query.content, 'executions'),
      dbID: query.DbID,
    });

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
  async sync(dbId: DB['id']) {
    // inject new route
    const Db: any = await this.DbModel.findByPk(dbId);

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
    const action = await this.actionService.findAction(dbId);
    return action || this.actionService.createAction(dbId);
  }
  async onModuleInit() {
    const actions = await this.actionService.findAllAction();

    for (const action of actions) {
      await this.sync(action.DbId);
    }
  }
}

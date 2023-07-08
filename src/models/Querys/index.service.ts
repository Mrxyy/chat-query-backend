import { Schema } from './../Schema/schema.model';
import { Injectable } from '@nestjs/common';
import { KnexContainer } from 'src/utils/knex';
import { Query } from './Query.model';
import { InjectModel } from '@nestjs/sequelize';
import { DB } from './DB.model';
import knex from 'knex';
import { generateDbdiagramDsl } from 'src/utils/knex/DB2DBML';
import { get, pick } from 'lodash';
import { Knex } from 'knex';
import exportSQL from 'src/utils/knex/export-sql';
import { executeSQLWithDisabledForeignKeys } from 'src/utils/knex/executeSQLWithDisabledForeignKeys';

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
export class QueriesService {
  constructor(
    private knex: KnexContainer,
    @InjectModel(Query) private QueryModel: typeof Query,
    @InjectModel(DB) private DbModel: typeof DB,
  ) {}
  async executeQuery(pramas: {
    config: Record<string, any>;
    execution: {
      content: string;
      type: string;
    }[];
    dbID: string;
  }) {
    console.log(pramas);
    let db = this.knex.get(pramas.dbID);
    if (!db) {
      const dbConfig = await this.DbModel.findByPk(pramas.dbID);
      const { client, host, port, user, password, database }: any = get(
        dbConfig,
        'dataValues.config',
      );
      db = await this.knex.create({
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
    }
    const { execution = [], config } = pramas;
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
  async createQuery(schemaId: Pick<Schema, 'id'>): Promise<Query> {
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
      const ddl = exportSQL(
        tableDict,
        linkDict,
        // get(dbConfig, 'config.newDbType'),
      );
      const { client, host, port, user, password, database, newDbName }: any =
        dbConfig.config;
      if (ddl) {
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
        database: get(dbConfig.config, 'newDbName'),
      },
    };
    return this.DbModel.create(saveConfig);
  }
  async getSchemaAllDb(schemaId: Pick<Schema, 'id'>): Promise<DB[]> {
    return this.DbModel.findAll({
      where: {
        schemaId,
      },
    });
  }
  async deleteDb(id: Pick<DB, 'id'>): Promise<{ id: Pick<DB, 'id'> }> {
    await this.DbModel.destroy({
      where: {
        id,
      },
    });
    return { id };
  }
  async testConnectDb(dbConfig: Pick<DB, 'config'>) {
    const { client, host, port, user, password, database }: any = dbConfig;
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
      await db.raw('SHOW TABLES;');
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
  async addQuery(query: Query) {
    return this.QueryModel.create(
      pick(query, 'name', 'content', 'schemaId', 'DbID'),
    );
  }
  async updateQuery(queryId: string, functions: string) {
    const query = await this.QueryModel.findByPk(queryId);
    // query.content
    const content: any = query.content;
    return await query.update({
      content: {
        ...content,
        functions,
      },
    });
  }
  async getQueries(schemaId: Pick<Schema, 'id'>) {
    return this.QueryModel.findAll({
      where: {
        schemaId,
      },
    });
  }
  async deteteQuery(queryId: Pick<Query, 'id'>) {
    return this.QueryModel.destroy({
      where: {
        id: queryId,
      },
    });
  }
  async runQuery(queryId: string, params: Record<string, any>, type?) {
    const query = await this.QueryModel.findByPk(queryId);
    console.log(query.content);
    const data = await this.executeQuery({
      config: params,
      execution: get(query.content, 'executions'),
      dbID: query.DbID,
    });

    if (type === '1') {
      let result = [];
      console.log(data, 'data');
      get(data, 'data', []).map((item) => {
        item.map((v) => {
          result = result.concat(get(v, '0'));
        });
      });
      console.log(result);
      return result;
    }
    return data;
  }
}

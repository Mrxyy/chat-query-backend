import { config } from 'dotenv';
// db.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DB } from './DB.model';
import { KnexContainer } from 'src/utils/knex';
import { get, map, set } from 'lodash';
import { dbDrivers, DBTypes } from './DBTypes';
import { showDbs, switchDb } from 'src/utils/knex/extra';
import SchemaInspector from 'knex-schema-inspector';
import rawKnex, { Knex } from 'knex';
import { AbstractRepository } from 'knex-repositories';

@Injectable()
export class DBService {
  constructor(
    @InjectModel(DB) private dbModel: typeof DB,
    private readonly knex: KnexContainer,
  ) {}

  async findAll(): Promise<DB[]> {
    return this.dbModel.findAll();
  }

  async find(id: DB['id']): Promise<DB> {
    return this.dbModel.findByPk(id);
  }

  async create(dbData: Pick<DB, 'config' | 'name'>) {
    return this.dbModel.create({
      ...dbData,
    });
  }

  async update(id: string, dbData: DB) {
    await this.dbModel.update(dbData, { where: { id } });
    return this.dbModel.findByPk(id);
  }

  async delete(id: string): Promise<void> {
    await this.dbModel.destroy({ where: { id } });
  }

  async deleteAll(): Promise<void> {
    await this.dbModel.destroy({ where: {}, truncate: true });
  }

  async createConnection(id: DB['id']): Promise<Knex> {
    const dbConfig = await this.dbModel.findByPk(id);
    const { client, host, port, user, password, database }: any = get(
      dbConfig,
      'config',
      {},
    );
    let db = this.knex.get(id);
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
    return db;
  }

  async listDatabases(conid: string) {
    const knex = this.knex.get(conid);
    const type = dbDrivers.get(knex.client.config.client);
    const sql = showDbs[type];
    const data = await knex.raw(sql);
    return showDbs.getKnewResult(data, type);
  }

  async createKnex(conid: string, db?: DB['name']) {
    const dbConfig = await this.dbModel.findByPk(conid);
    const { client, host, port, user, password, database }: any = get(
      dbConfig,
      'config',
      {},
    );
    const getDatabase = () => {
      if (client === DBTypes.Oracle) {
        return database;
      } else {
        return db || database;
      }
    };
    const knex = rawKnex({
      client: dbDrivers.get(client),
      asyncStackTraces: true,
      debug: true,
      connection: {
        host: host,
        port: port,
        user: user,
        password: password,
        database: getDatabase(),
      },
    });
    return knex;
  }

  async listDatabasesTables(conid: string, db: DB['name']) {
    const knex = await this.createKnex(conid, db);
    const inspector = SchemaInspector(knex);
    const data = await inspector.tableInfo();
    let res;
    console.log(await inspector.columnInfo(), 'resres1');
    try {
      res = await Promise.all(
        data.map((table) => {
          return inspector.columnInfo(table.name).then((columns) => {
            return {
              ...table,
              columns,
            };
          });
        }),
      );
    } catch (e) {
      console.log(e);
    }
    console.log(res, 'resres');

    knex.destroy();
    return res;
  }

  async getAllTableData(
    conid: DB['id'],
    db: string,
    tableName: string,
    fields: string[],
    where,
  ) {
    // 使用 knex-schema-inspector 获取表结构
    const knex = await this.createKnex(conid, db);

    const inspector = SchemaInspector(knex);
    const columns = await inspector.columnInfo(tableName);

    // 创建仓库
    const repository = new AbstractRepository(knex, {
      tableName: tableName,
      idColumn: columns.find((column) => column.is_primary_key)?.name || '',
      columnsToFetch: fields || columns.map((column) => column.name),
      columnsForCreate: columns.map((column) => column.name),
      columnsForUpdate: columns.map((column) => column.name),
      columnsForFilters: columns.map((column) => column.name),
    });
    // 获取所有行
    const rows = await repository.getByCriteria(where);
    knex.destroy();

    return rows;
  }
}

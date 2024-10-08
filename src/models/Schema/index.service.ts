import { Injectable } from '@nestjs/common';
import { Schema } from './schema.model';
import { InjectModel } from '@nestjs/sequelize';
import { executeRes } from '../../utils/response/sequeilze';
import { SchemaLog } from './SchemaLog.model';
import { get, invoke, map, omit } from 'lodash';
import { GET_SCHEMA_INFO } from '../../utils/prompts/schema';
import exportDsl from '../../utils/knex/export-dsl';
import { DB } from '../Database/DB.model';

@Injectable()
export class SchemaService {
  constructor(
    @InjectModel(Schema) private SchemaModel: typeof Schema,
    @InjectModel(SchemaLog) private SchemaLogModel: typeof SchemaLog,
    @InjectModel(DB) private DbModel: typeof DB,
  ) {}
  async addSchema(body: Pick<Schema, 'name' | 'graph'>): Promise<Schema> {
    return await executeRes(() => this.SchemaModel.create(body));
  }

  async associateDatabaseAndSchema(DBId: string, SchemaID: string) {
    const schema = await this.SchemaModel.findByPk(SchemaID, {
      include: [
        {
          model: DB,
        },
      ],
    });
    const db = await this.DbModel.findByPk(DBId);

    // const dbs = map(schema.DBs || [], (db) => {
    //   return {
    //     id: db.id,
    //   };
    // });

    invoke(schema, 'setDBs', [...schema.DBs, db]);
    return;
  }

  async findSchema(id: string): Promise<Schema> {
    const schema = await this.SchemaModel.findByPk(id);
    if (!schema?.description) {
      this.updateSchema(schema.id, schema.graph, schema.name);
    }
    return await executeRes(() => this.SchemaModel.findByPk(id));
  }

  async getAll(): Promise<Schema[]> {
    return await executeRes(() => this.SchemaModel.findAll());
  }

  async removeSchema(id: string): Promise<{
    id: Schema['id'];
  }> {
    return executeRes(async () => {
      const num = await this.SchemaModel.destroy({
        where: {
          id: id,
        },
      });
      console.log(num);
      return { id: id };
    });
  }
  async updateSchema(
    id: string,
    graph: Schema['graph'],
    name: Schema['name'],
  ): Promise<Schema> {
    const schema = await this.SchemaModel.findByPk(id);

    //添加日志、
    await this.SchemaLogModel.create({
      ...omit(get(schema, 'dataValues'), 'id'),
      schemaId: get(schema, 'dataValues.id'),
    });
    const { tableDict, linkDict } = (graph as any) || {
      tableDict: {},
      linkDict: {},
    };

    const dbml = exportDsl(tableDict, linkDict, 'dbml');

    let description;
    try {
      description = (await GET_SCHEMA_INFO.invoke({ sql: dbml })).content;
    } catch (e) {
      description = dbml;
    }

    return executeRes(() =>
      schema.update({
        name,
        graph,
        description,
      }),
    );
  }
  async getSchemaLogsById(id: string): Promise<Schema[]> {
    const resuts = await executeRes(
      async () =>
        await executeRes(() =>
          this.SchemaModel.findOne({
            where: {
              id,
            },
            attributes: [],
            include: [SchemaLog],
          }),
        ),
    );
    return resuts;
  }

  async deleteSchemaLogsById(id: string): Promise<{
    id: string;
  }> {
    await this.SchemaLogModel.destroy({
      where: {
        id,
      },
    });
    return { id: id };
  }
}

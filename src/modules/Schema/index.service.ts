import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Schema } from '../../models/schema.model';
import { InjectModel } from '@nestjs/sequelize';
import { executeRes } from '../../utils/response/sequeilze';
import { SchemaLog } from '../../models/SchemaLog.model';
import { get, invoke, map, omit } from 'lodash';
import { GET_SCHEMA_INFO } from '../../utils/prompts/schema';
import exportDsl from '../../utils/knex/export-dsl';
import { DB } from '../../models/DB.model';
import { User } from 'src/models/User.model';

@Injectable()
export class SchemaService {
  constructor(
    @InjectModel(Schema) private SchemaModel: typeof Schema,
    @InjectModel(SchemaLog) private SchemaLogModel: typeof SchemaLog,
    @InjectModel(DB) private DbModel: typeof DB,
  ) {}
  async addSchema(
    body: Pick<Schema, 'name' | 'graph'>,
    userId: User['id'],
  ): Promise<Schema> {
    return await executeRes(() =>
      this.SchemaModel.create({
        ...body,
        userId,
      }),
    );
  }

  async associateDatabaseAndSchema(
    DBId: string,
    SchemaID: string,
    userId: User['id'],
  ) {
    const schema = await this.SchemaModel.findByPk(SchemaID, {
      include: [
        {
          model: DB,
        },
      ],
    });
    if (schema.userId !== userId) {
      throw new UnauthorizedException();
    }
    const db = await this.DbModel.findByPk(DBId);

    // const dbs = map(schema.DBs || [], (db) => {
    //   return {
    //     id: db.id,
    //   };
    // });

    invoke(schema, 'setDBs', [...schema.DBs, db]);
    return;
  }

  async findSchema(id: string, userId: string): Promise<Schema> {
    const schema = await this.SchemaModel.findByPk(id);
    if (schema.userId !== userId) {
      throw new UnauthorizedException();
    } else {
      if (!schema?.description) {
        this.updateSchema(schema.id, schema.graph, schema.name, userId);
      }
      return await executeRes(() => this.SchemaModel.findByPk(id));
    }
  }

  async getAll(userId: string): Promise<Schema[]> {
    return await executeRes(() =>
      this.SchemaModel.findAll({
        where: {
          userId,
        },
      }),
    );
  }

  async removeSchema(
    id: string,
    userId: User['id'],
  ): Promise<{
    id: Schema['id'];
  }> {
    return executeRes(async () => {
      const num = await this.SchemaModel.destroy({
        where: {
          id: id,
          userId,
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
    userId: string,
  ): Promise<Schema> {
    const schema = await this.SchemaModel.findByPk(id);

    //添加日志、
    await this.SchemaLogModel.create({
      ...omit(get(schema, 'dataValues'), 'id'),
      schemaId: get(schema, 'dataValues.id'),
      userId: userId,
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
  async getSchemaLogsById(id: string, userId: string): Promise<Schema[]> {
    const result = await executeRes(
      async () =>
        await executeRes(() =>
          this.SchemaModel.findOne({
            where: {
              id,
              userId,
            },
            attributes: [],
            include: [SchemaLog],
          }),
        ),
    );
    return result;
  }

  async deleteSchemaLogsById(
    id: string,
    userId: string,
  ): Promise<{
    id: string;
  }> {
    await this.SchemaLogModel.destroy({
      where: {
        id,
        userId,
      },
    });
    return { id: id };
  }
}

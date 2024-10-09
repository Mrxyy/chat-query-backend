// db.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { DBService } from './index.service';
import { DB } from './db.model';
import { KnexContainer } from 'src/utils/knex';

@Controller('db')
export class DBController {
  constructor(
    private readonly dbService: DBService,
    private readonly knex: KnexContainer,
  ) {}

  @Get()
  async findAll(): Promise<DB[]> {
    return this.dbService.findAll();
  }

  @Post()
  async create(@Body() dbData: DB): Promise<DB> {
    return this.dbService.create(dbData);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dbData: DB): Promise<DB> {
    return this.dbService.update(id, dbData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.dbService.delete(id);
  }

  @Delete()
  async deleteAll(): Promise<void> {
    // return this.dbService.deleteAll();
  }

  @Get('/findConnected')
  async findConnectedKnex() {
    return {
      data: [...this.knex.getAll()],
    };
  }

  @Post('/createdConnection')
  async createdConnection(@Body('db') db: DB['id']) {
    try {
      this.dbService.createConnection(db);
      return {
        status: 200,
        message: '连接成功',
      };
    } catch (e) {
      return {
        status: 500,
        message: '连接失败',
      };
    }
  }

  @Post('/connection/list-databases')
  async listDatabases(@Body('conid') conid: string) {
    return this.dbService.listDatabases(conid);
  }

  @Post('/connection/list-databases-tables')
  async listDatabasesStructure(
    @Body('conid') conid: string,
    @Body('database') database: string,
  ) {
    return {
      tables: await this.dbService.listDatabasesTables(conid, database),
      collections: [],
      views: [],
      matviews: [],
      functions: [],
      procedures: [],
      triggers: [],
      schemas: [],
      engine: '',
    };
  }

  @Post('/connection/database-table-data')
  async databaseTableData(
    @Body('conid') conid: string,
    @Body('database') database: string,
    @Body('table') Table: string,
    @Body('fields') fields: string[],
    @Body('where') where: string,
  ) {
    return this.dbService.getAllTableData(
      conid,
      database,
      Table,
      fields,
      where,
    );
  }
}

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
import { DB } from '../../models/DB.model';
import { KnexContainer } from 'src/utils/knex';
import { GetUser } from 'src/middleware/auth';
import { User } from 'src/models/User.model';

@Controller('db')
export class DBController {
  constructor(
    private readonly dbService: DBService,
    private readonly knex: KnexContainer,
  ) {}

  @Get()
  async findAll(@GetUser() user: User): Promise<DB[]> {
    return this.dbService.findAll(user.id);
  }

  @Post()
  async create(@Body() dbData: DB, @GetUser() user: User): Promise<DB> {
    return this.dbService.create(dbData, user.id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dbData: DB,
    @GetUser() user: User,
  ): Promise<DB> {
    return this.dbService.update(id, dbData, user.id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @GetUser() user: User): Promise<void> {
    return this.dbService.delete(id, user.id);
  }

  @Delete()
  async deleteAll(@GetUser() user: User): Promise<void> {
    return this.dbService.deleteAll(user.id);
  }

  @Get('/findConnected')
  async findConnectedKnex() {
    return {
      data: [...this.knex.getAll()],
    };
  }

  @Post('/createdConnection')
  async createdConnection(@Body('db') db: DB['id'], @GetUser() user: User) {
    try {
      this.dbService.createConnection(db, user.id);
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
  async listDatabases(@Body('conid') conid: string, @GetUser() user: User) {
    return this.dbService.listDatabases(conid);
  }

  @Post('/connection/list-databases-tables')
  async listDatabasesStructure(
    @Body('conid') conid: string,
    @Body('database') database: string,
    @GetUser() user: User,
  ) {
    return {
      tables: await this.dbService.listDatabasesTables(
        conid,
        database,
        user.id,
      ),
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
    @GetUser() user: User,
  ) {
    return this.dbService.getAllTableData(
      conid,
      database,
      Table,
      fields,
      where,
      user.id,
    );
  }
}

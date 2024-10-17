import { CreatedAt } from 'sequelize-typescript';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query as QueryValue,
} from '@nestjs/common';
import { QueriesService } from './index.service';
import { DB } from '../../models/DB.model';
import { Query } from '../../models/Query.model';
import { Schema } from '../../models/schema.model';
import { GetUser } from 'src/middleware/auth';
import { User } from 'src/models/User.model';

@Controller('query')
export class QueriesController {
  constructor(private service: QueriesService) {}

  @Post('/querySql')
  executeQuery(@Body() params, @GetUser() user: User) {
    return this.service.executeQuery(params, user.id);
  }

  @Post('/add')
  addQuery(@Body() query: Query, @GetUser() user: User) {
    return this.service.addQuery(query, user.id);
  }

  @Get('/sync/:dbId')
  async sync(@Param('dbId') dbId: string, @GetUser() user: User) {
    return this.service.sync(dbId, user.id);
  }

  @Put('/:queryId')
  updateQuery(
    @Param('queryId') queryId: string,
    @Body('functions') functions: any,
    @Body('option') option: any,
    @GetUser() user: User,
  ) {
    return this.service.updateQuery(queryId, functions, option, user.id);
  }

  @Post('/getDbDBML')
  getDbDBML(@Body() config: any, @GetUser() user: User) {
    return this.service.getDbModel(config, user.id);
  }

  @Post('/createDbConnect')
  createDbConnect(
    @Body() dbConfig: Pick<DB, 'config' | 'name'> & { schemaId: string },
    @GetUser() user: User,
  ) {
    return this.service.createDbConnectConfigWithSchema(dbConfig, user.id);
  }

  @Post('/testConnectDb')
  testConnectDb(@Body() dbConfig: DB['config'], @GetUser() user: User) {
    return this.service.testConnectDb(dbConfig);
  }

  @Delete('/DbConnect/:DbID')
  deleteDbForSchema(@Param('DbID') DbID: string, @GetUser() user: User) {
    return this.service.deleteDb(DbID, user.id);
  }

  @Post('/run/:queryId')
  runQuery(
    @Param('queryId') queryID: string,
    @Body('params') params: Record<string, any>,
    @GetUser() user: User,
    @QueryValue('type') type?: number,
    @QueryValue('function') fnName?: string,
  ) {
    return this.service.runQuery(queryID, params, user.id, type, fnName);
  }

  @Delete('/:queryId')
  deleteQuery(@Param('queryId') queryId: Query['id'], @GetUser() user: User) {
    return this.service.deleteQuery(queryId, user.id);
  }

  @Get('/:schemaId/queries')
  getQueries(@Param('schemaId') schemaId: Schema['id'], @GetUser() user: User) {
    return this.service.getQueries(schemaId, user.id);
  }

  @Get('/:schemaId/DbConnect')
  getSchemaAllDb(
    @Param('schemaId') schemaId: Schema['id'],
    @GetUser() user: User,
  ) {
    return this.service.getSchemaAllDb(schemaId, user.id);
  }

  @Post('/:schemaId')
  create(@Param('schemaId') schemaId: Schema['id'], @GetUser() user: User) {
    return this.service.createQuery(schemaId, user.id);
  }
}

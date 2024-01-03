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
import { DB } from './DB.model';
import { Query } from './Query.model';
import { Schema } from '../Schema/schema.model';

@Controller('query')
export class QueriesController {
  constructor(private service: QueriesService) {}

  @Post('/querySql')
  executeQuery(@Body() params) {
    return this.service.executeQuery(params);
  }

  @Post('/add')
  addQuery(@Body() query: Query) {
    return this.service.addQuery(query);
  }

  @Put('/:queryId')
  updateQuery(
    @Param('queryId') queryId,
    @Body('functions') functions,
    @Body('option') option,
  ) {
    return this.service.updateQuery(queryId, functions, option);
  }

  @Post('/getDbDBML')
  getDbDBML(@Body() config) {
    return this.service.getDbDBML(config);
  }

  @Post('/createDbConnect')
  createDbConnect(@Body() dbConfig: Pick<DB, 'config' | 'schemaId' | 'name'>) {
    return this.service.createDbConnectConfigWithSchema(dbConfig);
  }

  @Post('/testConnectDb')
  testConnectDb(@Body() dbConfig: DB['config']) {
    return this.service.testConnectDb(dbConfig);
  }

  @Delete('/DbConnect/:DbID')
  deleteDbForSchema(@Param('DbID') DbID) {
    return this.service.deleteDb(DbID);
  }

  @Post('/run/:queryId')
  runQuery(
    @Param('queryId') queryID,
    @Body('params') params: Record<string, any>,
    @QueryValue('type') type?: 1,
    @QueryValue('function') fnName?: string,
  ) {
    return this.service.runQuery(queryID, params, type, fnName);
  }

  @Delete('/:queryId')
  deleteQuery(@Param('queryId') queryId: Query['id']) {
    return this.service.deleteQuery(queryId);
  }

  @Get('/:schemaId/queries')
  getQueries(@Param('schemaId') schemaId: Schema['id']) {
    return this.service.getQueries(schemaId);
  }

  @Get('/:schemaId/DbConnect')
  getSchemaAllDb(@Param('schemaId') schemaId: Schema['id']) {
    return this.service.getSchemaAllDb(schemaId);
  }

  @Post('/:schemaId')
  create(@Param('schemaId') schemaId: Schema['id']) {
    return this.service.createQuery(schemaId);
  }
}

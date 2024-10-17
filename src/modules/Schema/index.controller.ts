import {
  Body,
  Controller,
  Delete,
  Get,
  Next,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { SchemaService } from './index.service';
import { Schema } from '../../models/schema.model';
import { get } from 'lodash';
import { SchemaLog } from '../../models/SchemaLog.model';
import { GetUser } from 'src/middleware/auth';
import { User } from 'src/models/User.model';

@Controller('schema')
export class SchemaController {
  constructor(private service: SchemaService) {}

  @Get('/all')
  async findAll(@GetUser() user: User) {
    return this.service.getAll(user.id);
  }

  @Get('/:id')
  async getSchemaById(@Param('id') id: string, @GetUser() user: User) {
    return this.service.findSchema(id, user.id);
  }

  @Post('/create')
  async create(@Body() body: any, @GetUser() user: User) {
    const { dataValues } = await this.service.addSchema(body, user.id);
    return dataValues;
  }

  @Post('/associateDatabaseAndSchema')
  async associateDatabaseAndSchema(
    @Body('DBId') DBId: string,
    @Body('SchemaID') SchemaID: string,
    @GetUser() user: User,
  ) {
    return this.service.associateDatabaseAndSchema(DBId, SchemaID, user.id);
  }

  @Delete('/:id')
  async delete(@Param('id') id: string, @GetUser() user: User) {
    return await this.service.removeSchema(id, user.id);
  }

  @Put('/:id')
  async save(
    @Param('id') id: string,
    @Body('graph') body: any,
    @Body('name') name: string,
    @GetUser() user: User,
  ): Promise<Schema> {
    return this.service.updateSchema(id, body, name, user.id);
  }

  @Get('/getLogs/:id')
  async getLogsbySchemaId(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<SchemaLog> {
    const res = await this.service.getSchemaLogsById(id, user.id);
    return get(res, 'dataValues.schemaLogs');
  }

  @Delete('/getLogs/:id')
  async deleteLogsbySchemaId(@Param('id') id: string, @GetUser() user: User) {
    return await this.service.deleteSchemaLogsById(id, user.id);
  }
}

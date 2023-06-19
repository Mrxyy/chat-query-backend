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
import { Schema } from './schema.model';
import { get } from 'lodash';
import { SchemaLog } from './SchemaLog.model';

@Controller('schema')
export class SchemaController {
  constructor(private service: SchemaService) {}

  @Get('/all')
  async findAll() {
    return this.service.getAll();
  }
  @Get('/:id')
  async getSchemaById(@Param('id') id) {
    return this.service.findSchema(id);
  }
  @Post('/create')
  async create(@Body() body) {
    const { dataValues } = await this.service.addSchema(body);
    return dataValues;
  }

  @Delete('/:id')
  async delete(@Param('id') id) {
    return await this.service.removeSchema(id);
  }

  @Put('/:id')
  save(
    @Param('id') id,
    @Body('graph') body,
    @Body('name') name,
  ): Promise<Schema> {
    return this.service.updateSchema(id, body, name);
  }

  @Get('/getLogs/:id')
  async getLogsbySchemaId(@Param('id') id): Promise<SchemaLog> {
    const res = await this.service.getSchemaLogsById(id);
    return get(res, 'dataValues.schemaLogs');
  }
  @Delete('/getLogs/:id')
  async deleteLogsbySchemaId(@Param('id') id) {
    return await this.service.deleteSchemaLogsById(id);
  }
}

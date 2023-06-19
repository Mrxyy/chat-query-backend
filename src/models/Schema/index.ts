import { Module } from '@nestjs/common';
import { SchemaController } from './index.controller';
import { SchemaService } from './index.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Schema } from './schema.model';
import { SchemaLog } from './SchemaLog.model';

@Module({
  imports: [SequelizeModule.forFeature([Schema, SchemaLog])],
  controllers: [SchemaController],
  providers: [SchemaService],
})
export class SChemaModel {}

import { Module } from '@nestjs/common';
import { SchemaController } from './index.controller';
import { SchemaService } from './index.service';

@Module({
  controllers: [SchemaController],
  providers: [SchemaService],
})
export class SChemaModel {}

import { Module, Controller } from '@nestjs/common';
import { QueriesService } from './index.service';
import { QueriesController } from './index.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Query } from './Query.model';
import { DB } from './DB.model';

@Module({
  imports: [SequelizeModule.forFeature([Query, DB])],
  providers: [QueriesService],
  controllers: [QueriesController],
})
export class QueriesModel {}

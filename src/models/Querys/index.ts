import { Module, Controller } from '@nestjs/common';
import { QueriesService } from './index.service';
import { QueriesController } from './index.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Query } from './Query.model';
import { DB } from './DB.model';
import { ExecutionService } from '../Execution/execution.service';
import { ActionModule } from '../Action';

@Module({
  imports: [SequelizeModule.forFeature([Query, DB]), ActionModule],
  providers: [QueriesService, ExecutionService],
  controllers: [QueriesController],
  exports: [QueriesService],
})
export class QueriesModel {}

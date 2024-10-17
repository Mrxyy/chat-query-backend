import { Module, Controller } from '@nestjs/common';
import { QueriesService } from './index.service';
import { QueriesController } from './index.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Query } from '../../models/Query.model';
import { DB } from '../../models/DB.model';
import { ExecutionService } from '../Execution/execution.service';
import { ActionModule } from '../Action';
import { Schema } from '../../models/schema.model';

@Module({
  imports: [ActionModule],
  providers: [QueriesService, ExecutionService],
  controllers: [QueriesController],
  exports: [QueriesService],
})
export class QueriesModel {}

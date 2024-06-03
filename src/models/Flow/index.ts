import { Module } from '@nestjs/common';
import { WorkflowService } from './index.service';
import { WorkflowController } from './index.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Workflow } from './flow.model';

@Module({
  imports: [SequelizeModule.forFeature([Workflow])],
  providers: [WorkflowService],
  controllers: [WorkflowController],
})
export class WorkFlowModel {}

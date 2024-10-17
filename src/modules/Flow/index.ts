import { Module } from '@nestjs/common';
import { WorkflowService } from './index.service';
import { WorkflowController } from './index.controller';

@Module({
  providers: [WorkflowService],
  controllers: [WorkflowController],
})
export class WorkFlowModel {}

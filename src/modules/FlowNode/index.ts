import { Module } from '@nestjs/common';
import { FlowNodeService } from './index.service';
import { FlowNodeController } from './index.controller';

@Module({
  providers: [FlowNodeService],
  controllers: [FlowNodeController],
})
export class FlowNodeModel {}

import { Module } from '@nestjs/common';
import { FlowNodeService } from './index.service';
import { FlowNodeController } from './index.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { FlowNode } from './flowNode.model';

@Module({
  imports: [SequelizeModule.forFeature([FlowNode])],
  providers: [FlowNodeService],
  controllers: [FlowNodeController],
})
export class FlowNodeModel {}

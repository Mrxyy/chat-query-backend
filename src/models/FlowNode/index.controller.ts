// controller code
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { FlowNode } from './flowNode.model';
import { FlowNodeService } from './index.service';

@Controller('flowNode')
export class FlowNodeController {
  constructor(private readonly FlowNodeService: FlowNodeService) {}

  @Get()
  findAll(): Promise<FlowNode[]> {
    return this.FlowNodeService.findAll();
  }

  @Post('')
  create(@Body() flowNode: FlowNode): Promise<FlowNode> {
    return this.FlowNodeService.create(flowNode);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() flowNode: FlowNode) {
    return this.FlowNodeService.update(id, flowNode);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<number> {
    return this.FlowNodeService.delete(id);
  }

  @Delete()
  deleteAll(): Promise<number> {
    return this.FlowNodeService.deleteAll();
  }
}

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
import { FlowNode } from '../../models/flowNode.model';
import { FlowNodeService } from './index.service';
import { GetUser } from 'src/middleware/auth';
import { User } from 'src/models/User.model';

@Controller('flowNode')
export class FlowNodeController {
  constructor(private readonly flowNodeService: FlowNodeService) {}

  @Get()
  findAll(@GetUser() user: User): Promise<FlowNode[]> {
    return this.flowNodeService.findAll(user.id);
  }

  @Post('')
  create(@Body() flowNode: FlowNode, @GetUser() user: User): Promise<FlowNode> {
    return this.flowNodeService.create(flowNode, user.id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() flowNode: FlowNode,
    @GetUser() user: User,
  ) {
    return this.flowNodeService.update(id, flowNode, user.id);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @GetUser() user: User): Promise<number> {
    return this.flowNodeService.delete(id, user.id);
  }

  @Delete()
  deleteAll(@GetUser() user: User): Promise<number> {
    return this.flowNodeService.deleteAll(user.id);
  }
}

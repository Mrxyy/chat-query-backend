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
import { Workflow } from '../../models/flow.model';
import { WorkflowService } from './index.service';
import { GetUser } from 'src/middleware/auth';
import { User } from 'src/models/User.model';

@Controller('workflow')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Get()
  getAllWorkflows(@GetUser() user: User): Promise<Workflow[]> {
    return this.workflowService.getAllWorkflows(user.id);
  }

  @Get(':id')
  getWorkflowsById(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<Workflow> {
    return this.workflowService.getWorkflowsById(id, user.id);
  }

  @Post()
  createWorkflow(
    @Body() workflow: Workflow,
    @GetUser() user: User,
  ): Promise<Workflow> {
    return this.workflowService.createWorkflow(workflow, user.id);
  }

  @Put(':id')
  updateWorkflow(
    @Param('id') id: string,
    @Body('workflow') workflow: Workflow,
    @GetUser() user: User,
  ) {
    return this.workflowService.updateWorkflow(id, workflow, user.id);
  }

  @Delete(':id')
  deleteWorkflow(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<number> {
    return this.workflowService.deleteWorkflow(id, user.id);
  }

  @Delete()
  deleteAllWorkflows(@GetUser() user: User): Promise<number> {
    return this.workflowService.deleteAllWorkflows(user.id);
  }
}

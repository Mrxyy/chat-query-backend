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
import { Workflow } from './flow.model';
import { WorkflowService } from './index.service';

@Controller('workflow')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Get()
  getAllWorkflows(): Promise<Workflow[]> {
    return this.workflowService.getAllWorkflows();
  }

  @Get(':id')
  getWorkflowsById(@Param('id') id: string): Promise<Workflow> {
    return this.workflowService.getWorkflowsById(id);
  }

  @Post()
  createWorkflow(@Body() workflow: Workflow): Promise<Workflow> {
    return this.workflowService.createWorkflow(workflow);
  }

  @Put(':id')
  updateWorkflow(
    @Param('id') id: string,
    @Body('workflow') workflow: Workflow,
  ) {
    return this.workflowService.updateWorkflow(id, workflow);
  }

  @Delete(':id')
  deleteWorkflow(@Param('id') id: string): Promise<number> {
    return this.workflowService.deleteWorkflow(id);
  }

  @Delete()
  deleteAllWorkflows(): Promise<number> {
    return this.workflowService.deleteAllWorkflows();
  }
}

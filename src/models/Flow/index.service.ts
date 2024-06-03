// service code
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Workflow } from './flow.model';
import { OmitModelType } from 'src/utils/response/sequeilze';

@Injectable()
export class WorkflowService {
  constructor(
    @InjectModel(Workflow)
    private readonly workflowModel: typeof Workflow,
  ) {}

  getAllWorkflows(): Promise<Workflow[]> {
    return this.workflowModel.findAll();
  }

  getWorkflowsById(id: string): Promise<Workflow> {
    return this.workflowModel.findByPk(id);
  }

  createWorkflow(workflow: Omit<Workflow, OmitModelType>): Promise<Workflow> {
    return this.workflowModel.create(workflow);
  }

  updateWorkflow(id: string, workflow: Workflow) {
    return this.workflowModel.update(workflow, {
      where: { id },
      returning: true,
    });
  }

  deleteWorkflow(id: string): Promise<number> {
    return this.workflowModel.destroy({ where: { id } });
  }

  deleteAllWorkflows(): Promise<number> {
    return this.workflowModel.destroy({ truncate: true });
  }
}

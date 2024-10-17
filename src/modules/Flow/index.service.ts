// service code
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Workflow } from '../../models/flow.model';
import { OmitModelType } from 'src/utils/response/sequeilze';

@Injectable()
export class WorkflowService {
  constructor(
    @InjectModel(Workflow)
    private readonly workflowModel: typeof Workflow,
  ) {}

  getAllWorkflows(userId: string): Promise<Workflow[]> {
    return this.workflowModel.findAll({
      where: {
        userId,
      },
    });
  }

  getWorkflowsById(id: string, userId: string): Promise<Workflow> {
    return this.workflowModel.findOne({
      where: {
        userId,
        id,
      },
    });
  }

  createWorkflow(
    workflow: Omit<Workflow, OmitModelType>,
    userId: string,
  ): Promise<Workflow> {
    return this.workflowModel.create({ ...workflow, userId });
  }

  updateWorkflow(id: string, workflow: Workflow, userId: string) {
    return this.workflowModel.update(workflow, {
      where: { id, userId },
      returning: true,
    });
  }

  deleteWorkflow(id: string, userId: string): Promise<number> {
    return this.workflowModel.destroy({ where: { id, userId } });
  }

  deleteAllWorkflows(userId: string): Promise<number> {
    return this.workflowModel.destroy({
      truncate: true,
      where: {
        userId,
      },
    });
  }
}

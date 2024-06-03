// service code
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FlowNode } from './flowNode.model';

@Injectable()
export class FlowNodeService {
  constructor(
    @InjectModel(FlowNode)
    private readonly FlowNodeModel: typeof FlowNode,
  ) {}

  findAll(): Promise<FlowNode[]> {
    return this.FlowNodeModel.findAll();
  }

  create(node: Pick<FlowNode, 'id' | 'type' | 'data'>): Promise<FlowNode> {
    return this.FlowNodeModel.create(node);
  }

  update(id: string, openAiMassage: FlowNode) {
    return this.FlowNodeModel.update(openAiMassage, {
      where: { id },
      returning: true,
    });
  }

  delete(id: string): Promise<number> {
    return this.FlowNodeModel.destroy({ where: { id } });
  }

  deleteAll(): Promise<number> {
    return this.FlowNodeModel.destroy({ truncate: true });
  }
}

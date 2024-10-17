// service code
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FlowNode } from '../../models/flowNode.model';

@Injectable()
export class FlowNodeService {
  constructor(
    @InjectModel(FlowNode)
    private readonly FlowNodeModel: typeof FlowNode,
  ) {}

  findAll(userId: string): Promise<FlowNode[]> {
    return this.FlowNodeModel.findAll({
      where: { userId },
    });
  }

  create(
    node: Pick<FlowNode, 'id' | 'type' | 'data'>,
    userId: string,
  ): Promise<FlowNode> {
    return this.FlowNodeModel.create({ ...node, userId });
  }

  update(id: string, openAiMassage: FlowNode, userId: string) {
    return this.FlowNodeModel.update(openAiMassage, {
      where: { id, userId },
      returning: true,
    });
  }

  delete(id: string, userId: string): Promise<number> {
    return this.FlowNodeModel.destroy({ where: { id, userId } });
  }

  deleteAll(userId: string): Promise<number> {
    return this.FlowNodeModel.destroy({
      truncate: true,
      where: {
        userId,
      },
    });
  }
}

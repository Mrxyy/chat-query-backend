import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  Comment,
  CreatedAt,
  UpdatedAt,
  AllowNull,
  ForeignKey,
} from 'sequelize-typescript';
import { User } from './User.model';

@Table
export class Workflow extends Model {
  @PrimaryKey
  @Comment('id')
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Default(`{}`)
  @Column(DataType.JSON)
  flowJson: ReactFlowJsonObject;

  @Comment('名称')
  @AllowNull(true)
  @Column(DataType.STRING)
  name: string;

  @AllowNull(true)
  @Column(DataType.UUID)
  @ForeignKey(() => User)
  userId: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @Column(DataType.DATE)
  DeletedAt: Date;
}
export type ReactFlowJsonObject = {
  nodes: any[];
  edges: any[];
  viewport: any;
};

interface Dependence {
  [key: string]: {
    dependence: {
      [key: string]: {
        source: string;
        sourceHandle: string;
        target: string;
        targetHandle: number;
        id: string;
      };
    };
    inverse: {
      [key: string]: {
        source: string;
        sourceHandle: string;
        target: string;
        targetHandle: number;
        id: string;
      };
    };
  };
}

interface NodesMap {
  [key: string]: {
    id: string;
    type: string;
    data: NodeData;
    createdAt: Date;
    updatedAt: Date;
    DeletedAt: Date;
    position: {
      x: number;
      y: number;
    };
    width: number;
    height: number;
  };
}

interface NodeData {
  form: {
    type: string;
    required: string[];
    properties: {
      [key: string]: {
        type: string;
        title: string;
        default?: any;
        description?: string;
      };
    };
  };
  name: string;
  function: string;
  handlers: Handler[];
  description: string;
  config: {
    [key: string]: any;
  };
}

interface Handler {
  id: number;
  name: string;
  type: string;
}

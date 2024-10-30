import {
  Column,
  CreatedAt,
  Default,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
  DataType,
  Comment,
  ForeignKey,
  AllowNull,
} from 'sequelize-typescript';
import { User } from './User.model';
import { LLMConfig } from './LLMConfig.model';

// LLMModels Model
@Table
export class LLMModels extends Model {
  @PrimaryKey
  @Comment('ID')
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Comment('模型名称')
  @Column(DataType.STRING)
  name: string;

  @AllowNull(true)
  @Column(DataType.UUID)
  @ForeignKey(() => User)
  userId: string;

  @Comment('基础URL')
  @Column(DataType.STRING)
  baseURL: string;

  @Comment('请求模型路径')
  @Column(DataType.STRING)
  requestModelsPath: string;

  @Comment('从响应中获取模型路径')
  @Column(DataType.STRING)
  getModelsPathFormResponse: string;

  @Comment('默认模型列表')
  @Column(DataType.STRING)
  defaultModelsList: string;

  @Comment('创建功能标识')
  @Column(DataType.STRING)
  createFunction: string;

  @Comment('密钥')
  @Column(DataType.STRING)
  authToken: string;

  @ForeignKey(() => LLMConfig)
  @Column(DataType.UUID)
  llmConfigId: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @Column(DataType.DATE)
  DeletedAt: Date;
}

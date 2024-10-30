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

// LLMConfig Model
@Table
export class FeatureAiSetting extends Model {
  @PrimaryKey
  @Comment('ID')
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @AllowNull(true)
  @Column(DataType.UUID)
  @ForeignKey(() => User)
  userId: string;

  @Comment('名称')
  @Column(DataType.STRING)
  modelName: string;

  @Comment('功能名称')
  @Column(DataType.STRING)
  featureName: string;

  @Comment('设置')
  @Column(DataType.JSON)
  config: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @Column(DataType.DATE)
  DeletedAt: Date;
}

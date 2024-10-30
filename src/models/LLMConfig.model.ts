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
  HasMany,
} from 'sequelize-typescript';
import { LLMModels } from './LLMModels.model';
import { User } from './User.model';

// LLMConfig Model
@Table
export class LLMConfig extends Model {
  @PrimaryKey
  @Comment('ID')
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @AllowNull(true)
  @Column(DataType.UUID)
  @ForeignKey(() => User)
  userId: string;

  @Comment('默认模型')
  @Column(DataType.STRING)
  defaultModel: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @Column(DataType.DATE)
  DeletedAt: Date;

  @HasMany(() => LLMModels)
  models: LLMModels[];
}

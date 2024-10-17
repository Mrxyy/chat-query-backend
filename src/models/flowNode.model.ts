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
  DeletedAt,
  AllowNull,
  ForeignKey,
} from 'sequelize-typescript';
import { User } from './User.model';

interface Data {
  name: string;
  description: string;
  function: string;
  handlers: any[];
  form: any;
}

@Table
export class FlowNode extends Model {
  @PrimaryKey
  @Comment('id')
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @AllowNull(true)
  @Column(DataType.UUID)
  @ForeignKey(() => User)
  userId: string;

  @Column(DataType.STRING)
  type: string;

  @Column(DataType.JSON)
  data: Data;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @DeletedAt
  DeletedAt: Date;
}

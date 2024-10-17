import {
  Table,
  Column,
  Model,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  PrimaryKey,
  DataType,
  Comment,
  Default,
  ForeignKey,
  AllowNull,
} from 'sequelize-typescript';
import { DB } from './DB.model';
import { User } from './User.model';

@Table
export class ActionModel extends Model {
  @PrimaryKey
  @Comment('id')
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @ForeignKey(() => DB)
  @Column(DataType.UUID)
  DbId: string;

  @AllowNull(true)
  @Column(DataType.UUID)
  @ForeignKey(() => User)
  userId: string;

  @CreatedAt
  createdAt: Date;
  @UpdatedAt
  updatedAt: Date;
  @DeletedAt
  DeletedAt: Date;
}

import {
  Table,
  Column,
  Model,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  ForeignKey,
  AllowNull,
  DataType,
} from 'sequelize-typescript';
import { DB } from './DB.model';
import { Schema } from './schema.model';
import { User } from './User.model';

@Table
export class DBSchema extends Model {
  @ForeignKey(() => DB)
  @Column
  DBId: string;

  @AllowNull(true)
  @Column(DataType.UUID)
  @ForeignKey(() => User)
  userId: string;

  @ForeignKey(() => Schema)
  @Column
  SchemaId: string;

  @CreatedAt
  createdAt: Date;
  @UpdatedAt
  updatedAt: Date;
  @DeletedAt
  DeletedAt: Date;
}

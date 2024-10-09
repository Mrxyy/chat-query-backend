import {
  Table,
  Column,
  Model,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  ForeignKey,
} from 'sequelize-typescript';
import { DB } from './DB.model';
import { Schema } from '../Schema/schema.model';

@Table
export class DBSchema extends Model {
  @ForeignKey(() => DB)
  @Column
  DBId: string;

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

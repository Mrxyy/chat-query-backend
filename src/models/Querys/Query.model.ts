import { Schema } from './../Schema/schema.model';
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
  AllowNull,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { DB } from '../Database/DB.model';

@Table
export class Query extends Model {
  @PrimaryKey
  @Comment('id')
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Comment('Query名称')
  @AllowNull(false)
  @Column
  name: string;

  @Comment('内容')
  @AllowNull(false)
  @Column({
    type: DataType.JSON,
  })
  content: string;

  @BelongsTo(() => Schema, {
    foreignKey: 'schemaId',
  })
  Schema: Schema;

  @BelongsTo(() => DB, {
    foreignKey: 'DbID',
  })
  DB: DB;

  @ForeignKey(() => DB)
  @Column(DataType.UUID)
  DbID: string;

  @ForeignKey(() => Schema)
  @Column(DataType.UUID)
  schemaId: string;

  @CreatedAt
  createdAt: Date;
  @UpdatedAt
  updatedAt: Date;
  @DeletedAt
  DeletedAt: Date;
}

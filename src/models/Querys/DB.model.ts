import { Schema } from '../Schema/schema.model';
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
  HasMany,
} from 'sequelize-typescript';
import { Query } from './Query.model';

@Table
export class DB extends Model {
  @PrimaryKey
  @Comment('id')
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @HasMany(() => Query, {
    sourceKey: 'id',
    foreignKey: 'DbID',
  })
  Queries: Query[];

  @Comment('连接名称')
  @AllowNull(false)
  @Column
  name: string;

  @Comment('配置')
  @AllowNull(false)
  @Column({
    type: DataType.JSON,
  })
  config: JSON;

  @BelongsTo(() => Schema, {
    foreignKey: 'schemaId',
  })
  Schema: string;

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

import { Schema } from './schema.model';
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
import { DB } from './DB.model';
import { User } from './User.model';

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

  @AllowNull(true)
  @Column(DataType.UUID)
  @ForeignKey(() => User)
  userId: string;

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

import {
  Table,
  Column,
  Model,
  PrimaryKey,
  DataType,
  Comment,
  Default,
  AllowNull,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { Schema } from './schema.model';
import { User } from './User.model';

@Table
export class SchemaLog extends Model {
  @PrimaryKey
  @Comment('id')
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @AllowNull(true)
  @Column(DataType.UUID)
  @ForeignKey(() => User)
  userId: string;

  @BelongsTo(() => Schema, {
    foreignKey: 'schemaId',
  })
  Schema: string;

  @ForeignKey(() => Schema)
  @Column(DataType.UUID)
  schemaId: string;

  @Comment('模型名称')
  @AllowNull(false)
  @Column
  name: string;

  @Comment('模型结构')
  @AllowNull(false)
  @Column({
    type: DataType.JSON,
  })
  graph: string;

  createdAt: Date;
  updatedAt: Date;
  DeletedAt: Date;
}

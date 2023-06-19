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
  HasMany,
} from 'sequelize-typescript';
import { SchemaLog } from './SchemaLog.model';

@Table
export class Schema extends Model {
  @PrimaryKey
  @Comment('id')
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @HasMany(() => SchemaLog, {
    foreignKey: 'schemaId',
    sourceKey: 'id',
  })
  schemaLogs: SchemaLog[];

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

  @Comment('模型描述')
  @AllowNull(true)
  @Column({
    type: DataType.STRING(10000),
  })
  description: string;

  @CreatedAt
  createdAt: Date;
  @UpdatedAt
  updatedAt: Date;
  @DeletedAt
  DeletedAt: Date;
}

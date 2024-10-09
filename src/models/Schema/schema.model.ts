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
  BelongsToMany,
} from 'sequelize-typescript';
import { SchemaLog } from './SchemaLog.model';
import { DBSchema } from '../Database/DBSchema.model';
import { DB } from '../Database/DB.model';

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

  @BelongsToMany(() => DB, () => DBSchema)
  DBs: DB[];

  @Comment('模型名称')
  @AllowNull(false)
  @Column
  name: string;

  @Comment('模型结构')
  @AllowNull(false)
  @Column({
    type: DataType.JSON,
  })
  graph: typeof DataType.JSON;

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

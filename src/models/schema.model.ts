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
  ForeignKey,
} from 'sequelize-typescript';
import { SchemaLog } from './SchemaLog.model';
import { DBSchema } from './DBSchema.model';
import { DB } from './DB.model';
import { User } from './User.model';

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

  @AllowNull(true)
  @Column(DataType.UUID)
  @ForeignKey(() => User)
  userId: string;

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

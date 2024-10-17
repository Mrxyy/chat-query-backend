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
  HasMany,
  BelongsToMany,
} from 'sequelize-typescript';
import { Query } from './Query.model';
import { DBSchema } from './DBSchema.model';
import { User } from './User.model';

@Table
export class DB extends Model {
  @PrimaryKey
  @Comment('id')
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @AllowNull(true)
  @Column(DataType.UUID)
  @ForeignKey(() => User)
  userId: string;

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

  // @BelongsTo(() => Schema, {
  //   foreignKey: 'schemaId',
  // })
  // Schema: string;

  // @ForeignKey(() => Schema)
  // @AllowNull(true)
  // @Column(DataType.UUID)
  // schemaId: string;

  @BelongsToMany(() => Schema, () => DBSchema)
  schemas: Schema[];

  @CreatedAt
  createdAt: Date;
  @UpdatedAt
  updatedAt: Date;
  @DeletedAt
  DeletedAt: Date;
}

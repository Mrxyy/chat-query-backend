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
  Unique,
} from 'sequelize-typescript';

@Table
export class Widgets extends Model {
  @PrimaryKey
  @Comment('id')
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Comment('组件内容')
  @AllowNull(false)
  @Column({
    type: DataType.JSON,
  })
  content: typeof DataType.JSON;

  @Comment('组件配置')
  @AllowNull(false)
  @Column({
    type: DataType.JSON,
  })
  props: typeof DataType.JSON;

  @Comment('组件名称')
  @Column({
    type: DataType.JSON,
  })
  name: typeof DataType.JSON;

  @Unique('widget-key')
  @Comment('组件识别名称')
  @Column({
    type: DataType.STRING(100),
  })
  key: string;

  @Comment('作者ID')
  @AllowNull(true)
  @Column({
    type: DataType.STRING(1000),
  })
  author: string;

  @CreatedAt
  createdAt: Date;
  @UpdatedAt
  updatedAt: Date;
  @DeletedAt
  DeletedAt: Date;
}

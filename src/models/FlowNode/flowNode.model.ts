import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  Comment,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
} from 'sequelize-typescript';

interface Data {
  name: string;
  description: string;
  function: string;
  handlers: any[];
  form: any;
}

@Table
export class FlowNode extends Model {
  @PrimaryKey
  @Comment('id')
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Column(DataType.STRING)
  type: string;

  @Column(DataType.JSON)
  data: Data;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @DeletedAt
  DeletedAt: Date;
}

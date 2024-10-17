import {
  Table,
  Model,
  Column,
  DataType,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
} from 'sequelize-typescript';

@Table
export class User extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  image: string;

  @Column({
    type: DataType.DATE,
  })
  emailVerified: string;

  @CreatedAt
  createdAt: Date;
  @UpdatedAt
  updatedAt: Date;
  @DeletedAt
  DeletedAt: Date;
}

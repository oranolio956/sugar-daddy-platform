import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';

@Table({
  tableName: 'email_verifications',
  timestamps: true,
})
export class EmailVerification extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  token!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  expiresAt!: Date;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  used!: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  verifiedAt?: Date;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  attempts!: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  lastAttemptAt?: Date;
}
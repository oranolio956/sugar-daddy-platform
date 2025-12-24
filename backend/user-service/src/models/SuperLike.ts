import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';

@Table({
  tableName: 'super_likes',
  timestamps: true,
})
export class SuperLike extends Model {
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
  senderId!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  receiverId!: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isMutual!: boolean;

  @Column({
    type: DataType.DATE,
  })
  usedAt?: Date;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  isActive!: boolean;

  @BelongsTo(() => User, 'senderId')
  sender!: User;

  @BelongsTo(() => User, 'receiverId')
  receiver!: User;
}
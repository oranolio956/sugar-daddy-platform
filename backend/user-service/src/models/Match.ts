import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';

@Table({
  tableName: 'matches',
  timestamps: true,
})
export class Match extends Model {
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

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  matchedUserId!: string;

  @Column({
    type: DataType.ENUM('pending', 'accepted', 'rejected', 'blocked'),
    defaultValue: 'pending',
  })
  status!: 'pending' | 'accepted' | 'rejected' | 'blocked';

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isMutual!: boolean;

  @Column({
    type: DataType.DATE,
  })
  matchedAt!: Date;

  @BelongsTo(() => User, 'userId')
  user!: User;

  @BelongsTo(() => User, 'matchedUserId')
  matchedUser!: User;
}
import { Table, Column, Model, DataType, HasMany, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { User } from './User';
import { Message } from './Message';

@Table({
  tableName: 'conversations',
  timestamps: true,
})
export class Conversation extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  })
  user1Id!: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  })
  user2Id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'active',
  })
  status!: 'active' | 'archived' | 'blocked';

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isTypingUser1!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isTypingUser2!: boolean;

  @Column({
    type: DataType.DATE,
  })
  lastMessageAt?: Date;

  @Column({
    type: DataType.STRING,
  })
  lastMessageId?: string;

  @Column({
    type: DataType.JSON,
    allowNull: false,
    defaultValue: {
      user1: { readCount: 0, unreadCount: 0 },
      user2: { readCount: 0, unreadCount: 0 },
    },
  })
  messageStats!: {
    user1: { readCount: number; unreadCount: number };
    user2: { readCount: number; unreadCount: number };
  };

  // Associations
  @ForeignKey(() => User)
  @Column({ type: DataType.UUID })
  user1Id!: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID })
  user2Id!: string;

  @BelongsTo(() => User, 'user1Id')
  user1!: User;

  @BelongsTo(() => User, 'user2Id')
  user2!: User;

  @HasMany(() => Message)
  messages!: Message[];
}
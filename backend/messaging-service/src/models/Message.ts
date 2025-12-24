import { Table, Column, Model, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { User } from './User';
import { Conversation } from './Conversation';

@Table({
  tableName: 'messages',
  timestamps: true,
})
export class Message extends Model {
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
      model: 'conversations',
      key: 'id',
    },
  })
  conversationId!: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  })
  senderId!: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  })
  receiverId!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  content!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  messageType!: 'text' | 'image' | 'video' | 'gift' | 'audio' | 'sticker';

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  mediaData?: {
    url?: string;
    thumbnail?: string;
    size?: number;
    duration?: number;
  };

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isRead!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isDelivered!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isDeleted!: boolean;

  @Column({
    type: DataType.DATE,
  })
  readAt?: Date;

  @Column({
    type: DataType.DATE,
  })
  deliveredAt?: Date;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  metadata?: {
    replyTo?: string;
    mentions?: string[];
    reactions?: { userId: string; emoji: string; timestamp: Date }[];
  };

  // Associations
  @ForeignKey(() => Conversation)
  @Column({ type: DataType.UUID })
  conversationId!: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID })
  senderId!: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID })
  receiverId!: string;

  @BelongsTo(() => Conversation)
  conversation!: Conversation;

  @BelongsTo(() => User, 'senderId')
  sender!: User;

  @BelongsTo(() => User, 'receiverId')
  receiver!: User;
}
import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';

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
    type: DataType.TEXT,
    allowNull: false,
  })
  content!: string;

  @Column({
    type: DataType.ENUM('text', 'image', 'video', 'gift', 'location'),
    defaultValue: 'text',
  })
  type!: 'text' | 'image' | 'video' | 'gift' | 'location';

  @Column({
    type: DataType.JSON,
  })
  metadata?: {
    imageUrl?: string;
    videoUrl?: string;
    giftId?: string;
    location?: {
      lat: number;
      lng: number;
      address: string;
    };
  };

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isRead!: boolean;

  @Column({
    type: DataType.DATE,
  })
  readAt?: Date;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isDeleted!: boolean;

  @BelongsTo(() => User, 'senderId')
  sender!: User;

  @BelongsTo(() => User, 'receiverId')
  receiver!: User;
}
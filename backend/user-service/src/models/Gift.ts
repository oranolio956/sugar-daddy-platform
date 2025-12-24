import { Table, Column, Model, DataType, BelongsTo } from 'sequelize-typescript';
import { User } from './User';

@Table({
  tableName: 'gifts',
  timestamps: true,
})
export class Gift extends Model {
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
    type: DataType.STRING,
    allowNull: false,
  })
  type!: 'virtual' | 'premium' | 'custom';

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description?: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  value!: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  imageUrl?: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  metadata?: {
    animation?: string;
    sound?: string;
    specialEffects?: string[];
  };

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isDelivered!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isRead!: boolean;

  @Column({
    type: DataType.DATE,
  })
  deliveredAt?: Date;

  @Column({
    type: DataType.DATE,
  })
  readAt?: Date;

  // Associations
  @BelongsTo(() => User, 'senderId')
  sender!: User;

  @BelongsTo(() => User, 'receiverId')
  receiver!: User;
}
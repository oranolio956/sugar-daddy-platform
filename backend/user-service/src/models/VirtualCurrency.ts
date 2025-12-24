import { Table, Column, Model, DataType, BelongsTo } from 'sequelize-typescript';
import { User } from './User';

@Table({
  tableName: 'virtual_currency',
  timestamps: true,
})
export class VirtualCurrency extends Model {
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
  userId!: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  })
  balance!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  })
  totalEarned!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  })
  totalSpent!: number;

  @Column({
    type: DataType.JSON,
    allowNull: false,
    defaultValue: {
      giftsReceived: 0,
      giftsSent: 0,
      premiumGiftsReceived: 0,
      premiumGiftsSent: 0,
    },
  })
  giftStats!: {
    giftsReceived: number;
    giftsSent: number;
    premiumGiftsReceived: number;
    premiumGiftsSent: number;
  };

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  isActive!: boolean;

  // Associations
  @BelongsTo(() => User)
  user!: User;
}
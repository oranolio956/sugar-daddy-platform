import { Table, Column, Model, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { User } from './User';

@Table({
  tableName: 'premium_features',
  timestamps: true,
})
export class PremiumFeature extends Model {
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
    type: DataType.ENUM('incognito', 'profile_boost', 'travel_mode', 'priority_support', 'advanced_analytics'),
    allowNull: false,
  })
  featureType!: 'incognito' | 'profile_boost' | 'travel_mode' | 'priority_support' | 'advanced_analytics';

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isActive!: boolean;

  @Column({
    type: DataType.DATE,
  })
  startDate?: Date;

  @Column({
    type: DataType.DATE,
  })
  endDate?: Date;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  settings?: {
    visibilityLevel?: 'hidden' | 'limited' | 'full';
    boostDuration?: number;
    travelLocation?: string;
    travelRadius?: number;
    analyticsPeriod?: 'week' | 'month' | 'quarter';
  };

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  })
  cost!: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  paymentTransactionId?: string;

  // Associations
  @ForeignKey(() => User)
  @Column({ type: DataType.UUID })
  userId!: string;

  @BelongsTo(() => User)
  user!: User;
}
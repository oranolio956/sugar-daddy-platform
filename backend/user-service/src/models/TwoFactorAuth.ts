import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';

@Table({
  tableName: 'two_factor_auth',
  timestamps: true,
})
export class TwoFactorAuth extends Model {
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
  secret!: string;

  @Column({
    type: DataType.JSON,
    allowNull: false,
    defaultValue: [],
  })
  backupCodes!: string[];

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  enabled!: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  enabledAt?: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  lastUsedAt?: Date;

  @Column({
    type: DataType.JSON,
    allowNull: false,
    defaultValue: [],
  })
  trustedDevices!: Array<{
    deviceId: string;
    deviceName: string;
    lastUsed: Date;
    expiresAt: Date;
  }>;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  setupRequired!: boolean;
}
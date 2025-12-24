import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';

@Table({
  tableName: 'device_sessions',
  timestamps: true,
})
export class DeviceSession extends Model {
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
  deviceId!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  deviceName!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  userAgent!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  ipAddress!: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  trusted!: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  lastUsedAt?: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  expiresAt?: Date;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  active!: boolean;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  location?: {
    country?: string;
    region?: string;
    city?: string;
    timezone?: string;
  };
}
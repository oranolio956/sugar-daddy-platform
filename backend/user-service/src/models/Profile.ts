import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';
import { encrypt, decrypt } from '../utils/encryption';

@Table({
  tableName: 'profiles',
  timestamps: true,
})
export class Profile extends Model {
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

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  firstName!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  lastName!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 18,
      max: 100,
    },
  })
  age!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  location!: string;

  @Column({
    type: DataType.TEXT,
  })
  bio?: string;

  @Column({
    type: DataType.STRING,
    set(value: string) {
      try {
        this.setDataValue('phone', encrypt(value));
      } catch (error) {
        console.error('Failed to encrypt phone:', error);
        this.setDataValue('phone', value);
      }
    },
    get() {
      const value = this.getDataValue('phone');
      try {
        return decrypt(value);
      } catch (error) {
        console.error('Failed to decrypt phone:', error);
        return value;
      }
    }
  })
  phone?: string;

  @Column({
    type: DataType.STRING,
  })
  profileImage?: string;

  @Column({
    type: DataType.STRING,
  })
  coverImage?: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  verified!: boolean;

  @Column({
    type: DataType.ENUM('none', 'basic', 'premium', 'elite'),
    defaultValue: 'none',
  })
  verificationLevel!: 'none' | 'basic' | 'premium' | 'elite';

  @Column({
    type: DataType.JSON,
  })
  socialLinks?: {
    linkedin?: string;
    instagram?: string;
    twitter?: string;
  };

  @Column({
    type: DataType.JSON,
  })
  portfolio?: {
    occupation: string;
    company?: string;
    education?: string;
    netWorth?: string;
    monthlyBudget?: string;
  };

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isActive!: boolean;

  @BelongsTo(() => User)
  user!: User;
}
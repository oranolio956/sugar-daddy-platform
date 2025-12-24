import { Table, Column, Model, DataType, HasMany, BelongsToMany } from 'sequelize-typescript';
import { Profile } from './Profile';
import { Match } from './Match';
import { Message } from './Message';
import { TwoFactorAuth } from './TwoFactorAuth';
import { EmailVerification } from './EmailVerification';
import { PasswordReset } from './PasswordReset';
import { DeviceSession } from './DeviceSession';
import { VerificationDocument } from './VerificationDocument';
import { encrypt, decrypt } from '../utils/encryption';

@Table({
  tableName: 'users',
  timestamps: true,
})
export class User extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    set(value: string) {
      try {
        this.setDataValue('email', encrypt(value));
      } catch (error) {
        console.error('Failed to encrypt email:', error);
        this.setDataValue('email', value);
      }
    },
    get() {
      const value = this.getDataValue('email');
      try {
        return decrypt(value);
      } catch (error) {
        console.error('Failed to decrypt email:', error);
        return value;
      }
    }
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  username!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    set(value: string) {
      try {
        this.setDataValue('passwordHash', encrypt(value));
      } catch (error) {
        console.error('Failed to encrypt password hash:', error);
        this.setDataValue('passwordHash', value);
      }
    },
    get() {
      const value = this.getDataValue('passwordHash');
      try {
        return decrypt(value);
      } catch (error) {
        console.error('Failed to decrypt password hash:', error);
        return value;
      }
    }
  })
  passwordHash!: string;

  @Column({
    type: DataType.ENUM('sugar_daddy', 'sugar_baby', 'admin'),
    allowNull: false,
  })
  role!: 'sugar_daddy' | 'sugar_baby' | 'admin';

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  emailVerified!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  twoFactorEnabled!: boolean;

  @Column({
    type: DataType.JSON,
    allowNull: false,
    defaultValue: {
      tier: 'free',
      status: 'active',
      features: ['basic_profile', 'basic_matching', 'limited_messages'],
      expiresAt: null,
    },
  })
  subscription!: {
    tier: 'free' | 'premium' | 'elite' | 'vip';
    status: 'active' | 'inactive' | 'cancelled' | 'past_due';
    features: string[];
    expiresAt?: string;
  };

  @Column({
    type: DataType.JSON,
    allowNull: false,
    defaultValue: {
      lookingFor: 'sugar_baby',
      ageRange: [18, 50],
      location: '',
      distance: 50,
    },
  })
  preferences!: {
    lookingFor: 'sugar_daddy' | 'sugar_baby';
    ageRange: [number, number];
    location: string;
    distance: number;
    budget?: {
      min: number;
      max: number;
    };
    interests: string[];
    dealBreakers: string[];
  };

  @Column({
    type: DataType.JSON,
    allowNull: false,
    defaultValue: {
      emailNotifications: true,
      pushNotifications: true,
      profileVisibility: 'public',
      showOnlineStatus: true,
      showLastSeen: true,
      allowMessages: 'everyone',
      marketingEmails: false,
      language: 'en',
      timezone: 'UTC',
    },
  })
  settings!: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    profileVisibility: 'public' | 'private' | 'verified_only';
    showOnlineStatus: boolean;
    showLastSeen: boolean;
    allowMessages: 'everyone' | 'verified' | 'premium' | 'none';
    marketingEmails: boolean;
    language: string;
    timezone: string;
  };

  @Column({
    type: DataType.JSON,
    allowNull: false,
    defaultValue: {
      profileViews: 0,
      likesReceived: 0,
      messagesSent: 0,
      matchesCount: 0,
      responseRate: 0,
    },
  })
  stats!: {
    profileViews: number;
    likesReceived: number;
    messagesSent: number;
    matchesCount: number;
    responseRate: number;
  };

  @Column({
    type: DataType.JSON,
    allowNull: false,
    defaultValue: {
      lastPasswordChange: new Date().toISOString(),
      loginAttempts: 0,
      trustedDevices: [],
    },
  })
  security!: {
    lastPasswordChange: string;
    loginAttempts: number;
    lockedUntil?: string;
    trustedDevices: any[];
  };

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  lastLoginAt!: Date;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  lastActivityAt!: Date;

  // Associations
  @HasMany(() => Profile)
  profiles!: Profile[];

  @BelongsToMany(() => User, () => Match, 'userId', 'matchedUserId')
  matches!: User[];

  @HasMany(() => Message)
  sentMessages!: Message[];

  @HasMany(() => Message)
  receivedMessages!: Message[];

  @HasMany(() => TwoFactorAuth)
  twoFactorAuth!: TwoFactorAuth[];

  @HasMany(() => EmailVerification)
  emailVerifications!: EmailVerification[];

  @HasMany(() => PasswordReset)
  passwordResets!: PasswordReset[];

  @HasMany(() => DeviceSession)
  deviceSessions!: DeviceSession[];

  @HasMany(() => VerificationDocument)
  verificationDocuments!: VerificationDocument[];
}
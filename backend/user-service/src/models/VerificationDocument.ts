import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';

@Table({
  tableName: 'verification_documents',
  timestamps: true,
})
export class VerificationDocument extends Model {
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
    type: DataType.ENUM('photo_id', 'utility_bill', 'bank_statement', 'selfie'),
    allowNull: false,
  })
  type!: 'photo_id' | 'utility_bill' | 'bank_statement' | 'selfie';

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  fileName!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  fileUrl!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  fileHash?: string;

  @Column({
    type: DataType.ENUM('pending', 'approved', 'rejected', 'expired'),
    defaultValue: 'pending',
  })
  status!: 'pending' | 'approved' | 'rejected' | 'expired';

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  rejectionReason?: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  verifiedAt?: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  expiresAt?: Date;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  metadata?: {
    fileSize: number;
    mimeType: string;
    dimensions?: {
      width: number;
      height: number;
    };
    detectedText?: string[];
  };
}
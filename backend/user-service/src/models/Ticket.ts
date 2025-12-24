import { Table, Column, Model, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { User } from './User';

@Table({
  tableName: 'support_tickets',
  timestamps: true,
})
export class Ticket extends Model {
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
    type: DataType.STRING,
    allowNull: false,
  })
  subject!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description!: string;

  @Column({
    type: DataType.ENUM('general', 'billing', 'technical', 'account', 'security', 'verification'),
    allowNull: false,
  })
  category!: 'general' | 'billing' | 'technical' | 'account' | 'security' | 'verification';

  @Column({
    type: DataType.ENUM('low', 'medium', 'high', 'urgent'),
    allowNull: false,
    defaultValue: 'medium',
  })
  priority!: 'low' | 'medium' | 'high' | 'urgent';

  @Column({
    type: DataType.ENUM('open', 'in_progress', 'resolved', 'closed'),
    allowNull: false,
    defaultValue: 'open',
  })
  status!: 'open' | 'in_progress' | 'resolved' | 'closed';

  @Column({
    type: DataType.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  })
  assignedTo?: string;

  @Column({
    type: DataType.DATE,
  })
  resolvedAt?: Date;

  @Column({
    type: DataType.DATE,
  })
  closedAt?: Date;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  metadata?: {
    attachments?: string[];
    tags?: string[];
    relatedTickets?: string[];
  };

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  replyCount!: number;

  // Associations
  @ForeignKey(() => User)
  @Column({ type: DataType.UUID })
  userId!: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID })
  assignedTo?: string;

  @BelongsTo(() => User, 'userId')
  user!: User;

  @BelongsTo(() => User, 'assignedTo')
  agent?: User;
}
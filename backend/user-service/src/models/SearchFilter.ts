import { Table, Column, Model, DataType, BelongsTo } from 'sequelize-typescript';
import { User } from './User';

@Table({
  tableName: 'search_filters',
  timestamps: true,
})
export class SearchFilter extends Model {
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
    defaultValue: 'default',
  })
  name!: string;

  @Column({
    type: DataType.JSON,
    allowNull: false,
    defaultValue: {
      location: {
        enabled: false,
        coordinates: null,
        radius: 50,
      },
      incomeVerification: {
        enabled: false,
        minIncome: 0,
        maxIncome: null,
      },
      lifestylePreferences: {
        enabled: false,
        interests: [],
        dealBreakers: [],
        lifestyle: [],
      },
      ageRange: [18, 50],
      relationshipType: 'all',
      verifiedOnly: false,
      premiumOnly: false,
      onlineNow: false,
      recentlyActive: false,
    },
  })
  filters!: {
    location: {
      enabled: boolean;
      coordinates: { lat: number; lng: number } | null;
      radius: number;
    };
    incomeVerification: {
      enabled: boolean;
      minIncome: number;
      maxIncome: number | null;
    };
    lifestylePreferences: {
      enabled: boolean;
      interests: string[];
      dealBreakers: string[];
      lifestyle: string[];
    };
    ageRange: [number, number];
    relationshipType: 'all' | 'sugar_daddy' | 'sugar_baby';
    verifiedOnly: boolean;
    premiumOnly: boolean;
    onlineNow: boolean;
    recentlyActive: boolean;
  };

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  isActive!: boolean;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  usageCount!: number;

  @Column({
    type: DataType.DATE,
  })
  lastUsedAt!: Date;

  // Associations
  @BelongsTo(() => User)
  user!: User;
}
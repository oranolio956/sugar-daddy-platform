import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';

export interface PersonalityTraits {
  openness: number;        // Openness to experience (0-100)
  conscientiousness: number; // Conscientiousness (0-100)
  extraversion: number;    // Extraversion (0-100)
  agreeableness: number;   // Agreeableness (0-100)
  neuroticism: number;     // Neuroticism (0-100, inverted for emotional stability)
}

export interface LifestylePreferences {
  relationshipType: 'casual' | 'serious' | 'marriage' | 'friendship';
  frequency: 'daily' | 'weekly' | 'monthly' | 'occasional';
  budget: 'low' | 'medium' | 'high' | 'luxury';
  travel: 'local' | 'domestic' | 'international' | 'frequent_traveler';
  socialLife: 'introvert' | 'balanced' | 'extrovert' | 'social_butterfly';
  workLife: 'workaholic' | 'balanced' | 'work_life_balance' | 'minimal_work';
}

export interface DealBreakers {
  smoking: boolean;
  drinking: boolean;
  drugs: boolean;
  religion: 'not_important' | 'same' | 'different' | 'agnostic' | 'atheist' | 'spiritual';
  politics: 'not_important' | 'liberal' | 'moderate' | 'conservative' | 'apolitical';
  children: 'not_important' | 'has_children' | 'no_children' | 'wants_children' | 'doesnt_want_children';
  marriage: 'not_important' | 'married' | 'divorced' | 'never_married' | 'separated';
}

@Table({
  tableName: 'personality_profiles',
  timestamps: true,
})
export class PersonalityProfile extends Model {
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
    type: DataType.JSON,
    allowNull: false,
  })
  personalityTraits!: PersonalityTraits;

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  lifestylePreferences!: LifestylePreferences;

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  dealBreakers!: DealBreakers;

  @Column({
    type: DataType.JSON,
  })
  interests!: string[];

  @Column({
    type: DataType.TEXT,
  })
  aboutMe?: string;

  @Column({
    type: DataType.TEXT,
  })
  whatImLookingFor?: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  profileCompleteness!: number; // 0-100 percentage

  @Column({
    type: DataType.DATE,
  })
  completedAt?: Date;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isActive!: boolean;

  @BelongsTo(() => User)
  user!: User;

  // Calculate compatibility score with another profile
  calculateCompatibility(otherProfile: PersonalityProfile): number {
    let score = 0;
    let totalWeight = 0;

    // Personality traits compatibility (40% weight)
    const traitWeight = 40;
    const traitScore = this.calculatePersonalityCompatibility(otherProfile.personalityTraits);
    score += traitScore * (traitWeight / 100);
    totalWeight += traitWeight;

    // Lifestyle preferences compatibility (35% weight)
    const lifestyleWeight = 35;
    const lifestyleScore = this.calculateLifestyleCompatibility(otherProfile.lifestylePreferences);
    score += lifestyleScore * (lifestyleWeight / 100);
    totalWeight += lifestyleWeight;

    // Deal breakers check (25% weight - can eliminate match)
    const dealBreakerWeight = 25;
    const dealBreakerScore = this.checkDealBreakers(otherProfile) ? 100 : 0;
    score += dealBreakerScore * (dealBreakerWeight / 100);
    totalWeight += dealBreakerWeight;

    return Math.round(score);
  }

  private calculatePersonalityCompatibility(otherTraits: PersonalityTraits): number {
    const traits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness'] as const;
    let totalDifference = 0;

    traits.forEach(trait => {
      const difference = Math.abs(this.personalityTraits[trait] - otherTraits[trait]);
      totalDifference += difference;
    });

    // Convert difference to compatibility score (lower difference = higher compatibility)
    const averageDifference = totalDifference / traits.length;
    return Math.max(0, 100 - averageDifference);
  }

  private calculateLifestyleCompatibility(otherPreferences: LifestylePreferences): number {
    let compatibility = 100;

    // Relationship type compatibility
    if (this.lifestylePreferences.relationshipType !== otherPreferences.relationshipType) {
      compatibility -= 30;
    }

    // Frequency compatibility
    const frequencyOrder = ['occasional', 'monthly', 'weekly', 'daily'];
    const thisFreqIndex = frequencyOrder.indexOf(this.lifestylePreferences.frequency);
    const otherFreqIndex = frequencyOrder.indexOf(otherPreferences.frequency);
    const freqDifference = Math.abs(thisFreqIndex - otherFreqIndex);
    compatibility -= freqDifference * 10;

    // Budget compatibility
    const budgetOrder = ['low', 'medium', 'high', 'luxury'];
    const thisBudgetIndex = budgetOrder.indexOf(this.lifestylePreferences.budget);
    const otherBudgetIndex = budgetOrder.indexOf(otherPreferences.budget);
    const budgetDifference = Math.abs(thisBudgetIndex - otherBudgetIndex);
    compatibility -= budgetDifference * 15;

    // Travel compatibility
    if (this.lifestylePreferences.travel !== otherPreferences.travel) {
      compatibility -= 20;
    }

    return Math.max(0, compatibility);
  }

  private checkDealBreakers(otherProfile: PersonalityProfile): boolean {
    const otherDealBreakers = otherProfile.dealBreakers;

    // Check if any of our deal breakers match the other person's characteristics
    if (this.dealBreakers.smoking && otherDealBreakers.smoking) return false;
    if (this.dealBreakers.drinking && otherDealBreakers.drinking) return false;
    if (this.dealBreakers.drugs && otherDealBreakers.drugs) return false;

    // Religion compatibility
    if (this.dealBreakers.religion === 'same' && this.lifestylePreferences.religion !== otherProfile.lifestylePreferences.religion) {
      return false;
    }

    // Politics compatibility
    if (this.dealBreakers.politics === 'same' && this.lifestylePreferences.politics !== otherProfile.lifestylePreferences.politics) {
      return false;
    }

    // Children compatibility
    if (this.dealBreakers.children !== 'not_important' && this.dealBreakers.children !== otherProfile.dealBreakers.children) {
      return false;
    }

    // Marriage status compatibility
    if (this.dealBreakers.marriage !== 'not_important' && this.dealBreakers.marriage !== otherProfile.dealBreakers.marriage) {
      return false;
    }

    return true;
  }

  // Calculate profile completeness percentage
  calculateProfileCompleteness(): number {
    let completed = 0;
    let total = 0;

    // Personality traits (required)
    total += 5;
    if (this.personalityTraits && Object.keys(this.personalityTraits).length === 5) {
      completed += 5;
    }

    // Lifestyle preferences (required)
    total += 5;
    if (this.lifestylePreferences && Object.keys(this.lifestylePreferences).length >= 4) {
      completed += 5;
    }

    // Deal breakers (required)
    total += 3;
    if (this.dealBreakers && Object.keys(this.dealBreakers).length >= 3) {
      completed += 3;
    }

    // Interests (optional but recommended)
    total += 2;
    if (this.interests && this.interests.length >= 3) {
      completed += 2;
    }

    // About me (optional)
    total += 1;
    if (this.aboutMe && this.aboutMe.length >= 50) {
      completed += 1;
    }

    // What I'm looking for (optional)
    total += 1;
    if (this.whatImLookingFor && this.whatImLookingFor.length >= 50) {
      completed += 1;
    }

    return Math.round((completed / total) * 100);
  }
}
import { User } from '../models/User';
import { Profile } from '../models/Profile';
import { Match } from '../models/Match';
import { Op, literal } from 'sequelize';

export class SearchService {
  /**
   * Perform advanced search with filters
   */
  async advancedSearch(userId: string, searchParams: any) {
    const {
      location,
      incomeVerification,
      lifestylePreferences,
      ageRange,
      relationshipType,
      verifiedOnly,
      premiumOnly,
      onlineNow,
      recentlyActive,
      limit = 20,
      offset = 0
    } = searchParams;

    // Build where conditions
    const whereConditions: any = {
      id: { [Op.ne]: userId }, // Exclude current user
    };

    // Age range filter
    if (ageRange && ageRange.length === 2) {
      const minAge = ageRange[0];
      const maxAge = ageRange[1];
      whereConditions.age = {
        [Op.between]: [minAge, maxAge]
      };
    }

    // Relationship type filter
    if (relationshipType && relationshipType !== 'all') {
      whereConditions.role = relationshipType;
    }

    // Verification filter
    if (verifiedOnly) {
      whereConditions.emailVerified = true;
    }

    // Premium only filter
    if (premiumOnly) {
      whereConditions['subscription.tier'] = { [Op.in]: ['premium', 'elite', 'vip'] };
    }

    // Online status filter
    if (onlineNow) {
      whereConditions.lastActivityAt = {
        [Op.gt]: new Date(Date.now() - 15 * 60 * 1000) // Last 15 minutes
      };
    }

    // Recently active filter
    if (recentlyActive) {
      whereConditions.lastActivityAt = {
        [Op.gt]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      };
    }

    // Location-based search
    let locationCondition = null;
    if (location && location.enabled && location.coordinates) {
      const { lat, lng, radius } = location;
      const earthRadius = 6371; // km
      
      locationCondition = literal(`
        (6371 * acos(
          cos(radians(${lat})) * cos(radians(lat)) * 
          cos(radians(lng) - radians(${lng})) + 
          sin(radians(${lat})) * sin(radians(lat))
        )) <= ${radius}
      `);
    }

    // Income verification filter
    let incomeCondition = null;
    if (incomeVerification && incomeVerification.enabled) {
      const conditions: any[] = [];
      
      if (incomeVerification.minIncome > 0) {
        conditions.push({
          'incomeVerification.verifiedIncome': { [Op.gte]: incomeVerification.minIncome }
        });
      }
      
      if (incomeVerification.maxIncome) {
        conditions.push({
          'incomeVerification.verifiedIncome': { [Op.lte]: incomeVerification.maxIncome }
        });
      }

      if (conditions.length > 0) {
        incomeCondition = { [Op.and]: conditions };
      }
    }

    // Lifestyle preferences filter
    let lifestyleCondition = null;
    if (lifestylePreferences && lifestylePreferences.enabled) {
      const conditions: any[] = [];
      
      if (lifestylePreferences.interests?.length > 0) {
        conditions.push({
          'preferences.interests': { [Op.overlap]: lifestylePreferences.interests }
        });
      }
      
      if (lifestylePreferences.lifestyle?.length > 0) {
        conditions.push({
          'preferences.lifestyle': { [Op.overlap]: lifestylePreferences.lifestyle }
        });
      }

      if (conditions.length > 0) {
        lifestyleCondition = { [Op.and]: conditions };
      }
    }

    // Build include conditions for nested queries
    const includeConditions: any[] = [];

    if (locationCondition) {
      includeConditions.push({
        model: Profile,
        where: locationCondition,
        required: true
      });
    }

    if (incomeCondition) {
      includeConditions.push({
        model: Profile,
        where: incomeCondition,
        required: true
      });
    }

    if (lifestyleCondition) {
      includeConditions.push({
        model: Profile,
        where: lifestyleCondition,
        required: true
      });
    }

    // Execute search
    const users = await User.findAll({
      where: whereConditions,
      include: includeConditions,
      limit,
      offset,
      order: [['lastActivityAt', 'DESC']],
      attributes: { exclude: ['passwordHash'] }
    });

    // Get compatibility scores for each user
    const usersWithScores = await Promise.all(
      users.map(async (user) => {
        const compatibilityScore = await this.calculateCompatibilityScore(userId, user.id);
        return {
          ...user.toJSON(),
          compatibilityScore
        };
      })
    );

    // Sort by compatibility score if available
    usersWithScores.sort((a, b) => (b.compatibilityScore || 0) - (a.compatibilityScore || 0));

    return {
      users: usersWithScores,
      total: users.length,
      hasMore: users.length === limit
    };
  }

  /**
   * Calculate compatibility score between two users
   */
  async calculateCompatibilityScore(userId1: string, userId2: string): Promise<number> {
    try {
      const user1 = await User.findByPk(userId1, { include: [Profile] });
      const user2 = await User.findByPk(userId2, { include: [Profile] });

      if (!user1 || !user2) {
        return 0;
      }

      let score = 0;
      let maxScore = 0;

      // Age compatibility (10 points max)
      maxScore += 10;
      const ageDiff = Math.abs(user1.age - user2.age);
      if (ageDiff <= 5) score += 10;
      else if (ageDiff <= 10) score += 7;
      else if (ageDiff <= 15) score += 4;
      else if (ageDiff <= 20) score += 2;

      // Location compatibility (15 points max)
      maxScore += 15;
      if (user1.Profile?.location && user2.Profile?.location) {
        const distance = this.calculateDistance(
          user1.Profile.lat, user1.Profile.lng,
          user2.Profile.lat, user2.Profile.lng
        );
        if (distance <= 10) score += 15;
        else if (distance <= 50) score += 10;
        else if (distance <= 100) score += 5;
      }

      // Interest compatibility (25 points max)
      maxScore += 25;
      if (user1.preferences?.interests && user2.preferences?.interests) {
        const commonInterests = user1.preferences.interests.filter(
          (interest: string) => user2.preferences.interests.includes(interest)
        );
        const interestMatchPercentage = commonInterests.length / Math.max(
          user1.preferences.interests.length, user2.preferences.interests.length
        );
        score += interestMatchPercentage * 25;
      }

      // Lifestyle compatibility (20 points max)
      maxScore += 20;
      if (user1.preferences?.lifestyle && user2.preferences?.lifestyle) {
        const commonLifestyle = user1.preferences.lifestyle.filter(
          (lifestyle: string) => user2.preferences.lifestyle.includes(lifestyle)
        );
        const lifestyleMatchPercentage = commonLifestyle.length / Math.max(
          user1.preferences.lifestyle.length, user2.preferences.lifestyle.length
        );
        score += lifestyleMatchPercentage * 20;
      }

      // Verification status bonus (15 points max)
      maxScore += 15;
      if (user1.emailVerified && user2.emailVerified) score += 15;
      else if (user1.emailVerified || user2.emailVerified) score += 7;

      // Premium status bonus (15 points max)
      maxScore += 15;
      const user1IsPremium = ['premium', 'elite', 'vip'].includes(user1.subscription.tier);
      const user2IsPremium = ['premium', 'elite', 'vip'].includes(user2.subscription.tier);
      if (user1IsPremium && user2IsPremium) score += 15;
      else if (user1IsPremium || user2IsPremium) score += 7;

      return Math.round((score / maxScore) * 100);
    } catch (error) {
      console.error('Compatibility calculation error:', error);
      return 0;
    }
  }

  /**
   * Get search suggestions based on user behavior
   */
  async getSearchSuggestions(userId: string) {
    try {
      // Get user's recent search patterns
      const user = await User.findByPk(userId, {
        include: [Profile],
        attributes: ['preferences']
      });

      const suggestions = {
        popularLocations: [],
        trendingInterests: [],
        compatibleAges: [],
        incomeRanges: []
      };

      // Get popular search locations from other users
      const popularLocations = await Profile.findAll({
        attributes: ['location'],
        group: ['location'],
        order: [[literal('COUNT(*)'), 'DESC']],
        limit: 5
      });

      suggestions.popularLocations = popularLocations.map(p => p.location);

      // Get trending interests
      const allUsers = await User.findAll({
        attributes: ['preferences'],
        where: { id: { [Op.ne]: userId } }
      });

      const allInterests = allUsers
        .map(u => u.preferences?.interests || [])
        .flat()
        .filter((interest, index, arr) => arr.indexOf(interest) === index);

      suggestions.trendingInterests = allInterests.slice(0, 10);

      // Suggest compatible age ranges
      const avgAge = await User.findOne({
        attributes: [[literal('AVG(age)'), 'avgAge']],
        where: { id: { [Op.ne]: userId } }
      });

      if (avgAge && avgAge.dataValues.avgAge) {
        const avg = Math.round(avgAge.dataValues.avgAge);
        suggestions.compatibleAges = [
          [avg - 5, avg + 5],
          [avg - 10, avg + 10],
          [avg - 15, avg + 15]
        ];
      }

      // Suggest income ranges
      suggestions.incomeRanges = [
        { min: 50000, max: 100000 },
        { min: 100000, max: 200000 },
        { min: 200000, max: 500000 },
        { min: 500000, max: null }
      ];

      return suggestions;
    } catch (error) {
      console.error('Search suggestions error:', error);
      return {
        popularLocations: [],
        trendingInterests: [],
        compatibleAges: [],
        incomeRanges: []
      };
    }
  }

  /**
   * Calculate distance between two coordinates
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
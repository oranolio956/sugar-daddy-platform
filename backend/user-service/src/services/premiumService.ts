import { User } from '../models/User';
import { PremiumFeature } from '../models/PremiumFeature';
import { Profile } from '../models/Profile';
import { Op } from 'sequelize';

export class PremiumService {
  private readonly FEATURE_PRICING = {
    incognito: 9.99,
    profile_boost: 4.99,
    travel_mode: 7.99,
    priority_support: 19.99,
    advanced_analytics: 14.99
  };

  private readonly FEATURE_DURATIONS = {
    incognito: 30, // days
    profile_boost: 7, // days
    travel_mode: 14, // days
    priority_support: 30, // days
    advanced_analytics: 30 // days
  };

  /**
   * Get available premium features
   */
  async getAvailableFeatures(): Promise<any[]> {
    return [
      {
        type: 'incognito',
        name: 'Incognito Mode',
        description: 'Browse profiles anonymously without showing your activity',
        price: this.FEATURE_PRICING.incognito,
        duration: this.FEATURE_DURATIONS.incognito,
        benefits: [
          'Hide your profile from other users',
          'Anonymous browsing',
          'No activity indicators',
          'Private profile views'
        ]
      },
      {
        type: 'profile_boost',
        name: 'Profile Boost',
        description: 'Increase your profile visibility and get more matches',
        price: this.FEATURE_PRICING.profile_boost,
        duration: this.FEATURE_DURATIONS.profile_boost,
        benefits: [
          'Featured in search results',
          'Increased profile views',
          'Priority matching',
          'Highlighted profile'
        ]
      },
      {
        type: 'travel_mode',
        name: 'Travel Mode',
        description: 'Update your location and find matches in your travel destination',
        price: this.FEATURE_PRICING.travel_mode,
        duration: this.FEATURE_DURATIONS.travel_mode,
        benefits: [
          'Location-based matching',
          'Travel notifications',
          'Local recommendations',
          'Temporary location update'
        ]
      },
      {
        type: 'priority_support',
        name: 'Priority Support',
        description: 'Get fast-track support for any issues or questions',
        price: this.FEATURE_PRICING.priority_support,
        duration: this.FEATURE_DURATIONS.priority_support,
        benefits: [
          '24/7 priority support',
          'Dedicated support agent',
          'Faster response times',
          'Exclusive support channel'
        ]
      },
      {
        type: 'advanced_analytics',
        name: 'Advanced Analytics',
        description: 'Get detailed insights about your profile performance',
        price: this.FEATURE_PRICING.advanced_analytics,
        duration: this.FEATURE_DURATIONS.advanced_analytics,
        benefits: [
          'Detailed profile analytics',
          'Engagement metrics',
          'Performance insights',
          'Custom recommendations'
        ]
      }
    ];
  }

  /**
   * Get user's active premium features
   */
  async getUserFeatures(userId: string): Promise<PremiumFeature[]> {
    try {
      const features = await PremiumFeature.findAll({
        where: {
          userId,
          isActive: true,
          endDate: {
            [Op.gt]: new Date()
          }
        },
        order: [['createdAt', 'DESC']]
      });

      return features;
    } catch (error) {
      console.error('Get user features error:', error);
      throw error;
    }
  }

  /**
   * Activate premium feature
   */
  async activateFeature(
    userId: string, 
    featureType: string, 
    settings?: any, 
    duration?: number
  ): Promise<PremiumFeature> {
    try {
      // Validate user exists
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Validate feature type
      const availableFeatures = Object.keys(this.FEATURE_PRICING);
      if (!availableFeatures.includes(featureType)) {
        throw new Error('Invalid feature type');
      }

      // Check if user has sufficient balance
      const cost = this.FEATURE_PRICING[featureType as keyof typeof this.FEATURE_PRICING];
      
      // For now, we'll assume payment is handled elsewhere
      // In a real implementation, this would integrate with a payment processor

      // Check if user already has this feature active
      const existingFeature = await PremiumFeature.findOne({
        where: {
          userId,
          featureType,
          isActive: true,
          endDate: {
            [Op.gt]: new Date()
          }
        }
      });

      if (existingFeature) {
        throw new Error('Feature already active');
      }

      // Calculate duration and dates
      const featureDuration = duration || this.FEATURE_DURATIONS[featureType as keyof typeof this.FEATURE_DURATIONS];
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + (featureDuration * 24 * 60 * 60 * 1000));

      // Create feature
      const feature = await PremiumFeature.create({
        userId,
        featureType,
        isActive: true,
        startDate,
        endDate,
        settings,
        cost
      });

      // Apply feature effects
      await this.applyFeatureEffects(userId, feature);

      return feature;
    } catch (error) {
      console.error('Activate feature error:', error);
      throw error;
    }
  }

  /**
   * Deactivate premium feature
   */
  async deactivateFeature(userId: string, featureType: string): Promise<boolean> {
    try {
      const feature = await PremiumFeature.findOne({
        where: {
          userId,
          featureType,
          isActive: true
        }
      });

      if (!feature) {
        return false;
      }

      await feature.update({ isActive: false });

      // Remove feature effects
      await this.removeFeatureEffects(userId, feature);

      return true;
    } catch (error) {
      console.error('Deactivate feature error:', error);
      throw error;
    }
  }

  /**
   * Get incognito mode status
   */
  async getIncognitoStatus(userId: string): Promise<any> {
    try {
      const feature = await PremiumFeature.findOne({
        where: {
          userId,
          featureType: 'incognito',
          isActive: true,
          endDate: {
            [Op.gt]: new Date()
          }
        }
      });

      return {
        isActive: !!feature,
        expiresAt: feature?.endDate,
        settings: feature?.settings
      };
    } catch (error) {
      console.error('Get incognito status error:', error);
      throw error;
    }
  }

  /**
   * Boost profile visibility
   */
  async boostProfile(userId: string, duration?: number): Promise<PremiumFeature> {
    try {
      return await this.activateFeature(userId, 'profile_boost', {}, duration);
    } catch (error) {
      console.error('Boost profile error:', error);
      throw error;
    }
  }

  /**
   * Get travel mode status
   */
  async getTravelModeStatus(userId: string): Promise<any> {
    try {
      const feature = await PremiumFeature.findOne({
        where: {
          userId,
          featureType: 'travel_mode',
          isActive: true,
          endDate: {
            [Op.gt]: new Date()
          }
        }
      });

      return {
        isActive: !!feature,
        expiresAt: feature?.endDate,
        location: feature?.settings?.travelLocation,
        radius: feature?.settings?.travelRadius
      };
    } catch (error) {
      console.error('Get travel mode status error:', error);
      throw error;
    }
  }

  /**
   * Activate travel mode
   */
  async activateTravelMode(
    userId: string, 
    location: string, 
    radius: number, 
    duration?: number
  ): Promise<PremiumFeature> {
    try {
      const settings = {
        travelLocation: location,
        travelRadius: radius
      };

      return await this.activateFeature(userId, 'travel_mode', settings, duration);
    } catch (error) {
      console.error('Activate travel mode error:', error);
      throw error;
    }
  }

  /**
   * Deactivate travel mode
   */
  async deactivateTravelMode(userId: string): Promise<boolean> {
    try {
      return await this.deactivateFeature(userId, 'travel_mode');
    } catch (error) {
      console.error('Deactivate travel mode error:', error);
      throw error;
    }
  }

  /**
   * Get premium analytics
   */
  async getPremiumAnalytics(userId: string, period: string): Promise<any> {
    try {
      // This would integrate with the analytics service
      // For now, return mock data
      return {
        period,
        profileViews: 150,
        likesReceived: 25,
        messagesSent: 15,
        messagesReceived: 12,
        matchesCount: 8,
        responseRate: 80,
        engagementScore: 75,
        recommendations: [
          'Update your profile picture for better engagement',
          'Add more interests to attract compatible matches',
          'Be more active during peak hours (7-9 PM)'
        ]
      };
    } catch (error) {
      console.error('Get premium analytics error:', error);
      throw error;
    }
  }

  /**
   * Get revenue statistics
   */
  async getRevenueStats(): Promise<any> {
    try {
      const totalRevenue = await PremiumFeature.sum('cost', {
        where: {
          isActive: true,
          endDate: {
            [Op.gt]: new Date()
          }
        }
      });

      const featureCounts = await PremiumFeature.findAll({
        attributes: [
          'featureType',
          [require('sequelize').fn('COUNT', '*'), 'count'],
          [require('sequelize').fn('SUM', require('sequelize').col('cost')), 'revenue']
        ],
        group: ['featureType']
      });

      const activeUsers = await PremiumFeature.count({
        distinct: true,
        col: 'userId'
      });

      return {
        totalRevenue: totalRevenue || 0,
        activeUsers,
        byFeature: featureCounts,
        averageRevenuePerUser: activeUsers > 0 ? (totalRevenue || 0) / activeUsers : 0
      };
    } catch (error) {
      console.error('Get revenue stats error:', error);
      throw error;
    }
  }

  /**
   * Apply feature effects
   */
  private async applyFeatureEffects(userId: string, feature: PremiumFeature): Promise<void> {
    try {
      switch (feature.featureType) {
        case 'incognito':
          await this.applyIncognitoEffects(userId);
          break;
        case 'profile_boost':
          await this.applyProfileBoostEffects(userId);
          break;
        case 'travel_mode':
          await this.applyTravelModeEffects(userId, feature.settings);
          break;
        case 'priority_support':
          await this.applyPrioritySupportEffects(userId);
          break;
        case 'advanced_analytics':
          await this.applyAdvancedAnalyticsEffects(userId);
          break;
      }
    } catch (error) {
      console.error('Apply feature effects error:', error);
    }
  }

  /**
   * Remove feature effects
   */
  private async removeFeatureEffects(userId: string, feature: PremiumFeature): Promise<void> {
    try {
      switch (feature.featureType) {
        case 'incognito':
          await this.removeIncognitoEffects(userId);
          break;
        case 'profile_boost':
          await this.removeProfileBoostEffects(userId);
          break;
        case 'travel_mode':
          await this.removeTravelModeEffects(userId);
          break;
        case 'priority_support':
          await this.removePrioritySupportEffects(userId);
          break;
        case 'advanced_analytics':
          await this.removeAdvancedAnalyticsEffects(userId);
          break;
      }
    } catch (error) {
      console.error('Remove feature effects error:', error);
    }
  }

  /**
   * Apply incognito effects
   */
  private async applyIncognitoEffects(userId: string): Promise<void> {
    try {
      // Update user settings to hide profile
      const user = await User.findByPk(userId);
      if (user) {
        await user.update({
          'settings.profileVisibility': 'private',
          'settings.showOnlineStatus': false,
          'settings.showLastSeen': false
        });
      }
    } catch (error) {
      console.error('Apply incognito effects error:', error);
    }
  }

  /**
   * Remove incognito effects
   */
  private async removeIncognitoEffects(userId: string): Promise<void> {
    try {
      // Restore user settings
      const user = await User.findByPk(userId);
      if (user) {
        await user.update({
          'settings.profileVisibility': 'public',
          'settings.showOnlineStatus': true,
          'settings.showLastSeen': true
        });
      }
    } catch (error) {
      console.error('Remove incognito effects error:', error);
    }
  }

  /**
   * Apply profile boost effects
   */
  private async applyProfileBoostEffects(userId: string): Promise<void> {
    try {
      // Update profile to be featured
      const profile = await Profile.findOne({ where: { userId } });
      if (profile) {
        await profile.update({
          isFeatured: true,
          featuredUntil: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)) // 7 days
        });
      }
    } catch (error) {
      console.error('Apply profile boost effects error:', error);
    }
  }

  /**
   * Remove profile boost effects
   */
  private async removeProfileBoostEffects(userId: string): Promise<void> {
    try {
      // Remove featured status
      const profile = await Profile.findOne({ where: { userId } });
      if (profile) {
        await profile.update({
          isFeatured: false,
          featuredUntil: null
        });
      }
    } catch (error) {
      console.error('Remove profile boost effects error:', error);
    }
  }

  /**
   * Apply travel mode effects
   */
  private async applyTravelModeEffects(userId: string, settings: any): Promise<void> {
    try {
      // Update user location temporarily
      const user = await User.findByPk(userId);
      if (user && settings?.travelLocation) {
        await user.update({
          'preferences.location': settings.travelLocation,
          'preferences.distance': settings.travelRadius || 50
        });
      }
    } catch (error) {
      console.error('Apply travel mode effects error:', error);
    }
  }

  /**
   * Remove travel mode effects
   */
  private async removeTravelModeEffects(userId: string): Promise<void> {
    try {
      // Restore original location settings
      const user = await User.findByPk(userId);
      if (user) {
        await user.update({
          'preferences.location': '', // Restore original
          'preferences.distance': 50 // Restore default
        });
      }
    } catch (error) {
      console.error('Remove travel mode effects error:', error);
    }
  }

  /**
   * Apply priority support effects
   */
  private async applyPrioritySupportEffects(userId: string): Promise<void> {
    try {
      // Mark user for priority support (would integrate with support system)
      console.log(`User ${userId} now has priority support`);
    } catch (error) {
      console.error('Apply priority support effects error:', error);
    }
  }

  /**
   * Remove priority support effects
   */
  private async removePrioritySupportEffects(userId: string): Promise<void> {
    try {
      // Remove priority support status
      console.log(`User ${userId} no longer has priority support`);
    } catch (error) {
      console.error('Remove priority support effects error:', error);
    }
  }

  /**
   * Apply advanced analytics effects
   */
  private async applyAdvancedAnalyticsEffects(userId: string): Promise<void> {
    try {
      // Enable advanced analytics for user
      console.log(`User ${userId} now has access to advanced analytics`);
    } catch (error) {
      console.error('Apply advanced analytics effects error:', error);
    }
  }

  /**
   * Remove advanced analytics effects
   */
  private async removeAdvancedAnalyticsEffects(userId: string): Promise<void> {
    try {
      // Disable advanced analytics for user
      console.log(`User ${userId} no longer has access to advanced analytics`);
    } catch (error) {
      console.error('Remove advanced analytics effects error:', error);
    }
  }
}

// Export singleton instance
export const premiumService = new PremiumService();
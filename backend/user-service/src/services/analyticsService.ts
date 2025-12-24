import { User } from '../models/User';
import { Profile } from '../models/Profile';
import { Match } from '../models/Match';
import { Message } from '../models/Message';
import { Gift } from '../models/Gift';
import { Ticket } from '../models/Ticket';
import { Op } from 'sequelize';

export interface ProfileAnalytics {
  userId: string;
  profileViews: number;
  likesReceived: number;
  messagesSent: number;
  messagesReceived: number;
  matchesCount: number;
  responseRate: number;
  averageResponseTime: number;
  lastActivity: Date;
  engagementScore: number;
}

export interface PlatformAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  totalMatches: number;
  totalMessages: number;
  totalGifts: number;
  averageSessionTime: number;
  churnRate: number;
  retentionRate: number;
}

export interface RevenueAnalytics {
  totalRevenue: number;
  subscriptionRevenue: number;
  giftRevenue: number;
  premiumUsers: number;
  conversionRate: number;
  averageRevenuePerUser: number;
}

export class AnalyticsService {
  /**
   * Get user profile analytics
   */
  async getUserAnalytics(userId: string): Promise<ProfileAnalytics> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get basic stats from user model
      const basicStats = user.stats;

      // Get profile views from profile model
      const profile = await Profile.findOne({
        where: { userId }
      });

      // Get messages sent and received
      const messagesSent = await Message.count({
        where: { senderId: userId, isDeleted: false }
      });

      const messagesReceived = await Message.count({
        where: { receiverId: userId, isDeleted: false }
      });

      // Get matches count
      const matchesCount = await Match.count({
        where: {
          [Op.or]: [
            { userId },
            { matchedUserId: userId }
          ]
        }
      });

      // Calculate response rate
      const responseRate = messagesReceived > 0 
        ? (messagesSent / messagesReceived) * 100 
        : 0;

      // Calculate average response time
      const avgResponseTime = await this.calculateAverageResponseTime(userId);

      // Calculate engagement score
      const engagementScore = this.calculateEngagementScore({
        profileViews: profile?.viewCount || 0,
        likesReceived: basicStats.likesReceived,
        messagesSent,
        messagesReceived,
        matchesCount
      });

      return {
        userId,
        profileViews: profile?.viewCount || 0,
        likesReceived: basicStats.likesReceived,
        messagesSent,
        messagesReceived,
        matchesCount,
        responseRate,
        averageResponseTime,
        lastActivity: user.lastActivityAt,
        engagementScore
      };
    } catch (error) {
      console.error('Get user analytics error:', error);
      throw error;
    }
  }

  /**
   * Get platform-wide analytics
   */
  async getPlatformAnalytics(): Promise<PlatformAnalytics> {
    try {
      const totalUsers = await User.count();
      
      const activeUsers = await User.count({
        where: {
          lastActivityAt: {
            [Op.gt]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      });

      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const newUsersToday = await User.count({
        where: {
          createdAt: {
            [Op.gte]: startOfDay
          }
        }
      });

      const newUsersThisWeek = await User.count({
        where: {
          createdAt: {
            [Op.gte]: startOfWeek
          }
        }
      });

      const newUsersThisMonth = await User.count({
        where: {
          createdAt: {
            [Op.gte]: startOfMonth
          }
        }
      });

      const totalMatches = await Match.count();
      const totalMessages = await Message.count({
        where: { isDeleted: false }
      });
      const totalGifts = await Gift.count();

      // Calculate average session time (simplified calculation)
      const avgSessionTime = await this.calculateAverageSessionTime();

      // Calculate churn and retention rates
      const { churnRate, retentionRate } = await this.calculateRetentionRates();

      return {
        totalUsers,
        activeUsers,
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth,
        totalMatches,
        totalMessages,
        totalGifts,
        averageSessionTime,
        churnRate,
        retentionRate
      };
    } catch (error) {
      console.error('Get platform analytics error:', error);
      throw error;
    }
  }

  /**
   * Get revenue analytics
   */
  async getRevenueAnalytics(): Promise<RevenueAnalytics> {
    try {
      const premiumUsers = await User.count({
        where: {
          'subscription.tier': {
            [Op.in]: ['premium', 'elite', 'vip']
          }
        }
      });

      // Calculate total revenue from subscriptions (simplified)
      const subscriptionRevenue = await this.calculateSubscriptionRevenue();

      // Calculate revenue from gifts (simplified)
      const giftRevenue = await this.calculateGiftRevenue();

      const totalRevenue = subscriptionRevenue + giftRevenue;
      const conversionRate = await this.calculateConversionRate();
      const averageRevenuePerUser = totalUsers > 0 ? totalRevenue / totalUsers : 0;

      return {
        totalRevenue,
        subscriptionRevenue,
        giftRevenue,
        premiumUsers,
        conversionRate,
        averageRevenuePerUser
      };
    } catch (error) {
      console.error('Get revenue analytics error:', error);
      throw error;
    }
  }

  /**
   * Get user engagement metrics
   */
  async getUserEngagementMetrics(userId: string): Promise<any> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get daily activity
      const dailyActivity = await this.getDailyActivity(userId);
      
      // Get time spent on platform
      const timeSpent = await this.calculateTimeSpent(userId);

      // Get interaction patterns
      const interactionPatterns = await this.getInteractionPatterns(userId);

      return {
        userId,
        dailyActivity,
        timeSpent,
        interactionPatterns,
        lastLogin: user.lastLoginAt,
        totalLogins: await this.getTotalLogins(userId)
      };
    } catch (error) {
      console.error('Get user engagement metrics error:', error);
      throw error;
    }
  }

  /**
   * Get popular content and trends
   */
  async getPopularContent(): Promise<any> {
    try {
      // Get most viewed profiles
      const popularProfiles = await Profile.findAll({
        order: [['viewCount', 'DESC']],
        limit: 10,
        include: [{
          model: User,
          attributes: ['username', 'role']
        }]
      });

      // Get most active users
      const activeUsers = await User.findAll({
        order: [['lastActivityAt', 'DESC']],
        limit: 10,
        attributes: ['id', 'username', 'role', 'lastActivityAt']
      });

      // Get most popular search terms (would need search logging)
      const popularSearches = await this.getPopularSearches();

      return {
        popularProfiles,
        activeUsers,
        popularSearches
      };
    } catch (error) {
      console.error('Get popular content error:', error);
      throw error;
    }
  }

  /**
   * Get support analytics
   */
  async getSupportAnalytics(): Promise<any> {
    try {
      const totalTickets = await Ticket.count();
      const openTickets = await Ticket.count({
        where: { status: 'open' }
      });
      const resolvedTickets = await Ticket.count({
        where: { status: 'resolved' }
      });

      // Average resolution time
      const avgResolutionTime = await this.getAverageResolutionTime();

      // Tickets by category
      const ticketsByCategory = await Ticket.findAll({
        attributes: [
          'category',
          [require('sequelize').fn('COUNT', '*'), 'count']
        ],
        group: ['category']
      });

      return {
        totalTickets,
        openTickets,
        resolvedTickets,
        avgResolutionTime,
        ticketsByCategory
      };
    } catch (error) {
      console.error('Get support analytics error:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive report
   */
  async generateReport(timeframe: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<any> {
    try {
      const platformAnalytics = await this.getPlatformAnalytics();
      const revenueAnalytics = await this.getRevenueAnalytics();
      const supportAnalytics = await this.getSupportAnalytics();
      const popularContent = await this.getPopularContent();

      return {
        timeframe,
        generatedAt: new Date().toISOString(),
        platform: platformAnalytics,
        revenue: revenueAnalytics,
        support: supportAnalytics,
        popularContent,
        recommendations: await this.generateRecommendations(platformAnalytics, revenueAnalytics)
      };
    } catch (error) {
      console.error('Generate report error:', error);
      throw error;
    }
  }

  /**
   * Calculate engagement score
   */
  private calculateEngagementScore(stats: any): number {
    const { profileViews, likesReceived, messagesSent, messagesReceived, matchesCount } = stats;
    
    // Simple scoring algorithm
    const score = (
      profileViews * 0.1 +
      likesReceived * 0.5 +
      messagesSent * 0.3 +
      messagesReceived * 0.3 +
      matchesCount * 2.0
    );

    return Math.min(score, 100); // Cap at 100
  }

  /**
   * Calculate average response time
   */
  private async calculateAverageResponseTime(userId: string): Promise<number> {
    try {
      // This would require tracking message timestamps and calculating response times
      // Simplified implementation
      return 0;
    } catch (error) {
      console.error('Calculate average response time error:', error);
      return 0;
    }
  }

  /**
   * Calculate average session time
   */
  private async calculateAverageSessionTime(): Promise<number> {
    try {
      // This would require session tracking
      // Simplified implementation
      return 15 * 60 * 1000; // 15 minutes
    } catch (error) {
      console.error('Calculate average session time error:', error);
      return 0;
    }
  }

  /**
   * Calculate retention rates
   */
  private async calculateRetentionRates(): Promise<{ churnRate: number; retentionRate: number }> {
    try {
      // This would require cohort analysis
      // Simplified implementation
      return {
        churnRate: 5.0, // 5%
        retentionRate: 95.0 // 95%
      };
    } catch (error) {
      console.error('Calculate retention rates error:', error);
      return { churnRate: 0, retentionRate: 0 };
    }
  }

  /**
   * Calculate subscription revenue
   */
  private async calculateSubscriptionRevenue(): Promise<number> {
    try {
      // This would integrate with payment system
      // Simplified implementation
      return 50000; // $50,000
    } catch (error) {
      console.error('Calculate subscription revenue error:', error);
      return 0;
    }
  }

  /**
   * Calculate gift revenue
   */
  private async calculateGiftRevenue(): Promise<number> {
    try {
      // This would integrate with gift system
      // Simplified implementation
      return 15000; // $15,000
    } catch (error) {
      console.error('Calculate gift revenue error:', error);
      return 0;
    }
  }

  /**
   * Calculate conversion rate
   */
  private async calculateConversionRate(): Promise<number> {
    try {
      const totalUsers = await User.count();
      const premiumUsers = await User.count({
        where: {
          'subscription.tier': {
            [Op.in]: ['premium', 'elite', 'vip']
          }
        }
      });

      return totalUsers > 0 ? (premiumUsers / totalUsers) * 100 : 0;
    } catch (error) {
      console.error('Calculate conversion rate error:', error);
      return 0;
    }
  }

  /**
   * Get daily activity
   */
  private async getDailyActivity(userId: string): Promise<any[]> {
    try {
      // This would require activity logging
      // Simplified implementation
      return [];
    } catch (error) {
      console.error('Get daily activity error:', error);
      return [];
    }
  }

  /**
   * Calculate time spent
   */
  private async calculateTimeSpent(userId: string): Promise<number> {
    try {
      // This would require session tracking
      // Simplified implementation
      return 0;
    } catch (error) {
      console.error('Calculate time spent error:', error);
      return 0;
    }
  }

  /**
   * Get interaction patterns
   */
  private async getInteractionPatterns(userId: string): Promise<any> {
    try {
      // This would analyze user behavior patterns
      // Simplified implementation
      return {};
    } catch (error) {
      console.error('Get interaction patterns error:', error);
      return {};
    }
  }

  /**
   * Get total logins
   */
  private async getTotalLogins(userId: string): Promise<number> {
    try {
      // This would require login tracking
      // Simplified implementation
      return 0;
    } catch (error) {
      console.error('Get total logins error:', error);
      return 0;
    }
  }

  /**
   * Get popular searches
   */
  private async getPopularSearches(): Promise<any[]> {
    try {
      // This would require search logging
      // Simplified implementation
      return [];
    } catch (error) {
      console.error('Get popular searches error:', error);
      return [];
    }
  }

  /**
   * Get average resolution time
   */
  private async getAverageResolutionTime(): Promise<number> {
    try {
      const resolvedTickets = await Ticket.findAll({
        where: {
          resolvedAt: { [Op.ne]: null }
        },
        attributes: ['createdAt', 'resolvedAt']
      });

      if (resolvedTickets.length === 0) {
        return 0;
      }

      const totalTime = resolvedTickets.reduce((sum, ticket) => {
        if (ticket.resolvedAt) {
          return sum + (ticket.resolvedAt.getTime() - ticket.createdAt.getTime());
        }
        return sum;
      }, 0);

      return totalTime / resolvedTickets.length;
    } catch (error) {
      console.error('Get average resolution time error:', error);
      return 0;
    }
  }

  /**
   * Generate recommendations
   */
  private async generateRecommendations(platformAnalytics: PlatformAnalytics, revenueAnalytics: RevenueAnalytics): Promise<string[]> {
    try {
      const recommendations: string[] = [];

      if (platformAnalytics.churnRate > 10) {
        recommendations.push('High churn rate detected. Consider implementing retention strategies.');
      }

      if (revenueAnalytics.conversionRate < 5) {
        recommendations.push('Low conversion rate. Review pricing and value proposition.');
      }

      if (platformAnalytics.responseRate < 50) {
        recommendations.push('Low user engagement. Consider improving matching algorithm.');
      }

      return recommendations;
    } catch (error) {
      console.error('Generate recommendations error:', error);
      return [];
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
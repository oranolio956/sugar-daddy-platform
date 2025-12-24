import { User } from '../models/User';
import { VerificationDocument } from '../models/VerificationDocument';
import { DeviceSession } from '../models/DeviceSession';
import { SecurityUtils } from '../utils/security';

export class AdminService {
  /**
   * Get user by ID with full details
   */
  async getUserDetails(userId: string): Promise<User> {
    const user = await User.findByPk(userId, {
      include: [
        { model: require('./VerificationDocument') },
        { model: require('./DeviceSession') }
      ]
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Get all users with pagination
   */
  async getAllUsers(page: number = 1, limit: number = 20, filters: any = {}): Promise<{
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;
    const where: any = {};

    // Apply filters
    if (filters.role) {
      where.role = filters.role;
    }
    if (filters.verified !== undefined) {
      where['profile.verified'] = filters.verified;
    }
    if (filters.subscriptionTier) {
      where['subscription.tier'] = filters.subscriptionTier;
    }
    if (filters.emailVerified !== undefined) {
      where.emailVerified = filters.emailVerified;
    }

    const { rows: users, count: total } = await User.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['passwordHash'] }
    });

    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Suspend user account
   */
  async suspendUser(userId: string, reason: string, adminId: string): Promise<User> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.subscription.status = 'suspended';
    user.settings.profileVisibility = 'private';
    user.settings.allowMessages = 'none';
    
    // Log suspension
    await this.logAdminAction(adminId, 'suspend_user', {
      targetUserId: userId,
      reason,
      previousStatus: user.subscription.status
    });

    await user.save();
    return user;
  }

  /**
   * Ban user account
   */
  async banUser(userId: string, reason: string, adminId: string): Promise<User> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.subscription.status = 'banned';
    user.settings.profileVisibility = 'private';
    user.settings.allowMessages = 'none';
    user.settings.emailNotifications = false;
    user.settings.pushNotifications = false;
    
    // Log ban
    await this.logAdminAction(adminId, 'ban_user', {
      targetUserId: userId,
      reason,
      previousStatus: user.subscription.status
    });

    await user.save();
    return user;
  }

  /**
   * Unban user account
   */
  async unbanUser(userId: string, adminId: string): Promise<User> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.subscription.status = 'active';
    user.settings.profileVisibility = 'public';
    user.settings.allowMessages = 'everyone';
    user.settings.emailNotifications = true;
    user.settings.pushNotifications = true;
    
    // Log unban
    await this.logAdminAction(adminId, 'unban_user', {
      targetUserId: userId,
      previousStatus: 'banned'
    });

    await user.save();
    return user;
  }

  /**
   * Update user role
   */
  async updateUserRole(userId: string, newRole: 'sugar_daddy' | 'sugar_baby' | 'admin', adminId: string): Promise<User> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const previousRole = user.role;
    user.role = newRole;
    
    // Log role change
    await this.logAdminAction(adminId, 'update_role', {
      targetUserId: userId,
      previousRole,
      newRole
    });

    await user.save();
    return user;
  }

  /**
   * Delete user account (soft delete)
   */
  async deleteUserAccount(userId: string, reason: string, adminId: string): Promise<void> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Soft delete by setting status
    user.subscription.status = 'deleted';
    user.settings.profileVisibility = 'private';
    
    // Log deletion
    await this.logAdminAction(adminId, 'delete_user', {
      targetUserId: userId,
      reason,
      previousStatus: user.subscription.status
    });

    await user.save();
  }

  /**
   * Review verification document
   */
  async reviewVerificationDocument(documentId: string, action: 'approve' | 'reject', reason?: string, adminId: string): Promise<VerificationDocument> {
    const document = await VerificationDocument.findByPk(documentId, {
      include: [User]
    });

    if (!document) {
      throw new Error('Document not found');
    }

    if (action === 'approve') {
      document.status = 'approved';
      document.verifiedAt = new Date();
      document.expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
      
      // Update user verification status
      if (document.user) {
        document.user.profile.verified = true;
        document.user.profile.verificationLevel = await this.calculateVerificationLevel(document.userId);
        await document.user.save();
      }
    } else {
      document.status = 'rejected';
      document.rejectionReason = reason || 'Document did not meet verification requirements';
    }

    // Log review action
    await this.logAdminAction(adminId, 'review_verification', {
      documentId,
      action,
      reason,
      userId: document.userId
    });

    await document.save();
    return document;
  }

  /**
   * Get admin action logs
   */
  async getAdminLogs(page: number = 1, limit: number = 50, filters: any = {}): Promise<{
    logs: any[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    // This would require a separate AdminLog model in a real implementation
    // For now, returning mock data structure
    return {
      logs: [],
      total: 0,
      page: 1,
      totalPages: 1
    };
  }

  /**
   * Get security reports
   */
  async getSecurityReports(): Promise<{
    totalUsers: number;
    verifiedUsers: number;
    suspendedUsers: number;
    bannedUsers: number;
    pendingVerifications: number;
    recentLogins: any[];
    suspiciousActivity: any[];
  }> {
    const totalUsers = await User.count();
    const verifiedUsers = await User.count({
      where: { '$profile.verified$': true }
    });
    const suspendedUsers = await User.count({
      where: { '$subscription.status$': 'suspended' }
    });
    const bannedUsers = await User.count({
      where: { '$subscription.status$': 'banned' }
    });
    const pendingVerifications = await VerificationDocument.count({
      where: { status: 'pending' }
    });

    // Get recent logins (last 24 hours)
    const recentLogins = await User.findAll({
      where: {
        lastLoginAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      },
      attributes: ['id', 'username', 'email', 'lastLoginAt'],
      limit: 10,
      order: [['lastLoginAt', 'DESC']]
    });

    // Get suspicious activity (failed login attempts, etc.)
    const suspiciousUsers = await User.findAll({
      where: {
        '$security.loginAttempts$': { $gte: 3 }
      },
      attributes: ['id', 'username', 'email', 'security'],
      limit: 10
    });

    return {
      totalUsers,
      verifiedUsers,
      suspendedUsers,
      bannedUsers,
      pendingVerifications,
      recentLogins,
      suspiciousActivity: suspiciousUsers
    };
  }

  /**
   * Export user data for compliance
   */
  async exportUserData(userId: string): Promise<any> {
    const user = await User.findByPk(userId, {
      include: [
        { model: require('./VerificationDocument') },
        { model: require('./DeviceSession') }
      ]
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Return user data without sensitive information
    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        profile: user.profile,
        preferences: user.preferences,
        settings: user.settings,
        stats: user.stats,
        subscription: user.subscription
      },
      verificationDocuments: user.verificationDocuments,
      deviceSessions: user.deviceSessions
    };
  }

  /**
   * Calculate verification level
   */
  private async calculateVerificationLevel(userId: string): Promise<string> {
    const documents = await VerificationDocument.findAll({
      where: { 
        userId,
        status: 'approved',
        expiresAt: { $gt: new Date() }
      }
    });

    const approvedTypes = documents.map(doc => doc.type);
    
    if (approvedTypes.includes('photo_id') && approvedTypes.includes('selfie')) {
      return 'verified';
    } else if (approvedTypes.includes('photo_id')) {
      return 'photo_verified';
    } else if (approvedTypes.includes('utility_bill') || approvedTypes.includes('bank_statement')) {
      return 'address_verified';
    }

    return 'none';
  }

  /**
   * Log admin action
   */
  private async logAdminAction(adminId: string, action: string, details: any): Promise<void> {
    // This would require a separate AdminLog model in a real implementation
    // For now, just logging to console
    console.log(`Admin Action: ${action} by ${adminId}`, details);
  }
}
import { User } from '../models/User';
import { DeviceSession } from '../models/DeviceSession';
import { SecurityUtils } from '../utils/security';
import { EmailService } from './emailService';
import { TwoFactorService } from './twoFactorService';
import jwt from 'jsonwebtoken';

export class AuthService {
  private emailService: EmailService;
  private twoFactorService: TwoFactorService;

  constructor() {
    this.emailService = new EmailService();
    this.twoFactorService = new TwoFactorService();
  }

  /**
   * Register a new user
   */
  async register(userData: {
    email: string;
    password: string;
    username: string;
    role: 'sugar_daddy' | 'sugar_baby';
    profile?: any;
    preferences?: any;
    deviceInfo?: any;
  }): Promise<{
    user: User;
    message: string;
  }> {
    // Validate email format
    if (!SecurityUtils.validateEmail(userData.email)) {
      throw new Error('Invalid email format');
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        $or: [
          { email: userData.email },
          { username: userData.username }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === userData.email) {
        throw new Error('Email already registered');
      } else {
        throw new Error('Username already taken');
      }
    }

    // Validate password strength
    const passwordValidation = SecurityUtils.validatePasswordStrength(userData.password);
    if (!passwordValidation.isValid) {
      throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }

    // Check if password has been breached
    const isBreach = await SecurityUtils.checkPasswordBreach(userData.password);
    if (isBreach) {
      throw new Error('This password has been found in a data breach. Please choose a different password.');
    }

    // Hash password
    const passwordHash = await SecurityUtils.hashPassword(userData.password);

    // Create user
    const user = await User.create({
      email: userData.email,
      username: userData.username,
      passwordHash,
      role: userData.role,
      emailVerified: false,
      twoFactorEnabled: false,
      subscription: {
        tier: 'free',
        status: 'active',
        features: ['basic_profile', 'basic_matching', 'limited_messages'],
        expiresAt: null,
      },
      profile: {
        firstName: userData.profile?.firstName || '',
        lastName: userData.profile?.lastName || '',
        age: userData.profile?.age || 18,
        location: userData.profile?.location || '',
        verified: false,
        verificationLevel: 'none'
      },
      preferences: userData.preferences || {
        lookingFor: userData.role === 'sugar_daddy' ? 'sugar_baby' : 'sugar_daddy',
        ageRange: [18, 50],
        location: userData.profile?.location || '',
        distance: 50
      },
      settings: {
        emailNotifications: true,
        pushNotifications: true,
        profileVisibility: 'public',
        showOnlineStatus: true,
        showLastSeen: true,
        allowMessages: 'everyone',
        marketingEmails: false,
        language: 'en',
        timezone: 'UTC'
      },
      stats: {
        profileViews: 0,
        likesReceived: 0,
        messagesSent: 0,
        matchesCount: 0,
        responseRate: 0
      },
      security: {
        lastPasswordChange: new Date().toISOString(),
        loginAttempts: 0,
        trustedDevices: userData.deviceInfo ? [userData.deviceInfo] : []
      }
    });

    // Create device session
    if (userData.deviceInfo) {
      await DeviceSession.create({
        userId: user.id,
        deviceId: userData.deviceInfo.deviceId,
        deviceName: userData.deviceInfo.deviceName || 'Unknown Device',
        userAgent: userData.deviceInfo.userAgent,
        ipAddress: userData.deviceInfo.ipAddress,
        trusted: false,
        active: true,
        lastUsedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });
    }

    // Send verification email
    await this.emailService.sendEmailVerification(user);

    return {
      user,
      message: 'Account created successfully. Please check your email to verify your account.'
    };
  }

  /**
   * Login user with optional 2FA
   */
  async login(credentials: {
    email: string;
    password: string;
    deviceId?: string;
    deviceInfo?: any;
  }): Promise<{
    user: User;
    token: string;
    refreshToken: string;
    requires2FA: boolean;
    message: string;
  }> {
    const { email, password, deviceId, deviceInfo } = credentials;

    // Find user
    const user = await User.findOne({
      where: { email },
      include: [TwoFactorAuth]
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if account is locked
    if (user.security.lockedUntil && new Date() < user.security.lockedUntil) {
      throw new Error('Account temporarily locked due to too many failed login attempts');
    }

    // Verify password
    const isPasswordValid = await SecurityUtils.verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      // Increment login attempts
      user.security.loginAttempts += 1;
      
      // Lock account after 5 failed attempts
      if (user.security.loginAttempts >= 5) {
        user.security.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      }
      
      await user.save();
      throw new Error('Invalid credentials');
    }

    // Reset login attempts on successful password verification
    user.security.loginAttempts = 0;
    user.security.lockedUntil = undefined;
    user.lastLoginAt = new Date();
    user.lastActivityAt = new Date();

    // Check if email is verified
    if (!user.emailVerified) {
      await user.save();
      throw new Error('Please verify your email address before logging in');
    }

    // Check if 2FA is required
    const twoFactorAuth = user.twoFactorAuth?.[0];
    const requires2FA = twoFactorAuth && twoFactorAuth.enabled;

    if (requires2FA) {
      // Check if device is trusted
      if (deviceId && twoFactorAuth.trustedDevices) {
        const trustedDevice = twoFactorAuth.trustedDevices.find(
          (device: any) => device.deviceId === deviceId && new Date() < device.expiresAt
        );

        if (trustedDevice) {
          // Update device last used time
          trustedDevice.lastUsed = new Date();
          await twoFactorAuth.update({ trustedDevices: twoFactorAuth.trustedDevices });
          
          await user.save();
          return this.generateTokens(user, 'Login successful');
        }
      }

      await user.save();
      return {
        user,
        token: '',
        refreshToken: '',
        requires2FA: true,
        message: 'Two-factor authentication required'
      };
    }

    // Create device session
    if (deviceInfo) {
      await this.createDeviceSession(user.id, deviceInfo);
    }

    await user.save();
    return this.generateTokens(user, 'Login successful');
  }

  /**
   * Complete 2FA login
   */
  async complete2FALogin(userId: string, token: string, deviceId?: string): Promise<{
    user: User;
    token: string;
    refreshToken: string;
    message: string;
  }> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Try backup code first
    let isTokenValid = false;
    try {
      isTokenValid = await this.twoFactorService.verifyBackupCode(userId, token);
    } catch (error) {
      // Try regular 2FA token
      isTokenValid = await this.twoFactorService.verifyTwoFactor(userId, token, deviceId);
    }

    if (!isTokenValid) {
      throw new Error('Invalid 2FA token');
    }

    // Add device to trusted devices if requested
    if (deviceId) {
      await this.twoFactorService.addTrustedDevice(userId, deviceId, 'Current Device', 168); // 7 days
    }

    return this.generateTokens(user, '2FA verification successful');
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    const verification = await EmailVerification.findOne({
      where: { token, used: false, expiresAt: { $gt: new Date() } },
      include: [User]
    });

    if (!verification) {
      throw new Error('Invalid or expired verification token');
    }

    const user = verification.user;
    user.emailVerified = true;
    await user.save();

    verification.used = true;
    verification.verifiedAt = new Date();
    await verification.save();

    return { message: 'Email verified successfully' };
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if user exists or not
      return { message: 'If this email is registered, you will receive password reset instructions' };
    }

    await this.emailService.sendPasswordResetEmail(user);
    return { message: 'If this email is registered, you will receive password reset instructions' };
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const passwordReset = await User.findOne({
      include: [{
        model: require('./PasswordReset'),
        where: { token, used: false, expiresAt: { $gt: new Date() } }
      }]
    });

    if (!passwordReset) {
      throw new Error('Invalid or expired reset token');
    }

    // Validate password strength
    const passwordValidation = SecurityUtils.validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }

    // Check if password has been breached
    const isBreach = await SecurityUtils.checkPasswordBreach(newPassword);
    if (isBreach) {
      throw new Error('This password has been found in a data breach. Please choose a different password.');
    }

    // Hash new password
    const passwordHash = await SecurityUtils.hashPassword(newPassword);

    // Update user password
    passwordReset.passwordHash = passwordHash;
    passwordReset.security.lastPasswordChange = new Date().toISOString();
    await passwordReset.save();

    // Mark reset token as used
    const resetRecord = passwordReset.passwordResets[0];
    resetRecord.used = true;
    resetRecord.usedAt = new Date();
    await resetRecord.save();

    return { message: 'Password reset successfully' };
  }

  /**
   * Change password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await SecurityUtils.verifyPassword(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Check password history (prevent reuse of last 5 passwords)
    // Note: In a real implementation, you'd store password history
    // For now, we'll just check if new password is different

    if (await SecurityUtils.verifyPassword(newPassword, user.passwordHash)) {
      throw new Error('New password must be different from current password');
    }

    // Validate password strength
    const passwordValidation = SecurityUtils.validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }

    // Check if password has been breached
    const isBreach = await SecurityUtils.checkPasswordBreach(newPassword);
    if (isBreach) {
      throw new Error('This password has been found in a data breach. Please choose a different password.');
    }

    // Update password
    user.passwordHash = await SecurityUtils.hashPassword(newPassword);
    user.security.lastPasswordChange = new Date().toISOString();
    await user.save();

    return { message: 'Password changed successfully' };
  }

  /**
   * Logout user and invalidate sessions
   */
  async logout(userId: string, sessionId?: string): Promise<{ message: string }> {
    if (sessionId) {
      // Logout specific session
      await DeviceSession.update(
        { active: false },
        { where: { id: sessionId, userId } }
      );
    } else {
      // Logout all sessions
      await DeviceSession.update(
        { active: false },
        { where: { userId, active: true } }
      );
    }

    return { message: 'Logged out successfully' };
  }

  /**
   * Get active sessions
   */
  async getActiveSessions(userId: string): Promise<DeviceSession[]> {
    return await DeviceSession.findAll({
      where: { userId, active: true },
      order: [['lastUsedAt', 'DESC']]
    });
  }

  /**
   * Refresh JWT token
   */
  async refreshTokens(refreshToken: string): Promise<{
    token: string;
    refreshToken: string;
  }> {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as any;
      const user = await User.findByPk(decoded.userId);
      
      if (!user) {
        throw new Error('Invalid refresh token');
      }

      return this.generateTokens(user, 'Token refreshed');
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Generate JWT tokens
   */
  private generateTokens(user: User, message: string): {
    user: User;
    token: string;
    refreshToken: string;
    message: string;
  } {
    const payload = {
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '24h' });
    const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '30d' });

    return {
      user,
      token,
      refreshToken,
      message
    };
  }

  /**
   * Create device session
   */
  private async createDeviceSession(userId: string, deviceInfo: any): Promise<void> {
    // Check for existing session
    const existingSession = await DeviceSession.findOne({
      where: {
        userId,
        deviceId: deviceInfo.deviceId,
        active: true
      }
    });

    if (existingSession) {
      // Update existing session
      existingSession.lastUsedAt = new Date();
      existingSession.userAgent = deviceInfo.userAgent;
      existingSession.ipAddress = deviceInfo.ipAddress;
      await existingSession.save();
    } else {
      // Create new session
      await DeviceSession.create({
        userId,
        deviceId: deviceInfo.deviceId,
        deviceName: deviceInfo.deviceName || 'Unknown Device',
        userAgent: deviceInfo.userAgent,
        ipAddress: deviceInfo.ipAddress,
        trusted: false,
        active: true,
        lastUsedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });
    }
  }
}
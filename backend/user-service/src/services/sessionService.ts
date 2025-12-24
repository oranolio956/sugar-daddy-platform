import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { DeviceSession } from '../models/DeviceSession';
import { User } from '../models/User';
import { SecurityUtils } from '../utils/security';
import { securityConfig } from '../config/security';

export interface SessionData {
  userId: string;
  sessionId: string;
  deviceId: string;
  deviceInfo: {
    userAgent: string;
    ipAddress: string;
    fingerprint: string;
  };
  expiresAt: Date;
  lastActivity: Date;
  isActive: boolean;
  isTrusted: boolean;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export class SessionService {
  private readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
  private readonly REFRESH_TOKEN_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days
  private readonly JWT_SECRET = process.env.JWT_SECRET!;
  private readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || this.JWT_SECRET + '_refresh';

  /**
   * Create a new session for a user
   */
  async createSession(
    userId: string, 
    deviceId: string, 
    deviceInfo: any,
    rememberMe: boolean = false
  ): Promise<SessionData> {
    const sessionId = crypto.randomUUID();
    const now = new Date();
    
    // Calculate expiration
    const sessionExpiry = new Date(now.getTime() + this.SESSION_TIMEOUT);
    const refreshExpiry = new Date(now.getTime() + this.REFRESH_TOKEN_EXPIRY);
    
    // Create session record
    const session = await DeviceSession.create({
      userId,
      sessionId,
      deviceId,
      deviceInfo,
      expiresAt: sessionExpiry,
      lastActivity: now,
      isActive: true,
      isTrusted: false,
      ipAddress: deviceInfo.ipAddress,
      userAgent: deviceInfo.userAgent
    });

    // Update user's last login
    await User.update(
      { 
        lastLoginAt: now,
        lastActivityAt: now 
      },
      { where: { id: userId } }
    );

    return {
      userId,
      sessionId,
      deviceId,
      deviceInfo,
      expiresAt: sessionExpiry,
      lastActivity: now,
      isActive: true,
      isTrusted: false
    };
  }

  /**
   * Generate JWT tokens for a session
   */
  generateTokens(sessionData: SessionData): TokenPair {
    const payload = {
      userId: sessionData.userId,
      sessionId: sessionData.sessionId,
      deviceId: sessionData.deviceId,
      iat: Math.floor(Date.now() / 1000)
    };

    const accessToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: '1h',
      issuer: 'sugar-daddy-platform',
      audience: 'sugar-daddy-platform-api'
    });

    const refreshToken = jwt.sign(payload, this.JWT_REFRESH_SECRET, {
      expiresIn: '30d',
      issuer: 'sugar-daddy-platform',
      audience: 'sugar-daddy-platform-api'
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1 hour
      tokenType: 'Bearer'
    };
  }

  /**
   * Validate and refresh session
   */
  async refreshSession(refreshToken: string): Promise<TokenPair | null> {
    try {
      const payload = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET) as any;
      
      // Verify session still exists and is active
      const session = await DeviceSession.findOne({
        where: {
          userId: payload.userId,
          sessionId: payload.sessionId,
          deviceId: payload.deviceId,
          isActive: true,
          expiresAt: { $gt: new Date() }
        }
      });

      if (!session) {
        throw new Error('Session not found or expired');
      }

      // Update last activity
      await session.update({ lastActivity: new Date() });

      // Generate new tokens
      const newSessionData: SessionData = {
        userId: session.userId,
        sessionId: session.sessionId,
        deviceId: session.deviceId,
        deviceInfo: session.deviceInfo,
        expiresAt: session.expiresAt,
        lastActivity: new Date(),
        isActive: true,
        isTrusted: session.isTrusted
      };

      return this.generateTokens(newSessionData);
    } catch (error) {
      console.error('Session refresh failed:', error);
      return null;
    }
  }

  /**
   * Validate session from JWT token
   */
  async validateSession(accessToken: string): Promise<SessionData | null> {
    try {
      const payload = jwt.verify(accessToken, this.JWT_SECRET) as any;
      
      const session = await DeviceSession.findOne({
        where: {
          userId: payload.userId,
          sessionId: payload.sessionId,
          deviceId: payload.deviceId,
          isActive: true,
          expiresAt: { $gt: new Date() }
        }
      });

      if (!session) {
        return null;
      }

      // Update last activity
      await session.update({ lastActivity: new Date() });

      return {
        userId: session.userId,
        sessionId: session.sessionId,
        deviceId: session.deviceId,
        deviceInfo: session.deviceInfo,
        expiresAt: session.expiresAt,
        lastActivity: session.lastActivity,
        isActive: session.isActive,
        isTrusted: session.isTrusted
      };
    } catch (error) {
      console.error('Session validation failed:', error);
      return null;
    }
  }

  /**
   * Logout from a specific session
   */
  async logoutSession(userId: string, sessionId: string): Promise<void> {
    await DeviceSession.update(
      { isActive: false },
      { where: { userId, sessionId } }
    );
  }

  /**
   * Logout from all sessions
   */
  async logoutAllSessions(userId: string): Promise<void> {
    await DeviceSession.update(
      { isActive: false },
      { where: { userId } }
    );
  }

  /**
   * Get active sessions for a user
   */
  async getActiveSessions(userId: string): Promise<SessionData[]> {
    const sessions = await DeviceSession.findAll({
      where: {
        userId,
        isActive: true,
        expiresAt: { $gt: new Date() }
      },
      order: [['lastActivity', 'DESC']]
    });

    return sessions.map(session => ({
      userId: session.userId,
      sessionId: session.sessionId,
      deviceId: session.deviceId,
      deviceInfo: session.deviceInfo,
      expiresAt: session.expiresAt,
      lastActivity: session.lastActivity,
      isActive: session.isActive,
      isTrusted: session.isTrusted
    }));
  }

  /**
   * Trust a device session
   */
  async trustDeviceSession(userId: string, sessionId: string, name: string): Promise<void> {
    await DeviceSession.update(
      { 
        isTrusted: true,
        deviceName: name,
        trustedAt: new Date()
      },
      { where: { userId, sessionId } }
    );
  }

  /**
   * Revoke a trusted device
   */
  async revokeTrustedDevice(userId: string, deviceId: string): Promise<void> {
    await DeviceSession.update(
      { 
        isTrusted: false,
        trustedAt: null
      },
      { where: { userId, deviceId, isTrusted: true } }
    );
  }

  /**
   * Cleanup expired sessions
   */
  async cleanupExpiredSessions(): Promise<void> {
    const now = new Date();
    await DeviceSession.destroy({
      where: {
        expiresAt: { $lt: now },
        isActive: true
      }
    });
  }

  /**
   * Check for suspicious session activity
   */
  async checkSuspiciousActivity(userId: string, deviceInfo: any): Promise<boolean> {
    const sessions = await DeviceSession.findAll({
      where: {
        userId,
        isActive: true,
        expiresAt: { $gt: new Date() }
      }
    });

    // Check for same IP but different user agent (possible session hijacking)
    for (const session of sessions) {
      if (session.ipAddress === deviceInfo.ipAddress && 
          session.userAgent !== deviceInfo.userAgent) {
        return true;
      }
    }

    return false;
  }

  /**
   * Create secure session cookie
   */
  setSessionCookie(res: Response, tokenPair: TokenPair): void {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    };

    res.cookie('accessToken', tokenPair.accessToken, cookieOptions);
    res.cookie('refreshToken', tokenPair.refreshToken, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000
    });
  }

  /**
   * Clear session cookies
   */
  clearSessionCookies(res: Response): void {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
  }

  /**
   * Get session from request cookies
   */
  getSessionFromCookies(req: Request): { accessToken: string | null; refreshToken: string | null } {
    return {
      accessToken: req.cookies?.accessToken || null,
      refreshToken: req.cookies?.refreshToken || null
    };
  }
}

export default new SessionService();
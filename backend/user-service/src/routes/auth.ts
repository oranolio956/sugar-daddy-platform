import { Router } from 'express';
import { AuthService } from '../services/authService';
import { TwoFactorService } from '../services/twoFactorService';
import { EmailService } from '../services/emailService';
import { SessionService } from '../services/sessionService';
import { APISecurityService } from '../services/apiSecurityService';
import { SecurityUtils } from '../utils/security';
import {
  globalRateLimit,
  authRateLimit,
  loginRateLimit,
  registrationRateLimit,
  passwordResetRateLimit,
  emailVerificationRateLimit,
  sensitiveOperationRateLimit,
  accountLockoutMiddleware,
  suspiciousActivityMiddleware,
  deviceTrackingMiddleware,
  csrfProtection,
  sanitizeInput,
  requestSizeLimit,
  validateUserAgent,
  securityLogging
} from '../middleware';
import {
  preventSQLInjection,
  preventXSS,
  preventCommandInjection,
  preventPathTraversal,
  preventLDAPInjection
} from '../validation/middleware';
import { csrfProtection as csrfMiddleware } from '../middleware/csrf';

const router = Router();
const authService = new AuthService();
const twoFactorService = new TwoFactorService();
const emailService = new EmailService();
const sessionService = new SessionService();
const apiSecurityService = new APISecurityService();

// Apply security middleware to all routes
router.use(securityLogging);
router.use(validateUserAgent);
router.use(requestSizeLimit);
router.use(sanitizeInput);
router.use(csrfProtection);
router.use(deviceTrackingMiddleware);

// Apply enhanced security validation middleware
router.use(preventSQLInjection);
router.use(preventXSS);
router.use(preventCommandInjection);
router.use(preventPathTraversal);
router.use(preventLDAPInjection);

/**
 * @route   POST /api/auth/register
 * @desc    Register user
 * @access  Public
 */
router.post('/register', 
  globalRateLimit,
  registrationRateLimit,
  async (req, res) => {
    try {
      const result = await authService.register({
        email: req.body.email,
        password: req.body.password,
        username: req.body.username,
        role: req.body.role,
        profile: req.body.profile,
        preferences: req.body.preferences,
        deviceInfo: req.deviceInfo
      });

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Registration failed'
      });
    }
  }
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login',
  globalRateLimit,
  loginRateLimit,
  accountLockoutMiddleware,
  async (req, res) => {
    try {
      const result = await authService.login({
        email: req.body.email,
        password: req.body.password,
        deviceId: req.body.deviceId,
        deviceInfo: req.deviceInfo
      });

      if (result.requires2FA) {
        res.status(200).json({
          success: true,
          requires2FA: true,
          message: result.message,
          userId: result.user.id
        });
      } else {
        res.status(200).json({
          success: true,
          data: result
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(401).json({
        success: false,
        message: error.message || 'Login failed'
      });
    }
  }
);

/**
 * @route   POST /api/auth/2fa/verify
 * @desc    Complete 2FA login
 * @access  Public
 */
router.post('/2fa/verify',
  globalRateLimit,
  twoFactorRateLimit,
  async (req, res) => {
    try {
      const { userId, token, deviceId, trustDevice } = req.body;

      const result = await authService.complete2FALogin(userId, token, deviceId);

      // Add device to trusted devices if requested
      if (trustDevice && deviceId) {
        await twoFactorService.addTrustedDevice(userId, deviceId, 'Trusted Device', 168); // 7 days
      }

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('2FA verification error:', error);
      res.status(401).json({
        success: false,
        message: error.message || '2FA verification failed'
      });
    }
  }
);

/**
 * @route   POST /api/auth/2fa/setup
 * @desc    Setup 2FA
 * @access  Private
 */
router.post('/2fa/setup',
  globalRateLimit,
  sensitiveOperationRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const result = await twoFactorService.setupTwoFactor(userId);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('2FA setup error:', error);
      res.status(400).json({
        success: false,
        message: error.message || '2FA setup failed'
      });
    }
  }
);

/**
 * @route   POST /api/auth/2fa/enable
 * @desc    Enable 2FA
 * @access  Private
 */
router.post('/2fa/enable',
  globalRateLimit,
  sensitiveOperationRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { token } = req.body;

      await twoFactorService.enableTwoFactor(userId, token);

      res.status(200).json({
        success: true,
        message: '2FA enabled successfully'
      });
    } catch (error: any) {
      console.error('2FA enable error:', error);
      res.status(400).json({
        success: false,
        message: error.message || '2FA enable failed'
      });
    }
  }
);

/**
 * @route   POST /api/auth/2fa/disable
 * @desc    Disable 2FA
 * @access  Private
 */
router.post('/2fa/disable',
  globalRateLimit,
  sensitiveOperationRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { password } = req.body;

      await twoFactorService.disableTwoFactor(userId, password);

      res.status(200).json({
        success: true,
        message: '2FA disabled successfully'
      });
    } catch (error: any) {
      console.error('2FA disable error:', error);
      res.status(400).json({
        success: false,
        message: error.message || '2FA disable failed'
      });
    }
  }
);

/**
 * @route   POST /api/auth/2fa/backup-codes/regenerate
 * @desc    Regenerate backup codes
 * @access  Private
 */
router.post('/2fa/backup-codes/regenerate',
  globalRateLimit,
  sensitiveOperationRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { password } = req.body;

      const backupCodes = await twoFactorService.regenerateBackupCodes(userId, password);

      res.status(200).json({
        success: true,
        data: { backupCodes },
        message: 'Backup codes regenerated successfully'
      });
    } catch (error: any) {
      console.error('Backup codes regeneration error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Backup codes regeneration failed'
      });
    }
  }
);

/**
 * @route   GET /api/auth/2fa/status
 * @desc    Get 2FA status
 * @access  Private
 */
router.get('/2fa/status',
  globalRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const status = await twoFactorService.getTwoFactorStatus(userId);

      res.status(200).json({
        success: true,
        data: status
      });
    } catch (error: any) {
      console.error('2FA status error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get 2FA status'
      });
    }
  }
);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email address
 * @access  Public
 */
router.post('/verify-email',
  globalRateLimit,
  emailVerificationRateLimit,
  async (req, res) => {
    try {
      const { token } = req.body;
      const result = await authService.verifyEmail(token);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error: any) {
      console.error('Email verification error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Email verification failed'
      });
    }
  }
);

/**
 * @route   GET /api/auth/verify-email
 * @desc    Verify email address (GET version for email links)
 * @access  Public
 */
router.get('/verify-email',
  globalRateLimit,
  emailVerificationRateLimit,
  async (req, res) => {
    try {
      const { token } = req.query;
      const result = await authService.verifyEmail(token as string);

      // Redirect to frontend with success status
      res.redirect(`${process.env.FRONTEND_URL}/email-verification?status=success&message=${encodeURIComponent(result.message)}`);
    } catch (error: any) {
      console.error('Email verification error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/email-verification?status=error&message=${encodeURIComponent(error.message || 'Email verification failed')}`);
    }
  }
);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend email verification
 * @access  Public
 */
router.post('/resend-verification',
  globalRateLimit,
  emailVerificationRateLimit,
  async (req, res) => {
    try {
      const { email } = req.body;
      const user = await require('../models/User').User.findOne({ where: { email } });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (user.emailVerified) {
        return res.status(400).json({
          success: false,
          message: 'Email already verified'
        });
      }

      await emailService.sendEmailVerification(user);

      res.status(200).json({
        success: true,
        message: 'Verification email sent'
      });
    } catch (error: any) {
      console.error('Resend verification error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to resend verification email'
      });
    }
  }
);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend email verification
 * @access  Public
 */
router.post('/resend-verification',
  globalRateLimit,
  emailVerificationRateLimit,
  async (req, res) => {
    try {
      const { email } = req.body;
      const user = await require('../models/User').User.findOne({ where: { email } });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (user.emailVerified) {
        return res.status(400).json({
          success: false,
          message: 'Email already verified'
        });
      }

      await emailService.sendEmailVerification(user);

      res.status(200).json({
        success: true,
        message: 'Verification email sent'
      });
    } catch (error: any) {
      console.error('Resend verification error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to resend verification email'
      });
    }
  }
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password',
  globalRateLimit,
  passwordResetRateLimit,
  async (req, res) => {
    try {
      const { email } = req.body;
      const result = await authService.requestPasswordReset(email);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error: any) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to process password reset request'
      });
    }
  }
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password
 * @access  Public
 */
router.post('/reset-password',
  globalRateLimit,
  passwordResetRateLimit,
  async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      const result = await authService.resetPassword(token, newPassword);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error: any) {
      console.error('Reset password error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Password reset failed'
      });
    }
  }
);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change password
 * @access  Private
 */
router.post('/change-password',
  globalRateLimit,
  sensitiveOperationRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      const result = await authService.changePassword(userId, currentPassword, newPassword);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error: any) {
      console.error('Change password error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Password change failed'
      });
    }
  }
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout',
  globalRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { sessionId } = req.body;

      const result = await authService.logout(userId, sessionId);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Logout failed'
      });
    }
  }
);

/**
 * @route   GET /api/auth/sessions
 * @desc    Get active sessions
 * @access  Private
 */
router.get('/sessions',
  globalRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const sessions = await authService.getActiveSessions(userId);

      res.status(200).json({
        success: true,
        data: sessions
      });
    } catch (error: any) {
      console.error('Get sessions error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get active sessions'
      });
    }
  }
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh JWT token
 * @access  Public
 */
router.post('/refresh',
  globalRateLimit,
  async (req, res) => {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshTokens(refreshToken);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('Token refresh error:', error);
      res.status(401).json({
        success: false,
        message: error.message || 'Token refresh failed'
      });
    }
  }
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me',
  globalRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await require('../models/User').User.findByPk(userId, {
        attributes: { exclude: ['passwordHash'] }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error: any) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get user information'
      });
    }
  }
);

/**
 * @route   GET /api/auth/csrf-token
 * @desc    Get CSRF token for forms
 * @access  Private
 */
router.get('/csrf-token',
  globalRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const token = SecurityUtils.generateCSRFToken();
      
      // Set secure cookie
      res.cookie('csrf_token', token, {
        httpOnly: false, // Need access from JavaScript
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 60 * 1000 // 30 minutes
      });
      
      res.json({
        success: true,
        csrfToken: token
      });
    } catch (error: any) {
      console.error('CSRF token generation error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate CSRF token'
      });
    }
  }
);

/**
 * @route   POST /api/auth/api-key
 * @desc    Generate API key for user
 * @access  Private
 */
router.post('/api-key',
  globalRateLimit,
  sensitiveOperationRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { name, permissions } = req.body;
      
      const apiKey = await apiSecurityService.generateAPIKey(
        userId,
        name || 'Default API Key',
        permissions || ['read']
      );
      
      // Return only the key, not the secret (should be handled securely)
      res.status(201).json({
        success: true,
        apiKey: {
          id: apiKey.id,
          name: apiKey.name,
          key: apiKey.key,
          permissions: apiKey.permissions,
          createdAt: apiKey.createdAt
        },
        message: 'API key generated successfully. Store the secret securely as it will not be shown again.'
      });
    } catch (error: any) {
      console.error('API key generation error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to generate API key'
      });
    }
  }
);

/**
 * @route   GET /api/auth/api-keys
 * @desc    Get user's API keys
 * @access  Private
 */
router.get('/api-keys',
  globalRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      // This would need to be implemented in the User model
      // For now, return a placeholder
      res.json({
        success: true,
        apiKeys: []
      });
    } catch (error: any) {
      console.error('Get API keys error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get API keys'
      });
    }
  }
);

/**
 * @route   DELETE /api/auth/api-key/:id
 * @desc    Revoke API key
 * @access  Private
 */
router.delete('/api-key/:id',
  globalRateLimit,
  sensitiveOperationRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      const success = await apiSecurityService.revokeAPIKey(userId, id);
      
      if (success) {
        res.json({
          success: true,
          message: 'API key revoked successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'API key not found'
        });
      }
    } catch (error: any) {
      console.error('Revoke API key error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to revoke API key'
      });
    }
  }
);

/**
 * @route   POST /api/auth/secure-session
 * @desc    Create a secure session with enhanced validation
 * @access  Private
 */
router.post('/secure-session',
  globalRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const deviceInfo = req.deviceInfo;
      
      // Check for suspicious activity
      const isSuspicious = await sessionService.checkSuspiciousActivity(userId, deviceInfo);
      
      if (isSuspicious) {
        return res.status(400).json({
          success: false,
          message: 'Suspicious activity detected. Please verify your identity.',
          requiresVerification: true
        });
      }
      
      // Create secure session
      const session = await sessionService.createSession(userId, deviceInfo.deviceId, deviceInfo);
      const tokens = sessionService.generateTokens(session);
      
      // Set secure cookies
      sessionService.setSessionCookie(res, tokens);
      
      res.json({
        success: true,
        message: 'Secure session created',
        session: {
          sessionId: session.sessionId,
          expiresAt: session.expiresAt,
          isTrusted: session.isTrusted
        }
      });
    } catch (error: any) {
      console.error('Secure session creation error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create secure session'
      });
    }
  }
);

export default router;
/**
 * Security Configuration for Sugar Daddy Platform
 * 
 * This file contains all security-related configurations including:
 * - Password policies
 * - Rate limiting settings
 * - 2FA configurations
 * - Session management
 * - Security headers
 * - Email settings
 */

export const securityConfig = {
  // Password Security
  password: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxAgeDays: 90,
    historyCount: 5, // Remember last 5 passwords
    breachCheckEnabled: true
  },

  // Two-Factor Authentication
  twoFactor: {
    enabled: true,
    backupCodesCount: 10,
    trustedDeviceExpiryHours: 168, // 7 days
    totpWindow: 2, // Allow 2 time steps tolerance
    maxFailedAttempts: 10,
    lockoutDurationMinutes: 30
  },

  // Rate Limiting
  rateLimiting: {
    global: {
      points: 100, // Number of requests
      duration: 60, // Per duration in seconds
      blockDuration: 15 // Block duration in minutes
    },
    auth: {
      points: 5,
      duration: 60,
      blockDuration: 300 // 5 minutes
    },
    login: {
      points: 3,
      duration: 60,
      blockDuration: 900 // 15 minutes
    },
    registration: {
      points: 3,
      duration: 3600, // 1 hour
      blockDuration: 3600 // 1 hour
    },
    passwordReset: {
      points: 3,
      duration: 3600, // 1 hour
      blockDuration: 3600 // 1 hour
    },
    emailVerification: {
      points: 5,
      duration: 3600, // 1 hour
      blockDuration: 3600 // 1 hour
    },
    twoFactor: {
      points: 10,
      duration: 60,
      blockDuration: 300 // 5 minutes
    },
    sensitiveOperations: {
      points: 5,
      duration: 3600, // 1 hour
      blockDuration: 1800 // 30 minutes
    }
  },

  // Account Security
  account: {
    maxLoginAttempts: 5,
    lockoutDurationMinutes: 15,
    sessionTimeoutHours: 24,
    refreshTokenExpiryDays: 30,
    passwordResetTokenExpiryMinutes: 60,
    emailVerificationTokenExpiryHours: 24
  },

  // Email Configuration
  email: {
    verificationExpiryHours: 24,
    passwordResetExpiryMinutes: 60,
    maxVerificationAttempts: 5,
    maxPasswordResetAttempts: 3,
    retryDelayMinutes: 60
  },

  // Device Tracking
  device: {
    fingerprintSalt: process.env.DEVICE_FINGERPRINT_SALT || 'sugar-daddy-platform',
    maxTrustedDevices: 5,
    deviceInfoCapture: true,
    locationTracking: true
  },

  // Security Headers
  headers: {
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "*.googleapis.com", "*.gstatic.com", "*.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "*.googleapis.com", "*.gstatic.com", "*.cloudflare.com"],
      imgSrc: ["'self'", "data:", "*.googleapis.com", "*.gstatic.com", "*.cloudflare.com", "*.amazonaws.com"],
      fontSrc: ["'self'", "*.googleapis.com", "*.gstatic.com", "*.cloudflare.com"],
      connectSrc: ["'self'", "*.googleapis.com", "*.gstatic.com", "*.cloudflare.com", "*.amazonaws.com"],
      frameSrc: ["'self'", "*.google.com"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"]
    },
    strictTransportSecurity: "max-age=31536000; includeSubDomains; preload",
    xFrameOptions: "DENY",
    xContentTypeOptions: "nosniff",
    xXssProtection: "1; mode=block",
    referrerPolicy: "strict-origin-when-cross-origin"
  },

  // Verification Documents
  verification: {
    allowedFileTypes: ["image/jpeg", "image/png", "image/jpg", "application/pdf"],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    documentExpiryDays: 365, // 1 year
    maxPendingDocuments: 4,
    autoExpireDays: 30
  },

  // Admin Settings
  admin: {
    requireMfa: true,
    sessionTimeoutHours: 8,
    maxConcurrentSessions: 3,
    auditLogging: true,
    suspiciousActivityThreshold: 5
  },

  // API Security
  api: {
    version: "1.0",
    corsOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://yourdomain.com',
      'https://www.yourdomain.com'
    ],
    requestSizeLimit: 10 * 1024 * 1024, // 10MB
    userAgentValidation: true,
    ipWhitelist: process.env.IP_WHITELIST?.split(',') || [],
    ipBlacklist: process.env.IP_BLACKLIST?.split(',') || []
  },

  // Monitoring & Logging
  monitoring: {
    logSecurityEvents: true,
    logFailedLogins: true,
    logSuspiciousActivity: true,
    logAdminActions: true,
    alertThresholds: {
      failedLogins: 10,
      passwordResets: 5,
      verificationFailures: 5
    }
  }
};

/**
 * Security utility functions
 */
export const securityUtils = {
  /**
   * Generate a secure random string
   */
  generateSecureString: (length: number = 32): string => {
    const crypto = require('crypto');
    return crypto.randomBytes(length).toString('hex');
  },

  /**
   * Hash a string with salt
   */
  hashString: (input: string, salt: string): string => {
    const crypto = require('crypto');
    return crypto.createHmac('sha256', salt).update(input).digest('hex');
  },

  /**
   * Validate email format
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Check if password meets security requirements
   */
  validatePassword: (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < securityConfig.password.minLength) {
      errors.push(`Password must be at least ${securityConfig.password.minLength} characters long`);
    }
    
    if (securityConfig.password.requireUppercase && !/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (securityConfig.password.requireLowercase && !/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (securityConfig.password.requireNumbers && !/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (securityConfig.password.requireSpecialChars && !/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Generate device fingerprint
   */
  generateDeviceFingerprint: (userAgent: string, ipAddress: string): string => {
    const crypto = require('crypto');
    const data = `${userAgent}:${ipAddress}:${securityConfig.device.fingerprintSalt}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  },

  /**
   * Check if IP is suspicious
   */
  isSuspiciousIP: (ipAddress: string): boolean => {
    const suspiciousRanges = [
      '10.', // Private networks
      '192.168.', // Private networks
      '172.16.', '172.17.', '172.18.', '172.19.',
      '172.20.', '172.21.', '172.22.', '172.23.',
      '172.24.', '172.25.', '172.26.', '172.27.',
      '172.28.', '172.29.', '172.30.', '172.31.'
    ];

    return suspiciousRanges.some(range => ipAddress.startsWith(range));
  }
};

export default securityConfig;
/**
 * Comprehensive Security Configuration
 * 
 * This file consolidates all security configurations for the Sugar Daddy Platform.
 * It includes settings for authentication, authorization, rate limiting, CSRF protection,
 * session management, API security, and input validation.
 */

import { securityConfig as baseSecurityConfig } from './security';

export const securityConfig = {
  ...baseSecurityConfig,

  // Enhanced CSRF Protection
  csrf: {
    enabled: true,
    tokenExpiryMinutes: 30,
    doubleSubmitCookie: true,
    originValidation: true,
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://yourdomain.com',
      'https://www.yourdomain.com'
    ],
    cookieOptions: {
      httpOnly: false, // Need access from JavaScript for forms
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 30 * 60 * 1000 // 30 minutes
    }
  },

  // Enhanced Session Management
  session: {
    timeoutHours: 24,
    refreshTokenExpiryDays: 30,
    maxConcurrentSessions: 5,
    trustedDeviceExpiryHours: 168, // 7 days
    sessionCleanupIntervalMinutes: 60,
    suspiciousActivityDetection: true,
    deviceFingerprinting: true,
    secureCookies: true
  },

  // API Security
  api: {
    version: '1.0',
    keyRotationDays: 90,
    signatureRequired: true,
    timestampToleranceSeconds: 300, // 5 minutes
    nonceTTLSeconds: 300, // 5 minutes
    rateLimiting: {
      enabled: true,
      defaultRequests: 1000,
      defaultWindowSeconds: 3600, // 1 hour
      burstLimit: 100,
      burstWindowSeconds: 60
    },
    permissions: {
      read: ['GET'],
      write: ['POST', 'PUT', 'PATCH'],
      admin: ['DELETE', 'ADMIN']
    }
  },

  // Enhanced Input Validation
  validation: {
    xssProtection: true,
    sqlInjectionProtection: true,
    commandInjectionProtection: true,
    pathTraversalProtection: true,
    ldapInjectionProtection: true,
    maxRequestSize: 10 * 1024 * 1024, // 10MB
    maxQueryLength: 2000,
    maxBodyLength: 10000,
    allowedFileTypes: [
      'image/jpeg', 'image/jpg', 'image/png', 'application/pdf',
      'image/gif', 'image/bmp', 'image/webp'
    ],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    sanitizeInput: true,
    escapeOutput: true
  },

  // Enhanced Rate Limiting
  rateLimiting: {
    ...baseSecurityConfig.rateLimiting,
    burstProtection: {
      enabled: true,
      burstSize: 10,
      burstWindowSeconds: 10
    },
    distributed: {
      enabled: true,
      backend: 'redis', // redis, memory, or custom
      keyPrefix: 'rate_limit:'
    },
    adaptive: {
      enabled: true,
      factor: 0.8, // Reduce limit by 20% on high load
      threshold: 80 // Percentage of capacity
    }
  },

  // Security Headers
  headers: {
    ...baseSecurityConfig.headers,
    additionalHeaders: {
      'X-Permitted-Cross-Domain-Policies': 'none',
      'X-Download-Options': 'noopen',
      'X-DNS-Prefetch-Control': 'off',
      'Clear-Site-Data': '"cache", "cookies", "storage", "executionContexts"',
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    },
    hsts: {
      maxAge: 63072000, // 2 years
      includeSubDomains: true,
      preload: true
    }
  },

  // Monitoring and Logging
  monitoring: {
    ...baseSecurityConfig.monitoring,
    securityEvents: {
      enabled: true,
      logLevel: 'warn', // debug, info, warn, error
      includeStackTrace: false,
      maxLogSize: 100 * 1024 * 1024, // 100MB
      retentionDays: 90
    },
    alerting: {
      enabled: true,
      channels: ['email', 'webhook'], // email, webhook, slack, etc.
      severityThreshold: 'warn',
      rateLimit: {
        maxAlertsPerHour: 10,
        cooldownMinutes: 30
      }
    },
    metrics: {
      enabled: true,
      includeSensitiveData: false,
      collectionInterval: 60000, // 1 minute
      exportFormats: ['json', 'prometheus']
    }
  },

  // Encryption and Hashing
  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16,
    saltRounds: 12,
    hashAlgorithm: 'sha256',
    hmacAlgorithm: 'sha256'
  },

  // Network Security
  network: {
    allowedIPs: process.env.ALLOWED_IPS?.split(',') || [],
    blockedIPs: process.env.BLOCKED_IPS?.split(',') || [],
    vpnDetection: {
      enabled: false, // Set to true in production with proper service
      service: 'maxmind' // maxmind, ipinfo, etc.
    },
    geoBlocking: {
      enabled: false,
      allowedCountries: [],
      blockedCountries: []
    }
  },

  // Authentication Security
  auth: {
    ...baseSecurityConfig.account,
    passwordPolicy: {
      minLength: 8,
      maxLength: 128,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      preventCommonPasswords: true,
      preventUserInfoInPassword: true,
      breachCheckEnabled: true,
      historyCount: 5
    },
    mfa: {
      enabled: true,
      requiredForAdmin: true,
      backupCodesCount: 10,
      totpWindow: 2,
      maxFailedAttempts: 10,
      lockoutDurationMinutes: 30
    },
    sessionSecurity: {
      regenerateOnPrivilegeChange: true,
      invalidateOnLogout: true,
      secureCookie: true,
      httpOnlyCookie: true,
      sameSiteCookie: 'strict'
    }
  },

  // Development and Testing
  development: {
    bypassSecurity: process.env.NODE_ENV === 'development' && process.env.BYPASS_SECURITY === 'true',
    mockSecurityHeaders: process.env.NODE_ENV === 'development',
    logSecurityEvents: process.env.NODE_ENV === 'development',
    strictMode: process.env.NODE_ENV !== 'production'
  }
};

/**
 * Security utility functions for configuration validation
 */
export const securityUtils = {
  /**
   * Validate security configuration
   */
  validateConfig: (config: any): boolean => {
    const required = ['csrf', 'session', 'api', 'validation', 'rateLimiting'];
    
    for (const key of required) {
      if (!config[key]) {
        console.error(`Security configuration missing required key: ${key}`);
        return false;
      }
    }
    
    return true;
  },

  /**
   * Get security configuration for specific environment
   */
  getConfigForEnvironment: (env: string = process.env.NODE_ENV || 'development') => {
    const config = { ...securityConfig };
    
    if (env === 'production') {
      // Production-specific overrides
      config.development.bypassSecurity = false;
      config.development.mockSecurityHeaders = false;
      config.development.logSecurityEvents = false;
      config.development.strictMode = true;
      
      // Enhanced production security
      config.csrf.cookieOptions.secure = true;
      config.session.secureCookies = true;
      config.headers.hsts.maxAge = 31536000; // 1 year minimum
    }
    
    return config;
  },

  /**
   * Check if security feature is enabled
   */
  isFeatureEnabled: (feature: string): boolean => {
    const config = securityConfig.getConfigForEnvironment();
    
    switch (feature) {
      case 'csrf':
        return config.csrf.enabled;
      case 'rateLimiting':
        return Object.values(config.rateLimiting).some(limit => limit.points > 0);
      case 'sessionSecurity':
        return config.session.secureCookies;
      case 'inputValidation':
        return config.validation.sanitizeInput;
      case 'apiSecurity':
        return config.api.signatureRequired;
      default:
        return false;
    }
  }
};

export default securityConfig;
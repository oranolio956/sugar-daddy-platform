import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';
import { SecurityUtils } from '../utils/security';

// Initialize Redis client
const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
});

// Rate limiter configurations
const createRateLimiter = (points: number, duration: number, blockDuration: number) => {
  return new RateLimiterRedis({
    storeClient: redisClient,
    keyGen: (req: Request) => {
      // Use IP + User Agent for more accurate rate limiting
      const ip = req.ip || req.connection.remoteAddress || '';
      const userAgent = req.get('User-Agent') || '';
      const fingerprint = SecurityUtils.generateDeviceFingerprint(userAgent, ip);
      return `rate_${fingerprint}`;
    },
    points, // Number of attempts
    duration, // Per duration in seconds
    blockDuration, // Block duration in seconds
  });
};

// Global rate limiter (all endpoints)
export const globalRateLimiter = createRateLimiter(100, 60, 15);

// Strict rate limiter for auth endpoints
export const authRateLimiter = createRateLimiter(5, 60, 300); // 5 attempts per minute, block for 5 minutes

// Very strict rate limiter for login attempts
export const loginRateLimiter = createRateLimiter(3, 60, 900); // 3 attempts per minute, block for 15 minutes

// Rate limiter for password reset
export const passwordResetRateLimiter = createRateLimiter(3, 3600, 3600); // 3 attempts per hour, block for 1 hour

// Rate limiter for registration
export const registrationRateLimiter = createRateLimiter(3, 3600, 3600); // 3 attempts per hour, block for 1 hour

// Rate limiter for 2FA attempts
export const twoFactorRateLimiter = createRateLimiter(10, 60, 300); // 10 attempts per minute, block for 5 minutes

// Rate limiter for email verification
export const emailVerificationRateLimiter = createRateLimiter(5, 3600, 3600); // 5 attempts per hour, block for 1 hour

// Rate limiter for sensitive operations (password change, 2FA setup)
export const sensitiveOperationRateLimiter = createRateLimiter(5, 3600, 1800); // 5 attempts per hour, block for 30 minutes

/**
 * Rate limiting middleware factory
 */
export const createRateLimitMiddleware = (rateLimiter: RateLimiterRedis) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await rateLimiter.consume(req.ip);
      next();
    } catch (rejRes: any) {
      const remainingPoints = rejRes?.remainingPoints || 0;
      const msBeforeNext = rejRes?.msBeforeNext || 0;

      res.set({
        'Retry-After': Math.round(msBeforeNext / 1000) || 1,
        'X-RateLimit-Limit': rateLimiter.points,
        'X-RateLimit-Remaining': remainingPoints,
        'X-RateLimit-Reset': new Date(Date.now() + msBeforeNext).toISOString(),
      });

      res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.round(msBeforeNext / 1000),
      });
    }
  };
};

/**
 * Account lockout middleware
 */
export const accountLockoutMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const email = req.body.email;
  
  if (!email) {
    return next();
  }

  try {
    // This would need to be implemented with your User model
    // For now, this is a placeholder for the logic
    const user = await req.app.locals.db.User.findOne({ where: { email } });
    
    if (user && user.security.lockedUntil && new Date() < user.security.lockedUntil) {
      return res.status(423).json({
        error: 'Account Locked',
        message: 'Your account has been temporarily locked due to too many failed attempts.',
        lockedUntil: user.security.lockedUntil,
      });
    }

    next();
  } catch (error) {
    console.error('Account lockout check error:', error);
    next();
  }
};

/**
 * Suspicious activity detection middleware
 */
export const suspiciousActivityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.get('User-Agent') || '';
  const ipAddress = req.ip || req.connection.remoteAddress || '';

  // Check for suspicious user agents
  const suspiciousUserAgents = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i
  ];

  for (const pattern of suspiciousUserAgents) {
    if (pattern.test(userAgent)) {
      console.warn(`Suspicious user agent detected: ${userAgent} from ${ipAddress}`);
      // Log but don't block - could be false positive
    }
  }

  // Check for suspicious IP ranges
  SecurityUtils.isSuspiciousIP(ipAddress).then(isSuspicious => {
    if (isSuspicious) {
      console.warn(`Suspicious IP detected: ${ipAddress} for user agent: ${userAgent}`);
      // Log but don't block - could be VPN/proxy user
    }
  });

  next();
};

/**
 * Device tracking middleware
 */
export const deviceTrackingMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.get('User-Agent') || '';
  const ipAddress = req.ip || req.connection.remoteAddress || '';
  const deviceId = SecurityUtils.generateDeviceFingerprint(userAgent, ipAddress);

  // Store device info in request for use in controllers
  req.deviceInfo = {
    deviceId,
    userAgent,
    ipAddress,
    fingerprint: deviceId
  };

  next();
};

// Export individual middleware instances
export const globalRateLimit = createRateLimitMiddleware(globalRateLimiter);
export const authRateLimit = createRateLimitMiddleware(authRateLimiter);
export const loginRateLimit = createRateLimitMiddleware(loginRateLimiter);
export const passwordResetRateLimit = createRateLimitMiddleware(passwordResetRateLimiter);
export const registrationRateLimit = createRateLimitMiddleware(registrationRateLimiter);
export const twoFactorRateLimit = createRateLimitMiddleware(twoFactorRateLimiter);
export const emailVerificationRateLimit = createRateLimitMiddleware(emailVerificationRateLimiter);
export const sensitiveOperationRateLimit = createRateLimitMiddleware(sensitiveOperationRateLimiter);
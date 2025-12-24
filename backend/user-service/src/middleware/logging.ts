import { Request, Response, NextFunction } from 'express';
import { addRequestContext, structuredLogger } from '../config/logger';

/**
 * Request logging middleware
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Add request context
  addRequestContext(req, res, () => {});
  
  // Log request
  structuredLogger.system.apiRequest(
    req.method,
    req.url,
    res.statusCode,
    0, // Will be updated after response
    req.requestId
  );
  
  // Override res.end to log response time
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const duration = Date.now() - start;
    
    // Log response
    structuredLogger.system.apiRequest(
      req.method,
      req.url,
      res.statusCode,
      duration,
      req.requestId
    );
    
    // Log slow responses
    if (duration > 1000) {
      structuredLogger.performance.slowApi(
        req.method,
        req.url,
        duration,
        req.requestId
      );
    }
    
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

/**
 * Error logging middleware
 */
export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Log error
  structuredLogger.system.serviceError(
    'user-service',
    err,
    req.requestId
  );
  
  // Log security events for specific errors
  if (err.message.includes('authentication') || err.message.includes('unauthorized')) {
    structuredLogger.security.failedLogin(
      req.body.email || 'unknown',
      req.ip,
      req.get('User-Agent') || 'unknown',
      req.requestId
    );
  }
  
  next(err);
};

/**
 * Database query logging middleware
 */
export const dbQueryLogger = (query: string, duration: number, requestId?: string) => {
  structuredLogger.system.databaseQuery(query, duration, requestId);
  
  // Log slow queries
  if (duration > 100) {
    structuredLogger.performance.slowQuery(query, duration, requestId);
  }
};

/**
 * Authentication event logging middleware
 */
export const authLogger = {
  login: (userId: string, email: string, ip: string, userAgent: string, requestId?: string) => {
    structuredLogger.auth.login(userId, email, ip, userAgent, requestId);
  },
  
  logout: (userId: string, sessionId: string, requestId?: string) => {
    structuredLogger.auth.logout(userId, sessionId, requestId);
  },
  
  registration: (userId: string, email: string, ip: string, userAgent: string, requestId?: string) => {
    structuredLogger.auth.registration(userId, email, ip, userAgent, requestId);
  },
  
  passwordChange: (userId: string, requestId?: string) => {
    structuredLogger.auth.passwordChange(userId, requestId);
  },
  
  twoFactorEnabled: (userId: string, requestId?: string) => {
    structuredLogger.auth.twoFactorEnabled(userId, requestId);
  },
  
  twoFactorDisabled: (userId: string, requestId?: string) => {
    structuredLogger.auth.twoFactorDisabled(userId, requestId);
  }
};

/**
 * Security event logging middleware
 */
export const securityLogger = {
  failedLogin: (email: string, ip: string, userAgent: string, requestId?: string) => {
    structuredLogger.security.failedLogin(email, ip, userAgent, requestId);
  },
  
  suspiciousActivity: (userId: string, activity: string, details: any, requestId?: string) => {
    structuredLogger.security.suspiciousActivity(userId, activity, details, requestId);
  },
  
  rateLimitExceeded: (ip: string, endpoint: string, requestId?: string) => {
    structuredLogger.security.rateLimitExceeded(ip, endpoint, requestId);
  },
  
  accountLocked: (userId: string, reason: string, requestId?: string) => {
    structuredLogger.security.accountLocked(userId, reason, requestId);
  },
  
  bruteForceDetected: (ip: string, attempts: number, requestId?: string) => {
    structuredLogger.security.bruteForceDetected(ip, attempts, requestId);
  }
};

/**
 * Business logic logging middleware
 */
export const businessLogger = {
  profileView: (viewerId: string, profileId: string, requestId?: string) => {
    structuredLogger.business.profileView(viewerId, profileId, requestId);
  },
  
  messageSent: (senderId: string, receiverId: string, messageId: string, requestId?: string) => {
    structuredLogger.business.messageSent(senderId, receiverId, messageId, requestId);
  },
  
  giftSent: (senderId: string, receiverId: string, giftId: string, value: number, requestId?: string) => {
    structuredLogger.business.giftSent(senderId, receiverId, giftId, value, requestId);
  },
  
  matchCreated: (user1Id: string, user2Id: string, matchId: string, requestId?: string) => {
    structuredLogger.business.matchCreated(user1Id, user2Id, matchId, requestId);
  },
  
  searchPerformed: (userId: string, filters: any, requestId?: string) => {
    structuredLogger.business.searchPerformed(userId, filters, requestId);
  }
};

/**
 * Performance monitoring middleware
 */
export const performanceLogger = {
  memoryUsage: (requestId?: string) => {
    const usage = process.memoryUsage();
    structuredLogger.performance.memoryUsage(usage, requestId);
  },
  
  slowQuery: (query: string, duration: number, requestId?: string) => {
    structuredLogger.performance.slowQuery(query, duration, requestId);
  },
  
  slowApi: (method: string, url: string, duration: number, requestId?: string) => {
    structuredLogger.performance.slowApi(method, url, duration, requestId);
  }
};

/**
 * Cache operation logging middleware
 */
export const cacheLogger = {
  get: (key: string, requestId?: string) => {
    structuredLogger.system.cacheOperation('get', key, undefined, requestId);
  },
  
  set: (key: string, duration: number, requestId?: string) => {
    structuredLogger.system.cacheOperation('set', key, duration, requestId);
  },
  
  delete: (key: string, requestId?: string) => {
    structuredLogger.system.cacheOperation('delete', key, undefined, requestId);
  }
};

/**
 * User activity tracking middleware
 */
export const activityTracker = {
  track: (userId: string, action: string, details: any, requestId?: string) => {
    // Log user activity for analytics
    structuredLogger.business[action as keyof typeof structuredLogger.business]?.(
      userId,
      details,
      requestId
    );
    
    // Store in database for analytics (would integrate with analytics service)
    // await AnalyticsService.trackActivity(userId, action, details);
  }
};

/**
 * Rate limiting logging middleware
 */
export const rateLimitLogger = {
  exceeded: (ip: string, endpoint: string, limit: number, windowMs: number, requestId?: string) => {
    structuredLogger.security.rateLimitExceeded(ip, endpoint, requestId);
    
    // Log detailed rate limit information
    console.log(`Rate limit exceeded: IP=${ip}, Endpoint=${endpoint}, Limit=${limit}, Window=${windowMs}ms`);
  }
};

/**
 * Database connection logging middleware
 */
export const dbConnectionLogger = {
  connected: (database: string, requestId?: string) => {
    console.log(`Database connected: ${database}`);
  },
  
  disconnected: (database: string, requestId?: string) => {
    console.log(`Database disconnected: ${database}`);
  },
  
  error: (database: string, error: Error, requestId?: string) => {
    structuredLogger.system.serviceError(database, error, requestId);
  }
};
import winston from 'winston';
import { Request } from 'express';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each log level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }),
  
  // File transport for errors
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    )
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: 'logs/combined.log',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),
  
  // File transport for access logs
  new winston.transports.File({
    filename: 'logs/access.log',
    level: 'http',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  })
];

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports,
  exitOnError: false,
});

// Add request context to logs
export const addRequestContext = (req: Request, res: any, next: any) => {
  const requestId = req.headers['x-request-id'] || 
                   req.headers['x-correlation-id'] || 
                   Math.random().toString(36).substr(2, 9);
  
  req.requestId = requestId as string;
  
  // Override res.json to log responses
  const originalJson = res.json;
  res.json = function(data: any) {
    logger.http('HTTP Response', {
      requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.id,
      data
    });
    return originalJson.call(this, data);
  };
  
  next();
};

// Structured logging methods
export const structuredLogger = {
  // Authentication logs
  auth: {
    login: (userId: string, email: string, ip: string, userAgent: string, requestId?: string) => {
      logger.info('User login', {
        type: 'auth',
        action: 'login',
        userId,
        email,
        ip,
        userAgent,
        requestId,
        timestamp: new Date().toISOString()
      });
    },
    
    logout: (userId: string, sessionId: string, requestId?: string) => {
      logger.info('User logout', {
        type: 'auth',
        action: 'logout',
        userId,
        sessionId,
        requestId,
        timestamp: new Date().toISOString()
      });
    },
    
    registration: (userId: string, email: string, ip: string, userAgent: string, requestId?: string) => {
      logger.info('User registration', {
        type: 'auth',
        action: 'registration',
        userId,
        email,
        ip,
        userAgent,
        requestId,
        timestamp: new Date().toISOString()
      });
    },
    
    passwordChange: (userId: string, requestId?: string) => {
      logger.info('Password change', {
        type: 'auth',
        action: 'password_change',
        userId,
        requestId,
        timestamp: new Date().toISOString()
      });
    },
    
    twoFactorEnabled: (userId: string, requestId?: string) => {
      logger.info('2FA enabled', {
        type: 'auth',
        action: '2fa_enabled',
        userId,
        requestId,
        timestamp: new Date().toISOString()
      });
    },
    
    twoFactorDisabled: (userId: string, requestId?: string) => {
      logger.info('2FA disabled', {
        type: 'auth',
        action: '2fa_disabled',
        userId,
        requestId,
        timestamp: new Date().toISOString()
      });
    }
  },
  
  // Security logs
  security: {
    failedLogin: (email: string, ip: string, userAgent: string, requestId?: string) => {
      logger.warn('Failed login attempt', {
        type: 'security',
        action: 'failed_login',
        email,
        ip,
        userAgent,
        requestId,
        timestamp: new Date().toISOString()
      });
    },
    
    suspiciousActivity: (userId: string, activity: string, details: any, requestId?: string) => {
      logger.warn('Suspicious activity detected', {
        type: 'security',
        action: 'suspicious_activity',
        userId,
        activity,
        details,
        requestId,
        timestamp: new Date().toISOString()
      });
    },
    
    rateLimitExceeded: (ip: string, endpoint: string, requestId?: string) => {
      logger.warn('Rate limit exceeded', {
        type: 'security',
        action: 'rate_limit_exceeded',
        ip,
        endpoint,
        requestId,
        timestamp: new Date().toISOString()
      });
    },
    
    accountLocked: (userId: string, reason: string, requestId?: string) => {
      logger.error('Account locked', {
        type: 'security',
        action: 'account_locked',
        userId,
        reason,
        requestId,
        timestamp: new Date().toISOString()
      });
    },
    
    bruteForceDetected: (ip: string, attempts: number, requestId?: string) => {
      logger.error('Brute force attack detected', {
        type: 'security',
        action: 'brute_force',
        ip,
        attempts,
        requestId,
        timestamp: new Date().toISOString()
      });
    }
  },
  
  // Business logic logs
  business: {
    profileView: (viewerId: string, profileId: string, requestId?: string) => {
      logger.info('Profile viewed', {
        type: 'business',
        action: 'profile_view',
        viewerId,
        profileId,
        requestId,
        timestamp: new Date().toISOString()
      });
    },
    
    messageSent: (senderId: string, receiverId: string, messageId: string, requestId?: string) => {
      logger.info('Message sent', {
        type: 'business',
        action: 'message_sent',
        senderId,
        receiverId,
        messageId,
        requestId,
        timestamp: new Date().toISOString()
      });
    },
    
    giftSent: (senderId: string, receiverId: string, giftId: string, value: number, requestId?: string) => {
      logger.info('Gift sent', {
        type: 'business',
        action: 'gift_sent',
        senderId,
        receiverId,
        giftId,
        value,
        requestId,
        timestamp: new Date().toISOString()
      });
    },
    
    matchCreated: (user1Id: string, user2Id: string, matchId: string, requestId?: string) => {
      logger.info('Match created', {
        type: 'business',
        action: 'match_created',
        user1Id,
        user2Id,
        matchId,
        requestId,
        timestamp: new Date().toISOString()
      });
    },
    
    searchPerformed: (userId: string, filters: any, requestId?: string) => {
      logger.info('Search performed', {
        type: 'business',
        action: 'search',
        userId,
        filters,
        requestId,
        timestamp: new Date().toISOString()
      });
    }
  },
  
  // System logs
  system: {
    apiRequest: (method: string, url: string, statusCode: number, responseTime: number, requestId?: string) => {
      logger.http('API Request', {
        type: 'system',
        action: 'api_request',
        method,
        url,
        statusCode,
        responseTime,
        requestId,
        timestamp: new Date().toISOString()
      });
    },
    
    databaseQuery: (query: string, duration: number, requestId?: string) => {
      logger.debug('Database query', {
        type: 'system',
        action: 'database_query',
        query: query.substring(0, 100), // Limit query length
        duration,
        requestId,
        timestamp: new Date().toISOString()
      });
    },
    
    cacheOperation: (operation: string, key: string, duration?: number, requestId?: string) => {
      logger.debug('Cache operation', {
        type: 'system',
        action: 'cache_operation',
        operation,
        key,
        duration,
        requestId,
        timestamp: new Date().toISOString()
      });
    },
    
    serviceError: (service: string, error: Error, requestId?: string) => {
      logger.error('Service error', {
        type: 'system',
        action: 'service_error',
        service,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        requestId,
        timestamp: new Date().toISOString()
      });
    }
  },
  
  // Performance logs
  performance: {
    slowQuery: (query: string, duration: number, requestId?: string) => {
      logger.warn('Slow database query', {
        type: 'performance',
        action: 'slow_query',
        query: query.substring(0, 100),
        duration,
        requestId,
        timestamp: new Date().toISOString()
      });
    },
    
    slowApi: (method: string, url: string, duration: number, requestId?: string) => {
      logger.warn('Slow API response', {
        type: 'performance',
        action: 'slow_api',
        method,
        url,
        duration,
        requestId,
        timestamp: new Date().toISOString()
      });
    },
    
    memoryUsage: (usage: NodeJS.MemoryUsage, requestId?: string) => {
      logger.info('Memory usage', {
        type: 'performance',
        action: 'memory_usage',
        usage,
        requestId,
        timestamp: new Date().toISOString()
      });
    }
  }
};

// Export logger for direct use
export default logger;
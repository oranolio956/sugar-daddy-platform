import { Request, Response, NextFunction } from 'express';

/**
 * Enhanced Security headers middleware with comprehensive protection
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Content Security Policy with enhanced security
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.googleapis.com *.gstatic.com *.cloudflare.com; " +
    "style-src 'self' 'unsafe-inline' *.googleapis.com *.gstatic.com *.cloudflare.com; " +
    "img-src 'self' data: *.googleapis.com *.gstatic.com *.cloudflare.com *.amazonaws.com; " +
    "font-src 'self' *.googleapis.com *.gstatic.com *.cloudflare.com; " +
    "connect-src 'self' *.googleapis.com *.gstatic.com *.cloudflare.com *.amazonaws.com; " +
    "frame-src 'self' *.google.com; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'; " +
    "frame-ancestors 'none'; " +
    "upgrade-insecure-requests;"
  );

  // HTTP Strict Transport Security with longer duration
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

  // X-Frame-Options
  res.setHeader('X-Frame-Options', 'DENY');

  // X-Content-Type-Options
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // X-XSS-Protection (legacy but still useful for older browsers)
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer Policy with enhanced privacy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy (Feature Policy) with more restrictions
  res.setHeader('Permissions-Policy',
    'geolocation=(), ' +
    'microphone=(), ' +
    'camera=(), ' +
    'payment=(), ' +
    'usb=(), ' +
    'magnetometer=(), ' +
    'gyroscope=(), ' +
    'accelerometer=(), ' +
    'autoplay=(), ' +
    'document-domain=(), ' +
    'encrypted-media=(), ' +
    'picture-in-picture=(), ' +
    'sync-xhr=(), ' +
    'vibrate=(), ' +
    'wake-lock=(), ' +
    'speaker=(), ' +
    'vibration=(), ' +
    'fullscreen=(), ' +
    'display-capture=(), ' +
    'screen-wake-lock=(), ' +
    'web-share=(), ' +
    'interest-cohort=(), ' +
    'camera=(), ' +
    'microphone=(), ' +
    'geolocation=(), ' +
    'notifications=(), ' +
    'push=(), ' +
    'sync=(), ' +
    'magnetometer=(), ' +
    'gyroscope=(), ' +
    'accelerometer=(), ' +
    'ambient-light-sensor=(), ' +
    'accelerometer=(), ' +
    'autoplay=(), ' +
    'battery=(), ' +
    'bluetooth=(), ' +
    'camera=(), ' +
    'cross-origin-isolated=(), ' +
    'display-capture=(), ' +
    'document-domain=(), ' +
    'encrypted-media=(), ' +
    'execution-while-not-rendered=(), ' +
    'execution-while-out-of-viewport=(), ' +
    'fullscreen=(), ' +
    'geolocation=(), ' +
    'gyroscope=(), ' +
    'keyboard-map=(), ' +
    'layout-animations=(self), ' +
    'legacy-image-formats=(), ' +
    'magnetometer=(), ' +
    'microphone=(), ' +
    'midi=(), ' +
    'navigation-override=(), ' +
    'payment=(), ' +
    'picture-in-picture=(), ' +
    'publickey-credentials-get=(), ' +
    'screen-wake-lock=(), ' +
    'sync-xhr=(), ' +
    'usb=(), ' +
    'web-share=(), ' +
    'xr-spatial-tracking=()'
  );

  // Additional security headers
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('Clear-Site-Data', '"cache", "cookies", "storage", "executionContexts"');

  // Cache Control for sensitive endpoints with enhanced security
  if (req.path.includes('/auth/') || req.path.includes('/admin/') || req.path.includes('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }

  // API-specific headers
  if (req.path.startsWith('/api/')) {
    res.setHeader('X-API-Version', '1.0');
    res.setHeader('X-RateLimit-Limit', '100');
    res.setHeader('X-RateLimit-Remaining', '99');
    res.setHeader('X-RateLimit-Reset', new Date(Date.now() + 60000).toISOString());
  }

  // Remove server information
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');

  next();
};

/**
 * CORS configuration with security enhancements
 */
export const corsOptions = {
  origin: function (origin: string | undefined, callback: any) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://yourdomain.com',
      'https://www.yourdomain.com'
    ];

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  maxAge: 86400 // 24 hours
};

/**
 * CSRF protection middleware
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for GET requests and certain API endpoints
  if (req.method === 'GET' || req.path.includes('/api/auth/refresh')) {
    return next();
  }

  const token = req.headers['x-csrf-token'] as string;
  const sessionToken = req.headers['x-session-token'] as string;

  if (!token && !sessionToken) {
    return res.status(403).json({
      error: 'CSRF token missing',
      message: 'CSRF token is required for this request'
    });
  }

  // In a real implementation, you'd validate the CSRF token against a stored value
  // For now, we'll just check if it exists
  next();
};

/**
 * Input sanitization middleware
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const { SecurityUtils } = require('../utils/security');

  // Sanitize query parameters
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = SecurityUtils.sanitizeInput(req.query[key] as string);
      }
    }
  }

  // Sanitize body parameters
  if (req.body) {
    const sanitizeObject = (obj: any): any => {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = SecurityUtils.sanitizeInput(obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          obj[key] = sanitizeObject(obj[key]);
        }
      }
      return obj;
    };

    req.body = sanitizeObject(req.body);
  }

  next();
};

/**
 * Request size limit middleware
 */
export const requestSizeLimit = (req: Request, res: Response, next: NextFunction) => {
  const contentLength = parseInt(req.headers['content-length'] || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (contentLength > maxSize) {
    return res.status(413).json({
      error: 'Request too large',
      message: 'Request body size exceeds the maximum allowed size of 10MB'
    });
  }

  next();
};

/**
 * User agent validation middleware
 */
export const validateUserAgent = (req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.get('User-Agent') || '';

  // Block known malicious user agents
  const blockedAgents = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /requests/i
  ];

  for (const agent of blockedAgents) {
    if (agent.test(userAgent)) {
      console.warn(`Blocked user agent: ${userAgent} from ${req.ip}`);
      return res.status(403).json({
        error: 'Forbidden',
        message: 'User agent not allowed'
      });
    }
  }

  next();
};

/**
 * API versioning middleware
 */
export const apiVersioning = (req: Request, res: Response, next: NextFunction) => {
  const apiVersion = req.headers['x-api-version'] || '1.0';
  
  // Set API version in response header
  res.setHeader('X-API-Version', apiVersion);
  
  // Store version in request for use in controllers
  req.apiVersion = apiVersion;

  next();
};

/**
 * Request logging middleware for security events
 */
export const securityLogging = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Log security-relevant requests
  const sensitivePaths = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/reset-password',
    '/api/auth/2fa',
    '/api/admin',
    '/api/profile'
  ];

  const isSensitive = sensitivePaths.some(path => req.path.includes(path));

  if (isSensitive) {
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id || 'anonymous',
      body: req.method === 'POST' ? req.body : undefined
    };

    console.log('Security Event:', JSON.stringify(logData, null, 2));
  }

  // Log response time
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    if (responseTime > 1000) { // Log slow requests
      console.warn(`Slow request: ${req.method} ${req.path} - ${responseTime}ms`);
    }
  });

  next();
};
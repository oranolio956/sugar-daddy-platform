import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { SecurityUtils } from '../utils/security';

/**
 * CSRF Protection Middleware
 * 
 * This middleware provides comprehensive CSRF protection for all state-changing operations.
 * It uses double-submit cookie pattern with additional security measures.
 */

// CSRF token storage (in production, use Redis or database)
const csrfTokens = new Map<string, { token: string; expires: number }>();

/**
 * Generate CSRF token and store it
 */
export const generateCSRFToken = (userId: string): string => {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = Date.now() + (30 * 60 * 1000); // 30 minutes
  
  csrfTokens.set(userId, { token, expires });
  
  // Clean up expired tokens periodically
  if (Math.random() < 0.1) { // 10% chance to cleanup
    cleanupExpiredTokens();
  }
  
  return token;
};

/**
 * Verify CSRF token
 */
export const verifyCSRFToken = (userId: string, token: string): boolean => {
  const stored = csrfTokens.get(userId);
  
  if (!stored) {
    return false;
  }
  
  if (Date.now() > stored.expires) {
    csrfTokens.delete(userId);
    return false;
  }
  
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(stored.token)
  );
};

/**
 * Cleanup expired tokens
 */
const cleanupExpiredTokens = () => {
  const now = Date.now();
  for (const [userId, data] of csrfTokens.entries()) {
    if (now > data.expires) {
      csrfTokens.delete(userId);
    }
  }
};

/**
 * CSRF protection middleware
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for GET requests and certain safe operations
  if (req.method === 'GET' || 
      req.path.includes('/api/auth/refresh') || 
      req.path.includes('/api/auth/csrf-token')) {
    return next();
  }
  
  // Get user ID from authenticated request
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      message: 'CSRF protection requires authentication'
    });
  }
  
  // Get CSRF token from headers or body
  const token = req.headers['x-csrf-token'] as string || 
                req.body._csrf as string ||
                req.query._csrf as string;
  
  if (!token) {
    return res.status(403).json({
      success: false,
      error: 'CSRF token missing',
      message: 'CSRF token is required for this request'
    });
  }
  
  // Verify token
  if (!verifyCSRFToken(userId, token)) {
    return res.status(403).json({
      success: false,
      error: 'Invalid CSRF token',
      message: 'CSRF token verification failed'
    });
  }
  
  next();
};

/**
 * Double-submit cookie middleware
 */
export const doubleSubmitCookie = (req: Request, res: Response, next: NextFunction) => {
  // Skip for GET requests
  if (req.method === 'GET') {
    return next();
  }
  
  // Check for double-submit cookie
  const cookieToken = req.cookies?.csrf_token;
  const headerToken = req.headers['x-csrf-token'] as string;
  
  if (!cookieToken || !headerToken) {
    return res.status(403).json({
      success: false,
      error: 'CSRF protection failed',
      message: 'Double-submit cookie validation failed'
    });
  }
  
  // Verify tokens match
  if (!crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken))) {
    return res.status(403).json({
      success: false,
      error: 'CSRF protection failed',
      message: 'Cookie and header tokens do not match'
    });
  }
  
  next();
};

/**
 * Generate new CSRF token endpoint
 */
export const generateCSRFTokenEndpoint = (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }
  
  const token = generateCSRFToken(userId);
  
  // Set secure cookie
  res.cookie('csrf_token', token, {
    httpOnly: false, // Need access from JavaScript
    secure: process.env.NODE_ENV === 'production', // Only HTTPS in production
    sameSite: 'strict',
    maxAge: 30 * 60 * 1000 // 30 minutes
  });
  
  res.json({
    success: true,
    csrfToken: token
  });
};

/**
 * CSRF token validation for API endpoints
 */
export const validateCSRFToken = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }
  
  const token = req.headers['x-csrf-token'] as string;
  if (!token || !verifyCSRFToken(userId, token)) {
    return res.status(403).json({
      success: false,
      error: 'Invalid CSRF token'
    });
  }
  
  next();
};

/**
 * Enhanced CSRF protection with origin validation
 */
export const enhancedCSRFProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip for GET requests
  if (req.method === 'GET') {
    return next();
  }
  
  // Validate origin header
  const origin = req.get('Origin');
  const referer = req.get('Referer');
  
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://yourdomain.com',
    'https://www.yourdomain.com'
  ];
  
  let validOrigin = false;
  
  if (origin) {
    validOrigin = allowedOrigins.includes(origin);
  } else if (referer) {
    const refererUrl = new URL(referer);
    validOrigin = allowedOrigins.includes(`${refererUrl.protocol}//${refererUrl.host}`);
  }
  
  if (!validOrigin) {
    return res.status(403).json({
      success: false,
      error: 'Invalid origin',
      message: 'Request origin not allowed'
    });
  }
  
  // Apply standard CSRF protection
  csrfProtection(req, res, (err) => {
    if (err) return next(err);
    
    // Apply double-submit cookie validation
    doubleSubmitCookie(req, res, next);
  });
};

export default {
  csrfProtection,
  doubleSubmitCookie,
  generateCSRFTokenEndpoint,
  validateCSRFToken,
  enhancedCSRFProtection,
  generateCSRFToken,
  verifyCSRFToken
};
import { Request, Response, NextFunction } from 'express';
import { securityConfig } from '../config/securityConfig';
import { securityUtils } from '../utils/security';
import { APISecurityService } from '../services/apiSecurityService';

// Import all security middleware
import { securityHeaders } from './securityHeaders';
import { csrfProtection, enhancedCSRFProtection } from './csrf';
import { globalRateLimit, authRateLimit, loginRateLimit } from './rateLimiter';
import { 
  preventSQLInjection, 
  preventXSS, 
  preventCommandInjection, 
  preventPathTraversal, 
  preventLDAPInjection 
} from '../validation/middleware';
import { validateUserAgent, requestSizeLimit, sanitizeInput } from './securityHeaders';
import { suspiciousActivityMiddleware, deviceTrackingMiddleware } from './rateLimiter';

const apiSecurityService = new APISecurityService();

/**
 * Security Orchestrator Middleware
 * 
 * This middleware orchestrates all security measures in the correct order
 * and provides a centralized way to enable/disable security features.
 */
export class SecurityOrchestrator {
  private static instance: SecurityOrchestrator;
  private enabledFeatures: Set<string>;

  private constructor() {
    this.enabledFeatures = new Set();
    this.initializeFeatures();
  }

  public static getInstance(): SecurityOrchestrator {
    if (!SecurityOrchestrator.instance) {
      SecurityOrchestrator.instance = new SecurityOrchestrator();
    }
    return SecurityOrchestrator.instance;
  }

  /**
   * Initialize enabled features based on configuration
   */
  private initializeFeatures(): void {
    const config = securityConfig.getConfigForEnvironment();
    
    if (config.csrf.enabled) this.enabledFeatures.add('csrf');
    if (config.rateLimiting.global.points > 0) this.enabledFeatures.add('rateLimiting');
    if (config.validation.sanitizeInput) this.enabledFeatures.add('inputValidation');
    if (config.api.signatureRequired) this.enabledFeatures.add('apiSecurity');
    if (config.monitoring.securityEvents.enabled) this.enabledFeatures.add('monitoring');
  }

  /**
   * Get middleware for API endpoints
   */
  public getAPIMiddleware() {
    const middleware: any[] = [];

    // 1. Security logging and monitoring
    if (this.enabledFeatures.has('monitoring')) {
      middleware.push(this.securityLoggingMiddleware);
    }

    // 2. Request size and user agent validation
    middleware.push(requestSizeLimit);
    middleware.push(validateUserAgent);

    // 3. Input sanitization
    if (this.enabledFeatures.has('inputValidation')) {
      middleware.push(sanitizeInput);
    }

    // 4. Device tracking
    middleware.push(deviceTrackingMiddleware);

    // 5. Suspicious activity detection
    if (this.enabledFeatures.has('monitoring')) {
      middleware.push(suspiciousActivityMiddleware);
    }

    // 6. Rate limiting
    if (this.enabledFeatures.has('rateLimiting')) {
      middleware.push(globalRateLimit);
    }

    // 7. Enhanced input validation (security)
    if (this.enabledFeatures.has('inputValidation')) {
      middleware.push(preventSQLInjection);
      middleware.push(preventXSS);
      middleware.push(preventCommandInjection);
      middleware.push(preventPathTraversal);
      middleware.push(preventLDAPInjection);
    }

    // 8. API security (key validation and signature)
    if (this.enabledFeatures.has('apiSecurity')) {
      middleware.push(apiSecurityService.apiKeyAuth);
      middleware.push(apiSecurityService.signedRequestAuth);
    }

    // 9. CSRF protection for state-changing operations
    if (this.enabledFeatures.has('csrf')) {
      middleware.push(enhancedCSRFProtection);
    }

    // 10. Security headers
    middleware.push(securityHeaders);

    return middleware;
  }

  /**
   * Get middleware for authentication endpoints
   */
  public getAuthMiddleware() {
    const middleware: any[] = [];

    // Add all API middleware
    middleware.push(...this.getAPIMiddleware());

    // Add authentication-specific rate limiting
    if (this.enabledFeatures.has('rateLimiting')) {
      middleware.push(authRateLimit);
      middleware.push(loginRateLimit);
    }

    return middleware;
  }

  /**
   * Get middleware for admin endpoints
   */
  public getAdminMiddleware() {
    const middleware: any[] = [];

    // Add all API middleware
    middleware.push(...this.getAPIMiddleware());

    // Add stricter rate limiting for admin endpoints
    if (this.enabledFeatures.has('rateLimiting')) {
      middleware.push(globalRateLimit); // Already included, but can be customized
    }

    // Add additional admin-specific security checks
    middleware.push(this.adminSecurityMiddleware);

    return middleware;
  }

  /**
   * Security logging middleware
   */
  private securityLoggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();
    
    // Log security-relevant requests
    const sensitivePaths = [
      '/api/auth/',
      '/api/admin/',
      '/api/user/',
      '/api/profile/'
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
        body: req.method === 'POST' ? this.sanitizeLogData(req.body) : undefined,
        headers: this.filterSensitiveHeaders(req.headers)
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

  /**
   * Admin security middleware
   */
  private adminSecurityMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    // Check if user has admin privileges
    if (!req.user || !req.user.role || !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required',
        message: 'You do not have permission to access this resource'
      });
    }

    // Additional admin-specific logging
    console.log(`Admin access: ${req.user.username} accessed ${req.path}`);

    next();
  };

  /**
   * Sanitize log data to remove sensitive information
   */
  private sanitizeLogData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth', 'credential'];
    const sanitized = { ...data };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  /**
   * Filter sensitive headers from logs
   */
  private filterSensitiveHeaders(headers: any): any {
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-csrf-token'];
    const filtered = { ...headers };

    for (const header of sensitiveHeaders) {
      if (filtered[header]) {
        filtered[header] = '[REDACTED]';
      }
    }

    return filtered;
  }

  /**
   * Enable or disable a security feature
   */
  public toggleFeature(feature: string, enabled: boolean): void {
    if (enabled) {
      this.enabledFeatures.add(feature);
    } else {
      this.enabledFeatures.delete(feature);
    }
  }

  /**
   * Check if a feature is enabled
   */
  public isFeatureEnabled(feature: string): boolean {
    return this.enabledFeatures.has(feature);
  }

  /**
   * Get status of all security features
   */
  public getSecurityStatus(): Record<string, boolean> {
    return {
      csrf: this.enabledFeatures.has('csrf'),
      rateLimiting: this.enabledFeatures.has('rateLimiting'),
      inputValidation: this.enabledFeatures.has('inputValidation'),
      apiSecurity: this.enabledFeatures.has('apiSecurity'),
      monitoring: this.enabledFeatures.has('monitoring')
    };
  }
}

// Create singleton instance
export const securityOrchestrator = SecurityOrchestrator.getInstance();

/**
 * Convenience middleware functions
 */
export const secureAPI = securityOrchestrator.getAPIMiddleware();
export const secureAuth = securityOrchestrator.getAuthMiddleware();
export const secureAdmin = securityOrchestrator.getAdminMiddleware();

export default securityOrchestrator;
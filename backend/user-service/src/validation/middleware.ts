import { Request, Response, NextFunction } from 'express';
import { sanitizeInput } from './schemas';
import * as Joi from 'joi';

// Validation middleware factory
export const validate = (schema: any): ((req: Request, res: Response, next: NextFunction) => void | Response) => {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    // Sanitize input first
    const sanitizedBody = sanitizeInput(req.body);
    const sanitizedQuery = sanitizeInput(req.query);
    const sanitizedParams = sanitizeInput(req.params);

    // Merge sanitized inputs
    const data = {
      ...sanitizedParams,
      ...sanitizedQuery,
      ...sanitizedBody
    };

    const { error, value } = schema.validate(data, { abortEarly: false });

    if (error) {
      const errorMessages = error.details.map((detail: Joi.ValidationErrorItem) => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errorMessages
      });
    }

    // Replace request body with sanitized and validated data
    req.body = value;
    next();
  };
};

// Rate limiting validation middleware
export const validateRateLimit = (req: Request, res: Response, next: NextFunction): void | Response => {
  // Check if rate limit headers exist
  const remaining = res.getHeader('X-RateLimit-Remaining');
  const resetTime = res.getHeader('X-RateLimit-Reset');

  // Use req to check the path or method for more specific rate limiting
  const path = req.path;

  if (remaining !== undefined && typeof remaining === 'string' && parseInt(remaining, 10) === 0) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests',
      message: `Rate limit exceeded for ${path}`,
      retryAfter: resetTime
    });
  }

  next();
};

// Security headers validation middleware
export const validateSecurityHeaders = (req: Request, res: Response, next: NextFunction): void | Response => {
  // Check for required security headers
  const userAgent = req.get('User-Agent');
  const origin = req.get('Origin');
  // const referer = req.get('Referer'); // Removed unused variable

  // Block common malicious user agents
  const maliciousAgents = [
    'sqlmap',
    'nikto',
    'nessus',
    'openvas',
    'w3af',
    'acunetix'
  ];

  if (userAgent) {
    const lowerAgent = userAgent.toLowerCase();
    for (const agent of maliciousAgents) {
      if (lowerAgent.includes(agent)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          message: 'Malicious user agent detected'
        });
      }
    }
  }

  // Validate origin for CORS
  if (req.method === 'POST' && origin) {
    const allowedOrigins = process.env['ALLOWED_ORIGINS']?.split(',') || [];
    if (!allowedOrigins.includes(origin)) {
      return res.status(403).json({
        success: false,
        error: 'CORS policy violation',
        message: 'Origin not allowed'
      });
    }
  }

  next();
};

// CSRF token validation middleware
export const validateCSRF = (req: Request, res: Response, next: NextFunction): void | Response => {
  // Skip CSRF validation for GET requests
  if (req.method === 'GET') {
    return next();
  }

  const csrfToken = req.get('X-CSRF-Token') || req.body._csrf;
  
  if (!csrfToken) {
    return res.status(403).json({
      success: false,
      error: 'CSRF token missing',
      message: 'Please include a valid CSRF token'
    });
  }

  // In a real implementation, you would validate the token against a stored value
  // For now, we'll just check if it exists and has a minimum length
  if (csrfToken.length < 32) {
    return res.status(403).json({
      success: false,
      error: 'Invalid CSRF token',
      message: 'CSRF token is too short'
    });
  }

  next();
};

// Content-Type validation middleware
export const validateContentType = (req: Request, res: Response, next: NextFunction): void | Response => {
  const contentType = req.get('Content-Type');

  // For POST/PUT/PATCH requests, require proper content type
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    if (!contentType) {
      return res.status(400).json({
        success: false,
        error: 'Content-Type required',
        message: 'Please specify Content-Type header'
      });
    }

    if (!contentType.includes('application/json') && !contentType.includes('multipart/form-data')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Content-Type',
        message: 'Content-Type must be application/json or multipart/form-data'
      });
    }
  }

  next();
};

// File upload validation middleware
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

export const validateFileUpload = (req: Request, res: Response, next: NextFunction): void | Response => {
  if (!req.file && !req.files) {
    return next();
  }

  const file = req.file as MulterFile | undefined;
  const files = req.files as MulterFile[] | undefined;

  if (file) {
    // Validate single file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];

    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file type',
        message: 'Only JPEG, PNG, and PDF files are allowed'
      });
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return res.status(400).json({
        success: false,
        error: 'File too large',
        message: 'File size cannot exceed 10MB'
      });
    }

    const extension = file.originalname.split('.').pop()?.toLowerCase();
    if (extension && !allowedExtensions.includes(`.${extension}`)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file extension',
        message: 'Only .jpg, .jpeg, .png, and .pdf files are allowed'
      });
    }
  }

  if (files && files.length > 0) {
    // Validate multiple files
    for (const f of files) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      
      if (!allowedTypes.includes(f.mimetype)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid file type',
          message: `File ${f.originalname} has invalid type. Only JPEG, PNG, and PDF files are allowed`
        });
      }

      if (f.size > 10 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          error: 'File too large',
          message: `File ${f.originalname} exceeds 10MB limit`
        });
      }
    }
  }

  next();
};

// Enhanced SQL injection prevention middleware
export const preventSQLInjection = (req: Request, res: Response, next: NextFunction): void | Response => {
  const suspiciousPatterns = [
    // SQL keywords
    /(\bselect\b|\binsert\b|\bupdate\b|\bdelete\b|\bdrop\b|\bunion\b|\bexec\b|\bexecute\b|\bcreate\b|\balter\b|\btruncate\b|\bdeclare\b)/i,
    // SQL injection patterns
    /basic/i,
    // Boolean-based injection
    /(\bor\b|\band\b)\s+\w+\s*[=<>]/i,
    // Time-based injection
    /(\bsleep\b|\bwaitfor\b|\bdelay\b)/i,
    // Error-based injection
    /(\bconvert\b|\bcast\b|\bextractvalue\b|\bupdatexml\b)/i,
    // Union-based injection
    /(\bunion\b.*\bselect\b)/i,
    // Comment-based injection
    /(\-\-|\#|\/\*|\*\/)/i
  ];

  const checkValue = (value: any): boolean => {
    if (typeof value === 'string') {
      return suspiciousPatterns.some(pattern => pattern.test(value));
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(checkValue);
    }
    return false;
  };

  const hasSuspiciousContent = checkValue(req.query) ||
                              checkValue(req.params) ||
                              checkValue(req.body);

  if (hasSuspiciousContent) {
    console.warn('SQL injection attempt detected:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method,
      body: req.body
    });
    
    return res.status(400).json({
      success: false,
      error: 'Suspicious content detected',
      message: 'Request contains potentially malicious SQL injection content'
    });
  }

  next();
};

// Enhanced XSS prevention middleware
export const preventXSS = (req: Request, res: Response, next: NextFunction): void | Response => {
  const xssPatterns = [
    // Script tags
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    /<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi,
    // JavaScript protocols
    /javascript:/gi,
    /data:text\/html/gi,
    /vbscript:/gi,
    /livescript:/gi,
    // Event handlers
    /onload\s*=/gi,
    /onerror\s*=/gi,
    /onclick\s*=/gi,
    /onmouseover\s*=/gi,
    /onfocus\s*=/gi,
    /onblur\s*=/gi,
    /onchange\s*=/gi,
    /onsubmit\s*=/gi,
    /onreset\s*=/gi,
    // CSS expressions
    /expression\s*\(/gi,
    /behaviou?r\s*:/gi,
    // HTML entities
    /<script>/gi,
    /<script>/gi,
    /<script>/gi
  ];

  const checkValue = (value: any): boolean => {
    if (typeof value === 'string') {
      return xssPatterns.some(pattern => pattern.test(value));
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(checkValue);
    }
    return false;
  };

  const hasXSSContent = checkValue(req.query) ||
                        checkValue(req.params) ||
                        checkValue(req.body);

  if (hasXSSContent) {
    console.warn('XSS attempt detected:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method,
      body: req.body
    });
    
    return res.status(400).json({
      success: false,
      error: 'XSS attempt detected',
      message: 'Request contains potentially malicious script content'
    });
  }

  next();
};

// Command injection prevention middleware
export const preventCommandInjection = (req: Request, res: Response, next: NextFunction): void | Response => {
  const commandPatterns = [
    // Command execution
    /(\bexec\b|\bsystem\b|\bpassthru\b|\bshell_exec\b|\bproc_open\b|\bpopen\b|\bpcntl_exec\b)/i,
    // Shell metacharacters
    /[;&|`$(){}[\]\\]/,
    // File system commands
    /(\bls\b|\bcat\b|\bps\b|\bkill\b|\bwhoami\b|\bid\b|\buname\b)/i,
    // Windows commands
    /(\bcmd\b|\bdir\b|\btype\b|\bnet\b|\breg\b)/i
  ];

  const checkValue = (value: any): boolean => {
    if (typeof value === 'string') {
      return commandPatterns.some(pattern => pattern.test(value));
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(checkValue);
    }
    return false;
  };

  const hasCommandInjection = checkValue(req.query) ||
                              checkValue(req.params) ||
                              checkValue(req.body);

  if (hasCommandInjection) {
    console.warn('Command injection attempt detected:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method,
      body: req.body
    });
    
    return res.status(400).json({
      success: false,
      error: 'Command injection attempt detected',
      message: 'Request contains potentially malicious command injection content'
    });
  }

  next();
};

// Path traversal prevention middleware
export const preventPathTraversal = (req: Request, res: Response, next: NextFunction): void | Response => {
  const pathPatterns = [
    // Directory traversal
    /\.\.\/|\.\.\\|\.\.\/\.\.\/|\.\.\\\.\.\\/,
    // Absolute paths
    /^\/(etc|var|usr|home|root|boot|bin|sbin|proc|sys|dev)\//,
    // Windows paths
    /^[A-Za-z]:\\|\\\\|\\[A-Za-z$]/,
    // Special files
    /(\.env|config\.php|wp-config\.php|\.htaccess|\.htpasswd|web\.config)/i
  ];

  const checkValue = (value: any): boolean => {
    if (typeof value === 'string') {
      return pathPatterns.some(pattern => pattern.test(value));
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(checkValue);
    }
    return false;
  };

  const hasPathTraversal = checkValue(req.query) ||
                           checkValue(req.params) ||
                           checkValue(req.body);

  if (hasPathTraversal) {
    console.warn('Path traversal attempt detected:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method,
      body: req.body
    });
    
    return res.status(400).json({
      success: false,
      error: 'Path traversal attempt detected',
      message: 'Request contains potentially malicious path traversal content'
    });
  }

  next();
};

// LDAP injection prevention middleware
export const preventLDAPInjection = (req: Request, res: Response, next: NextFunction): void | Response => {
  const ldapPatterns = [
    // LDAP special characters
    /[()\\*|&!]/,
    // LDAP filters
    /(\(|\)|\\|\*|\||&|!)/,
    // LDAP injection patterns
    /(\*|\(|\)|\\)/
  ];

  const checkValue = (value: any): boolean => {
    if (typeof value === 'string') {
      return ldapPatterns.some(pattern => pattern.test(value));
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(checkValue);
    }
    return false;
  };

  const hasLDAPInjection = checkValue(req.query) ||
                           checkValue(req.params) ||
                           checkValue(req.body);

  if (hasLDAPInjection) {
    console.warn('LDAP injection attempt detected:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method,
      body: req.body
    });
    
    return res.status(400).json({
      success: false,
      error: 'LDAP injection attempt detected',
      message: 'Request contains potentially malicious LDAP injection content'
    });
  }

  next();
};
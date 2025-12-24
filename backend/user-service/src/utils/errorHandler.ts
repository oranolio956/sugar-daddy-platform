import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'sequelize';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: string;
  details?: any;
}

/**
 * Custom application error class
 */
export class ApplicationError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;
  public details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string,
    details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle Sequelize validation errors
 */
function handleSequelizeValidationError(error: ValidationError): AppError {
  const errors = error.errors.map(err => ({
    field: err.path,
    message: err.message,
    value: err.value
  }));

  return new ApplicationError(
    'Validation failed',
    400,
    true,
    'VALIDATION_ERROR',
    { errors }
  );
}

/**
 * Handle JWT errors
 */
function handleJWTError(error: any): AppError {
  if (error.name === 'JsonWebTokenError') {
    return new ApplicationError(
      'Invalid token',
      401,
      true,
      'INVALID_TOKEN'
    );
  }
  
  if (error.name === 'TokenExpiredError') {
    return new ApplicationError(
      'Token has expired',
      401,
      true,
      'TOKEN_EXPIRED'
    );
  }

  return new ApplicationError(
    'Token error',
    401,
    true,
    'TOKEN_ERROR'
  );
}

/**
 * Handle duplicate key errors
 */
function handleDuplicateKeyError(error: any): AppError {
  const field = Object.keys(error.keyPattern || {})[0];
  const value = error.keyValue?.[field];

  return new ApplicationError(
    `${field} already exists`,
    409,
    true,
    'DUPLICATE_KEY',
    { field, value }
  );
}

/**
 * Handle cast errors (invalid ObjectId, etc.)
 */
function handleCastError(error: any): AppError {
  return new ApplicationError(
    'Invalid data format',
    400,
    true,
    'CAST_ERROR',
    { path: error.path, value: error.value }
  );
}

/**
 * Handle general errors
 */
function handleGenericError(error: any): AppError {
  return new ApplicationError(
    error.message || 'An unexpected error occurred',
    error.statusCode || 500,
    false,
    error.code || 'INTERNAL_ERROR',
    error.details || {}
  );
}

/**
 * Global error handler middleware
 */
export function globalErrorHandler(
  error: AppError | Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Set default values
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error';
  let code = error.code || 'INTERNAL_ERROR';
  let details = error.details || {};

  // Handle different error types
  if (error.name === 'ValidationError') {
    const appError = handleSequelizeValidationError(error as ValidationError);
    statusCode = appError.statusCode;
    message = appError.message;
    code = appError.code;
    details = appError.details;
  } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    const appError = handleJWTError(error);
    statusCode = appError.statusCode;
    message = appError.message;
    code = appError.code;
  } else if (error.name === 'MongoServerError' && error.code === 11000) {
    const appError = handleDuplicateKeyError(error);
    statusCode = appError.statusCode;
    message = appError.message;
    code = appError.code;
    details = appError.details;
  } else if (error.name === 'CastError') {
    const appError = handleCastError(error);
    statusCode = appError.statusCode;
    message = appError.message;
    code = appError.code;
    details = appError.details;
  } else if (error instanceof ApplicationError) {
    // Already an application error
    statusCode = error.statusCode;
    message = error.message;
    code = error.code;
    details = error.details;
  } else {
    // Generic error
    const appError = handleGenericError(error);
    statusCode = appError.statusCode;
    message = appError.message;
    code = appError.code;
    details = appError.details;
  }

  // Log error details
  console.error('Error details:', {
    message: error.message,
    stack: error.stack,
    statusCode,
    code,
    details,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Don't send error details in production for security
  const errorResponse = {
    success: false,
    error: {
      message,
      code,
      ...(process.env.NODE_ENV === 'development' && { details }),
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    }
  };

  res.status(statusCode).json(errorResponse);
}

/**
 * Async error wrapper for route handlers
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  const error = new ApplicationError(
    `Route ${req.originalUrl} not found`,
    404,
    true,
    'NOT_FOUND'
  );
  next(error);
}

/**
 * Create specific error types for common scenarios
 */
export const createNotFoundError = (resource: string, id?: string): AppError =>
  new ApplicationError(
    id ? `${resource} with ID ${id} not found` : `${resource} not found`,
    404,
    true,
    'NOT_FOUND',
    { resource, id }
  );

export const createUnauthorizedError = (message: string = 'Unauthorized'): AppError =>
  new ApplicationError(message, 401, true, 'UNAUTHORIZED');

export const createForbiddenError = (message: string = 'Forbidden'): AppError =>
  new ApplicationError(message, 403, true, 'FORBIDDEN');

export const createValidationError = (message: string, details?: any): AppError =>
  new ApplicationError(message, 400, true, 'VALIDATION_ERROR', details);

export const createConflictError = (message: string): AppError =>
  new ApplicationError(message, 409, true, 'CONFLICT');

export const createServiceUnavailableError = (service: string): AppError =>
  new ApplicationError(
    `${service} is currently unavailable`,
    503,
    true,
    'SERVICE_UNAVAILABLE',
    { service }
  );

export const createRateLimitError = (): AppError =>
  new ApplicationError(
    'Too many requests, please try again later',
    429,
    true,
    'RATE_LIMIT_EXCEEDED'
  );
/**
 * Frontend Security Utilities
 * 
 * This file contains security utilities for the frontend application
 * including CSRF protection, input validation, and secure API calls.
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * CSRF Token Management
 */
export class CSRFManager {
  private static token: string | null = null;
  private static lastFetched: number = 0;
  private static readonly TTL = 25 * 60 * 1000; // 25 minutes

  /**
   * Get CSRF token, fetching new one if needed
   */
  static async getCSRFToken(): Promise<string | null> {
    const now = Date.now();
    
    // Check if token exists and is still valid
    if (this.token && (now - this.lastFetched) < this.TTL) {
      return this.token;
    }

    try {
      const response = await fetch('/api/auth/csrf-token', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        this.token = data.csrfToken;
        this.lastFetched = now;
        return this.token;
      }
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
    }

    return null;
  }

  /**
   * Clear CSRF token
   */
  static clearToken(): void {
    this.token = null;
    this.lastFetched = 0;
  }
}

/**
 * Secure API Client
 */
export class SecureAPIClient {
  private baseURL: string;
  private defaultHeaders: HeadersInit;

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };
  }

  /**
   * Make a secure API request with CSRF protection
   */
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = { ...this.defaultHeaders, ...options.headers };

    // Add CSRF token for state-changing requests
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method || 'GET')) {
      const csrfToken = await CSRFManager.getCSRFToken();
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
      }
    }

    // Add timestamp for request signing
    headers['X-Timestamp'] = Date.now().toString();

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * POST request with CSRF protection
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request with CSRF protection
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request with CSRF protection
   */
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request with CSRF protection
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

/**
 * Input Validation Utilities
 */
export class InputValidator {
  /**
   * Sanitize input to prevent XSS
   */
  static sanitizeInput(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate username
   */
  static validateUsername(username: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (username.length < 3) {
      errors.push('Username must be at least 3 characters long');
    }
    
    if (username.length > 50) {
      errors.push('Username cannot exceed 50 characters');
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.push('Username can only contain letters, numbers, and underscores');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * Security Headers Middleware for Next.js API routes
 */
export function withSecurityHeaders(handler: Function) {
  return async function secureHandler(req: NextRequest, ...args: any[]) {
    const response = await handler(req, ...args);

    // Add security headers
    const headers = new Headers(response.headers);
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('X-Frame-Options', 'DENY');
    headers.set('X-XSS-Protection', '1; mode=block');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    headers.set('X-Permitted-Cross-Domain-Policies', 'none');

    return new NextResponse(response.body, {
      status: response.status,
      headers
    });
  };
}

/**
 * Rate Limiting for API routes
 */
export function withRateLimit(maxRequests: number = 100, windowMs: number = 60000) {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return function rateLimitMiddleware(handler: Function) {
    return async function limitedHandler(req: NextRequest, ...args: any[]) {
      const ip = req.ip || 'unknown';
      const now = Date.now();
      const windowStart = Math.floor(now / windowMs) * windowMs;

      const client = requests.get(ip);
      
      if (!client || client.resetTime <= now) {
        requests.set(ip, { count: 1, resetTime: windowStart + windowMs });
      } else {
        client.count++;
      }

      const current = requests.get(ip)!;
      
      if (current.count > maxRequests) {
        return new NextResponse(
          JSON.stringify({ 
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Please try again later.'
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': Math.ceil((current.resetTime - now) / 1000).toString()
            }
          }
        );
      }

      return handler(req, ...args);
    };
  };
}

/**
 * Authentication Middleware for API routes
 */
export function withAuth(handler: Function) {
  return async function authHandler(req: NextRequest, ...args: any[]) {
    // Check for authentication token
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Authentication Required',
          message: 'Please provide a valid authentication token'
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // In a real application, you would validate the token here
    // For now, we'll just check if it exists and has a minimum length
    if (token.length < 10) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Invalid Token',
          message: 'Authentication token is invalid'
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return handler(req, ...args);
  };
}

// Export default secure API client
export const apiClient = new SecureAPIClient();
import { Request, Response } from 'express';
import { authRoutes } from './auth';
import * as authService from '../services/authService';
import * as sessionService from '../services/sessionService';
import * as securityService from '../services/apiSecurityService';
import * as validationMiddleware from '../validation/middleware';

// Mock dependencies
jest.mock('../services/authService');
jest.mock('../services/sessionService');
jest.mock('../services/apiSecurityService');
jest.mock('../validation/middleware');

const mockAuthService = authService as jest.Mocked<typeof authService>;
const mockSessionService = sessionService as jest.Mocked<typeof sessionService>;
const mockSecurityService = securityService as jest.Mocked<typeof securityService>;
const mockValidationMiddleware = validationMiddleware as jest.Mocked<typeof validationMiddleware>;

describe('Auth Routes', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      headers: {},
      ip: '127.0.0.1',
      user: null,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
      redirect: jest.fn().mockReturnThis(),
      locals: {},
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
      };

      const mockUser = {
        id: '1',
        email: userData.email,
        username: userData.username,
        isVerified: false,
      };

      mockAuthService.register = jest.fn().mockResolvedValue(mockUser);
      mockValidationMiddleware.validateRegistration = jest.fn().mockReturnValue(true);

      req.body = userData;

      await authRoutes.post('/register', req as Request, res as Response, next);

      expect(mockAuthService.register).toHaveBeenCalledWith(userData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Registration successful. Please check your email for verification.',
        user: mockUser,
      });
    });

    it('should handle registration validation errors', async () => {
      req.body = { email: 'invalid-email' };

      await authRoutes.post('/register', req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        errors: expect.any(Array),
      });
    });

    it('should handle duplicate email errors', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
      };

      mockAuthService.register = jest.fn().mockRejectedValue(new Error('Email already exists'));
      req.body = userData;

      await authRoutes.post('/register', req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Email already exists',
      });
    });
  });

  describe('POST /auth/login', () => {
    it('should login user successfully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true,
      };

      const mockSession = {
        id: 'session-123',
        userId: '1',
        token: 'session-token',
        expiresAt: new Date(),
      };

      mockAuthService.login = jest.fn().mockResolvedValue(mockSession);
      mockValidationMiddleware.validateLogin = jest.fn().mockReturnValue(true);

      req.body = loginData;

      await authRoutes.post('/login', req as Request, res as Response, next);

      expect(mockAuthService.login).toHaveBeenCalledWith(loginData);
      expect(res.cookie).toHaveBeenCalledWith('sessionToken', 'session-token', expect.any(Object));
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Login successful',
        session: mockSession,
      });
    });

    it('should handle invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockAuthService.login = jest.fn().mockRejectedValue(new Error('Invalid credentials'));
      req.body = loginData;

      await authRoutes.post('/login', req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid credentials',
      });
    });

    it('should handle CSRF validation', async () => {
      mockSecurityService.validateCSRFToken = jest.fn().mockReturnValue(false);

      await authRoutes.post('/login', req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'CSRF token validation failed',
      });
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout user successfully', async () => {
      req.headers = { authorization: 'Bearer session-token' };

      await authRoutes.post('/logout', req as Request, res as Response, next);

      expect(mockSessionService.invalidateSession).toHaveBeenCalledWith('session-token');
      expect(res.clearCookie).toHaveBeenCalledWith('sessionToken');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Logout successful',
      });
    });

    it('should handle logout without session token', async () => {
      await authRoutes.post('/logout', req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'No active session',
      });
    });
  });

  describe('GET /auth/me', () => {
    it('should return current user profile', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        profile: {
          bio: 'Test bio',
          location: 'New York, NY',
        },
      };

      req.user = mockUser;

      await authRoutes.get('/me', req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        user: mockUser,
      });
    });

    it('should handle unauthenticated requests', async () => {
      req.user = null;

      await authRoutes.get('/me', req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication required',
      });
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh session token', async () => {
      const mockSession = {
        id: 'session-123',
        userId: '1',
        token: 'new-session-token',
        expiresAt: new Date(),
      };

      req.headers = { authorization: 'Bearer old-session-token' };
      mockSessionService.refreshSession = jest.fn().mockResolvedValue(mockSession);

      await authRoutes.post('/refresh', req as Request, res as Response, next);

      expect(mockSessionService.refreshSession).toHaveBeenCalledWith('old-session-token');
      expect(res.cookie).toHaveBeenCalledWith('sessionToken', 'new-session-token', expect.any(Object));
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Session refreshed',
        session: mockSession,
      });
    });

    it('should handle expired session', async () => {
      req.headers = { authorization: 'Bearer expired-token' };
      mockSessionService.refreshSession = jest.fn().mockRejectedValue(new Error('Session expired'));

      await authRoutes.post('/refresh', req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Session expired',
      });
    });
  });

  describe('POST /auth/activity', () => {
    it('should record user activity', async () => {
      req.user = { id: '1', email: 'test@example.com' };
      req.body = { action: 'profile_view', targetId: '2' };

      await authRoutes.post('/activity', req as Request, res as Response, next);

      expect(mockAuthService.recordActivity).toHaveBeenCalledWith('1', 'profile_view', '2');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Activity recorded',
      });
    });

    it('should handle activity recording errors', async () => {
      req.user = { id: '1', email: 'test@example.com' };
      req.body = { action: 'invalid_action' };
      mockAuthService.recordActivity = jest.fn().mockRejectedValue(new Error('Invalid action'));

      await authRoutes.post('/activity', req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid action',
      });
    });
  });
});
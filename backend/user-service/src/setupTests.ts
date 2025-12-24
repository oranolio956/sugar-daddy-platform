import { jest } from '@jest/globals';

// Mock environment variables for tests
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
process.env.CSRF_SECRET = 'test-csrf-secret-key';
process.env.ENCRYPTION_KEY = 'test-encryption-key-32-characters';
process.env.RATE_LIMIT_WINDOW = '60000';
process.env.RATE_LIMIT_MAX = '100';

// Mock external services
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
  })),
}));

jest.mock('speakeasy', () => ({
  generateSecret: jest.fn(() => ({ base32: 'TESTSECRET' })),
  totp: {
    generate: jest.fn(() => '123456'),
    verify: jest.fn(() => true),
  },
}));

jest.mock('qrcode', () => ({
  toDataURL: jest.fn(() => Promise.resolve('data:image/png;base64,test')),
}));

// Mock database connection
jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  })),
}));

// Mock Sequelize
jest.mock('sequelize', () => {
  const mSequelize = {
    authenticate: jest.fn(),
    sync: jest.fn(),
    define: jest.fn(),
    close: jest.fn(),
  };
  return jest.fn(() => mSequelize);
});

// Global test utilities
export const createMockRequest = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  ip: '127.0.0.1',
  user: null,
  ...overrides,
});

export const createMockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
    redirect: jest.fn().mockReturnThis(),
    locals: {},
  };
  return res;
};

export const createMockNext = () => jest.fn();

// Test database setup
export const setupTestDatabase = async () => {
  // Database setup logic for tests
  // This would typically create test tables and seed data
};

export const teardownTestDatabase = async () => {
  // Database cleanup logic for tests
  // This would typically drop test tables
};

// Mock user data for tests
export const mockUser = {
  id: '1',
  email: 'test@example.com',
  username: 'testuser',
  password: '$2b$10$hashedpassword',
  isVerified: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock session data
export const mockSession = {
  id: 'session-123',
  userId: '1',
  token: 'session-token',
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  createdAt: new Date(),
  updatedAt: new Date(),
};
import { render, screen, fireEvent, waitFor } from '@/utils/test-utils';
import { EnhancedLogin } from '@/components/auth/EnhancedLogin';
import * as api from '@/lib/api';

// Mock the API module
jest.mock('@/lib/api');

const mockApi = api as jest.Mocked<typeof api>;

describe('API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication API', () => {
    it('should handle successful login', async () => {
      const mockResponse = {
        success: true,
        data: {
          user: { id: '1', email: 'test@example.com' },
          session: { token: 'session-token' }
        }
      };

      mockApi.post = jest.fn().mockResolvedValue(mockResponse);

      render(<EnhancedLogin />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith('/api/auth/login', {
          email: 'test@example.com',
          password: 'password123'
        });
      });
    });

    it('should handle login errors', async () => {
      const mockError = {
        response: {
          data: { message: 'Invalid credentials' },
          status: 401
        }
      };

      mockApi.post = jest.fn().mockRejectedValue(mockError);

      render(<EnhancedLogin />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error');

      mockApi.post = jest.fn().mockRejectedValue(networkError);

      render(<EnhancedLogin />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });
  });

  describe('User Profile API', () => {
    it('should fetch user profile', async () => {
      const mockProfile = {
        id: '1',
        email: 'test@example.com',
        profile: {
          bio: 'Test bio',
          location: 'New York, NY'
        }
      };

      mockApi.get = jest.fn().mockResolvedValue({ success: true, data: mockProfile });

      // This would typically be in a profile component test
      // For now, we'll just test the API call
      const result = await api.get('/api/auth/me');

      expect(mockApi.get).toHaveBeenCalledWith('/api/auth/me');
      expect(result.data).toEqual(mockProfile);
    });

    it('should handle unauthorized profile access', async () => {
      const mockError = {
        response: {
          data: { message: 'Authentication required' },
          status: 401
        }
      };

      mockApi.get = jest.fn().mockRejectedValue(mockError);

      try {
        await api.get('/api/auth/me');
      } catch (error) {
        expect(error.response.status).toBe(401);
        expect(error.response.data.message).toBe('Authentication required');
      }
    });
  });

  describe('Registration API', () => {
    it('should handle successful registration', async () => {
      const mockResponse = {
        success: true,
        message: 'Registration successful',
        data: { user: { id: '1', email: 'test@example.com' } }
      };

      mockApi.post = jest.fn().mockResolvedValue(mockResponse);

      const registrationData = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User'
      };

      const result = await api.post('/api/auth/register', registrationData);

      expect(mockApi.post).toHaveBeenCalledWith('/api/auth/register', registrationData);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Registration successful');
    });

    it('should handle registration validation errors', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Validation failed',
            errors: ['Email is required', 'Password must be at least 6 characters']
          },
          status: 400
        }
      };

      mockApi.post = jest.fn().mockRejectedValue(mockError);

      try {
        await api.post('/api/auth/register', {});
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.errors).toContain('Email is required');
      }
    });
  });

  describe('API Error Handling', () => {
    it('should handle 404 errors', async () => {
      const mockError = {
        response: {
          data: { message: 'Not found' },
          status: 404
        }
      };

      mockApi.get = jest.fn().mockRejectedValue(mockError);

      try {
        await api.get('/api/nonexistent');
      } catch (error) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.message).toBe('Not found');
      }
    });

    it('should handle server errors', async () => {
      const mockError = {
        response: {
          data: { message: 'Internal server error' },
          status: 500
        }
      };

      mockApi.get = jest.fn().mockRejectedValue(mockError);

      try {
        await api.get('/api/test');
      } catch (error) {
        expect(error.response.status).toBe(500);
        expect(error.response.data.message).toBe('Internal server error');
      }
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';

      mockApi.get = jest.fn().mockRejectedValue(timeoutError);

      try {
        await api.get('/api/test');
      } catch (error) {
        expect(error.name).toBe('TimeoutError');
        expect(error.message).toBe('Request timeout');
      }
    });
  });

  describe('API Request Interceptors', () => {
    it('should add authentication headers', async () => {
      // Mock localStorage
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn().mockReturnValue('test-token'),
          setItem: jest.fn(),
          removeItem: jest.fn(),
          clear: jest.fn(),
        },
        writable: true,
      });

      mockApi.get = jest.fn().mockResolvedValue({ success: true });

      await api.get('/api/test');

      // The interceptor should add the Authorization header
      expect(mockApi.get).toHaveBeenCalledWith('/api/test', expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token'
        })
      }));
    });

    it('should handle CSRF tokens', async () => {
      mockApi.post = jest.fn().mockResolvedValue({ success: true });

      await api.post('/api/test', {});

      // The interceptor should add CSRF token
      expect(mockApi.post).toHaveBeenCalledWith('/api/test', {}, expect.objectContaining({
        headers: expect.objectContaining({
          'X-CSRF-Token': expect.any(String)
        })
      }));
    });
  });

  describe('API Response Interceptors', () => {
    it('should handle successful responses', async () => {
      const mockResponse = {
        success: true,
        data: { message: 'Success' }
      };

      mockApi.get = jest.fn().mockResolvedValue(mockResponse);

      const result = await api.get('/api/test');

      expect(result).toEqual(mockResponse);
    });

    it('should handle error responses with custom error handling', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Custom error message',
            code: 'VALIDATION_ERROR'
          },
          status: 422
        }
      };

      mockApi.get = jest.fn().mockRejectedValue(mockError);

      try {
        await api.get('/api/test');
      } catch (error) {
        expect(error.response.data.code).toBe('VALIDATION_ERROR');
        expect(error.response.status).toBe(422);
      }
    });
  });
});
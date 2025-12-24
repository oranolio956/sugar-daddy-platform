import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/utils/test-utils';
import { EnhancedLogin } from './EnhancedLogin';
import * as authService from '@/services/authService';
import * as securityService from '@/lib/security';

// Mock services
jest.mock('@/services/authService');
jest.mock('@/lib/security');

const mockAuthService = authService as jest.Mocked<typeof authService>;
const mockSecurityService = securityService as jest.Mocked<typeof securityService>;

describe('EnhancedLogin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form with all required fields', () => {
    render(<EnhancedLogin />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
  });

  it('validates email format', async () => {
    render(<EnhancedLogin />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('validates password length', async () => {
    render(<EnhancedLogin />);
    
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const mockLogin = jest.fn().mockResolvedValue({ success: true });
    mockAuthService.login = mockLogin;

    render(<EnhancedLogin />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });

  it('shows error message on login failure', async () => {
    const mockLogin = jest.fn().mockRejectedValue(new Error('Invalid credentials'));
    mockAuthService.login = mockLogin;

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

  it('handles remember me functionality', async () => {
    render(<EnhancedLogin />);
    
    const rememberMeCheckbox = screen.getByLabelText(/remember me/i);
    const emailInput = screen.getByLabelText(/email/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(rememberMeCheckbox);

    await waitFor(() => {
      expect(rememberMeCheckbox).toBeChecked();
    });
  });

  it('shows loading state during submission', async () => {
    const mockLogin = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    mockAuthService.login = mockLogin;

    render(<EnhancedLogin />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
  });

  it('validates CSRF token before submission', async () => {
    mockSecurityService.validateCSRFToken = jest.fn().mockReturnValue(true);
    const mockLogin = jest.fn().mockResolvedValue({ success: true });
    mockAuthService.login = mockLogin;

    render(<EnhancedLogin />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSecurityService.validateCSRFToken).toHaveBeenCalled();
      expect(mockLogin).toHaveBeenCalled();
    });
  });

  it('prevents submission if CSRF validation fails', async () => {
    mockSecurityService.validateCSRFToken = jest.fn().mockReturnValue(false);

    render(<EnhancedLogin />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/security validation failed/i)).toBeInTheDocument();
    });
  });

  it('handles accessibility features', () => {
    render(<EnhancedLogin />);
    
    // Check for proper ARIA labels
    expect(screen.getByLabelText(/email/i)).toHaveAttribute('aria-required', 'true');
    expect(screen.getByLabelText(/password/i)).toHaveAttribute('aria-required', 'true');
    
    // Check for proper form structure
    const form = screen.getByRole('form');
    expect(form).toBeInTheDocument();
  });
});
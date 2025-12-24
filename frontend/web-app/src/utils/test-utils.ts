import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { AccessibilityProvider } from '@/contexts/AccessibilityContext';
import { ToastProvider } from '@/components/ui/Toast';
import { BrowserRouter } from 'react-router-dom';

// Create a custom render function that includes all providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
      mutations: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AccessibilityProvider>
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </AccessibilityProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Mock data generators for tests
export const createMockUser = (overrides = {}) => ({
  id: '1',
  email: 'test@example.com',
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  role: 'user',
  isVerified: false,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockProfile = (overrides = {}) => ({
  id: '1',
  userId: '1',
  bio: 'Test bio',
  location: 'New York, NY',
  age: 25,
  gender: 'male',
  interests: ['coding', 'gaming'],
  preferences: {
    ageRange: { min: 21, max: 35 },
    locationRadius: 50,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

// Common test utilities
export const waitForLoadingToFinish = () =>
  new Promise(resolve => setTimeout(resolve, 0));

// Mock functions
export const mockApiResponse = <T>(data: T, delay = 0) =>
  new Promise<T>(resolve => setTimeout(() => resolve(data), delay));

export const mockApiError = (message = 'Test error', status = 500) =>
  Promise.reject({
    response: {
      data: { message },
      status,
    },
  });

// Accessibility testing utilities
export const getA11yViolations = async (container: HTMLElement) => {
  const { axe } = await import('jest-axe');
  return axe(container);
};

// Form testing utilities
export const fillForm = async (user: any, fields: Record<string, string>) => {
  const { fireEvent } = await import('@testing-library/react');
  
  for (const [name, value] of Object.entries(fields)) {
    const input = container.querySelector(`[name="${name}"]`);
    if (input) {
      await user.clear(input);
      await user.type(input, value);
    }
  }
};
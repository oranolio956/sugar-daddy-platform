'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  username: string;
  role: 'sugar_daddy' | 'sugar_baby' | 'admin';
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  subscription: {
    tier: 'free' | 'premium' | 'elite' | 'vip';
    status: 'active' | 'inactive' | 'cancelled' | 'past_due';
    expiresAt?: string;
    features: string[];
  };
  profile: {
    firstName: string;
    lastName: string;
    age: number;
    location: string;
    bio?: string;
    profileImage?: string;
    coverImage?: string;
    verified: boolean;
    verificationLevel: 'none' | 'basic' | 'premium' | 'elite';
    socialLinks?: {
      linkedin?: string;
      instagram?: string;
      twitter?: string;
    };
    portfolio?: {
      occupation: string;
      company?: string;
      education?: string;
      netWorth?: string;
      monthlyBudget?: string;
    };
  };
  preferences: {
    lookingFor: 'sugar_daddy' | 'sugar_baby';
    ageRange: [number, number];
    location: string;
    distance: number;
    budget?: {
      min: number;
      max: number;
    };
    interests: string[];
    dealBreakers: string[];
  };
  settings: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    profileVisibility: 'public' | 'private' | 'verified_only';
    showOnlineStatus: boolean;
    showLastSeen: boolean;
    allowMessages: 'everyone' | 'verified' | 'premium' | 'none';
    marketingEmails: boolean;
    language: string;
    timezone: string;
  };
  stats: {
    profileViews: number;
    likesReceived: number;
    messagesSent: number;
    matchesCount: number;
    responseRate: number;
  };
  security: {
    lastPasswordChange: string;
    loginAttempts: number;
    lockedUntil?: string;
    trustedDevices: DeviceInfo[];
  };
  createdAt: string;
  lastLoginAt: string;
  lastActivityAt: string;
}

interface DeviceInfo {
  id: string;
  name: string;
  type: string;
  browser: string;
  location: string;
  lastUsed: string;
  trusted: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isPremium: boolean;
  isElite: boolean;
  isVerified: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  socialLogin: (provider: 'google' | 'apple' | 'linkedin') => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: (allDevices?: boolean) => void;
  updateUser: (userData: Partial<User>) => void;
  refreshToken: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  enable2FA: (method: 'app' | 'sms') => Promise<{ secret: string; qrCode?: string }>;
  verify2FA: (code: string) => Promise<void>;
  disable2FA: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmPasswordReset: (token: string, newPassword: string) => Promise<void>;
  updateSubscription: (tier: string) => Promise<void>;
  getTrustedDevices: () => Promise<DeviceInfo[]>;
  removeTrustedDevice: (deviceId: string) => Promise<void>;
  hasFeature: (feature: string) => boolean;
}

interface RegisterData {
  email: string;
  password: string;
  username: string;
  role: 'sugar_daddy' | 'sugar_baby';
  profile: {
    firstName: string;
    lastName: string;
    age: number;
    location: string;
  };
  preferences?: {
    lookingFor: 'sugar_daddy' | 'sugar_baby';
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Computed properties for premium features
  const isPremium = user?.subscription.tier === 'premium' || user?.subscription.tier === 'elite' || user?.subscription.tier === 'vip';
  const isElite = user?.subscription.tier === 'elite' || user?.subscription.tier === 'vip';
  const isVerified = user?.profile.verificationLevel !== 'none';

  const updateLastActivity = async () => {
    if (!user) return;

    try {
      await fetch('/api/auth/activity', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      // Silent fail for activity updates
    }
  };

  const refreshTokenFunc = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return false;

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('auth_token', data.token);
        if (data.refreshToken) {
          localStorage.setItem('refresh_token', data.refreshToken);
        }
        setUser(data.user);
        return true;
      } else {
        logout();
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return false;
    }
  };

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const refreshToken = localStorage.getItem('refresh_token');

        if (token) {
          // Verify token and get user data
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);

            // Update last activity
            updateLastActivity();
          } else if (refreshToken && response.status === 401) {
            // Try to refresh token
            await refreshTokenFunc();
          } else {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Set up activity tracking
    const activityInterval = setInterval(updateLastActivity, 60000); // Every minute

    return () => clearInterval(activityInterval);
  }, []);

  const login = async (email: string, password: string, rememberMe = false) => {
    try {
      setLoading(true);
      const deviceInfo = {
        name: navigator.userAgent,
        type: /Mobile|Android|iP(hone|od|ad)/.test(navigator.userAgent) ? 'mobile' : 'desktop',
        browser: getBrowserName(),
        location: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          rememberMe,
          deviceInfo
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid credentials');
      }

      const data = await response.json();

      // Store tokens
      localStorage.setItem('auth_token', data.token);
      if (data.refreshToken) {
        localStorage.setItem('refresh_token', data.refreshToken);
      }

      setUser(data.user);

      // Check if 2FA is required
      if (data.requires2FA) {
        router.push('/auth/2fa');
        toast.info('Please complete two-factor authentication');
        return;
      }

      // Check if email verification is required
      if (!data.user.emailVerified) {
        router.push('/auth/verify-email');
        toast.info('Please verify your email address');
        return;
      }

      toast.success(`Welcome back, ${data.user.profile.firstName}!`);
      router.push('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const socialLogin = async (provider: 'google' | 'apple' | 'linkedin') => {
    try {
      setLoading(true);

      // Redirect to OAuth provider
      const response = await fetch(`/api/auth/social/${provider}`, {
        method: 'GET',
      });

      if (response.ok) {
        const { authUrl } = await response.json();
        window.location.href = authUrl;
      } else {
        throw new Error('Social login failed');
      }
    } catch (error) {
      toast.error('Social login failed');
      setLoading(false);
      throw error;
    }
  };

  const getBrowserName = () => {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  };

  const register = async (userData: RegisterData) => {
    try {
      setLoading(true);
      const deviceInfo = {
        name: navigator.userAgent,
        type: /Mobile|Android|iP(hone|od|ad)/.test(navigator.userAgent) ? 'mobile' : 'desktop',
        browser: getBrowserName(),
        location: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userData,
          deviceInfo,
          subscription: {
            tier: 'free',
            status: 'active',
            features: ['basic_profile', 'basic_matching', 'limited_messages']
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();

      // Store tokens
      localStorage.setItem('auth_token', data.token);
      if (data.refreshToken) {
        localStorage.setItem('refresh_token', data.refreshToken);
      }

      setUser(data.user);

      toast.success('Account created successfully! Please check your email to verify your account.');
      router.push('/auth/verify-email');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = (allDevices = false) => {
    const token = localStorage.getItem('auth_token');

    if (allDevices && token) {
      // Logout from all devices
      fetch('/api/auth/logout-all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }).catch(() => {}); // Silent fail
    }

    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    router.push('/');
    toast.success('Logged out successfully');
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prevUser => prevUser ? { ...prevUser, ...userData } : null);
  };

  const refreshToken = async () => {
    return await refreshTokenFunc();
  };

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error('Email verification failed');
      }

      const data = await response.json();
      setUser(data.user);
      toast.success('Email verified successfully!');
      router.push('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Verification failed');
      throw error;
    }
  };

  const resendVerification = async () => {
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to resend verification email');
      }

      toast.success('Verification email sent!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to resend email');
      throw error;
    }
  };

  const enable2FA = async (method: 'app' | 'sms') => {
    try {
      const response = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ method }),
      });

      if (!response.ok) {
        throw new Error('Failed to enable 2FA');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to enable 2FA');
      throw error;
    }
  };

  const verify2FA = async (code: string) => {
    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error('Invalid 2FA code');
      }

      const data = await response.json();
      setUser(data.user);
      toast.success('Two-factor authentication enabled!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Verification failed');
      throw error;
    }
  };

  const disable2FA = async () => {
    try {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to disable 2FA');
      }

      const data = await response.json();
      setUser(data.user);
      toast.success('Two-factor authentication disabled');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to disable 2FA');
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Password change failed');
      }

      toast.success('Password changed successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Password change failed');
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Password reset failed');
      }

      toast.success('Password reset email sent!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Password reset failed');
      throw error;
    }
  };

  const confirmPasswordReset = async (token: string, newPassword: string) => {
    try {
      const response = await fetch('/api/auth/reset-password/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        throw new Error('Password reset failed');
      }

      toast.success('Password reset successfully!');
      router.push('/login');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Password reset failed');
      throw error;
    }
  };

  const updateSubscription = async (tier: string) => {
    try {
      const response = await fetch('/api/auth/subscription', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier }),
      });

      if (!response.ok) {
        throw new Error('Subscription update failed');
      }

      const data = await response.json();
      setUser(data.user);
      toast.success('Subscription updated successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Subscription update failed');
      throw error;
    }
  };

  const getTrustedDevices = async (): Promise<DeviceInfo[]> => {
    try {
      const response = await fetch('/api/auth/devices', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch devices');
      }

      return await response.json();
    } catch (error) {
      toast.error('Failed to fetch trusted devices');
      throw error;
    }
  };

  const removeTrustedDevice = async (deviceId: string) => {
    try {
      const response = await fetch(`/api/auth/devices/${deviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to remove device');
      }

      toast.success('Device removed successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove device');
      throw error;
    }
  };

  const hasFeature = (feature: string): boolean => {
    if (!user) return false;
    return user.subscription.features.includes(feature);
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    isPremium,
    isElite,
    isVerified,
    login,
    socialLogin,
    register,
    logout,
    updateUser,
    refreshToken,
    verifyEmail,
    resendVerification,
    enable2FA,
    verify2FA,
    disable2FA,
    changePassword,
    resetPassword,
    confirmPasswordReset,
    updateSubscription,
    getTrustedDevices,
    removeTrustedDevice,
    hasFeature,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
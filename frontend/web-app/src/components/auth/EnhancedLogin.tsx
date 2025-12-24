'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { useToast } from '../ui/Toast';
import { useTooltip } from '../ui/Tooltip';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Loading } from '../ui/Loading';
import { useSEO } from '../../components/seo/SEOProvider';
import { LazyFramerMotion, LazyLucideIcons } from '../../lib/lazyLoad';
import { usePerformanceMonitor } from '../../lib/performance';
import { useFormValidation } from '../../hooks/useFormValidation';
import { validationRules } from '../../hooks/useFormValidation';

const { motion } = LazyFramerMotion;
const { Eye, EyeOff, User, Lock, AlertCircle } = LazyLucideIcons;

interface EnhancedLoginProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function EnhancedLogin({ onSuccess, onError }: EnhancedLoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const router = useRouter();
  const { login } = useAuth();
  const { updateMeta } = useSEO();
  const { startMonitoring } = usePerformanceMonitor();
  const { toast } = useToast();
  const { showTooltip, hideTooltip } = useTooltip();
  const { announce } = useAccessibility();

  // Form validation
  const {
    formState,
    isSubmitting,
    updateField,
    handleBlur,
    validateAll,
    getFieldProps,
    getValues,
  } = useFormValidation(
    { email: '', password: '' },
    {
      email: validationRules.email,
      password: validationRules.password,
    },
    {
      validateOnChange: true,
      validateOnBlur: true,
      showErrors: true,
      debounceMs: 300,
    }
  );

  // Update SEO meta tags
  useEffect(() => {
    updateMeta({
      title: 'Login to Dandy Babe - Premium Sugar Daddy Dating',
      description: 'Sign in to your BrandyBabe.com account to connect with successful sugar daddies and sugar babies. Safe, discreet, and premium dating experience.',
      keywords: ['login', 'sugar daddy login', 'sugar baby login', 'dating site login'],
      type: 'website',
    });

    // Start performance monitoring
    startMonitoring();

    // Monitor online status
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Connection restored",
        description: "You are now online.",
        variant: "success",
      });
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Connection lost",
        description: "You are now offline. Some features may not work.",
        variant: "warning",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [updateMeta, startMonitoring, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isOnline) {
      toast({
        title: "No internet connection",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
      return;
    }

    // Validate form
    if (!validateAll()) {
      toast({
        title: "Please fix validation errors",
        description: "Check the form for errors before submitting.",
        variant: "warning",
      });
      return;
    }

    try {
      const values = getValues();
      const result = await login(values.email, values.password, rememberMe);
      
      if (result.success) {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
          variant: "success",
        });
        onSuccess?.();
        router.push('/dashboard');
      } else {
        toast({
          title: "Login failed",
          description: result.error || "Please check your credentials.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Login error:', err);
      toast({
        title: "Unexpected error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
      onError?.('Login failed');
    }
  };

  const handleFieldFocus = (field: string) => {
    const helpTexts: { [key: string]: string } = {
      email: "Enter your registered email address",
      password: "Enter your password (minimum 8 characters)",
    };
    showTooltip(`login-${field}`, helpTexts[field], { position: 'top' });
  };

  const handleFieldBlur = (field: string) => {
    hideTooltip(`login-${field}`);
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  const handleRegister = () => {
    router.push('/register');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center"
          >
            <User className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your premium dating experience</p>
        </div>

        {/* Connection Status */}
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6"
          >
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>You're offline. Please check your internet connection.</span>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
          >
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                disabled={!isOnline}
                aria-describedby={formState.email.error ? "email-error" : undefined}
                aria-invalid={formState.email.error ? "true" : "false"}
                onFocus={() => handleFieldFocus('email')}
                onBlur={() => handleFieldBlur('email')}
                {...getFieldProps('email')}
              />
              {formState.email.error && (
                <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
                  {formState.email.error}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                disabled={!isOnline}
                aria-describedby={formState.password.error ? "password-error" : undefined}
                aria-invalid={formState.password.error ? "true" : "false"}
                onFocus={() => handleFieldFocus('password')}
                onBlur={() => handleFieldBlur('password')}
                {...getFieldProps('password')}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
                disabled={!isOnline}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
              {formState.password.error && (
                <p id="password-error" className="mt-1 text-sm text-red-600" role="alert">
                  {formState.password.error}
                </p>
              )}
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mr-2"
                disabled={!isOnline}
                aria-label="Remember my login details"
              />
              <span className="text-sm text-gray-600">Remember me</span>
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-purple-600 hover:text-purple-800 font-medium"
              disabled={!isOnline}
              aria-label="Reset your password"
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            disabled={isSubmitting || !isOnline}
            aria-label="Sign in to your account"
          >
            {isSubmitting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto"
              />
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or</span>
            </div>
          </div>
        </div>

        {/* Register Link */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Don't have an account?{' '}
            <button
              onClick={handleRegister}
              className="text-purple-600 hover:text-purple-800 font-semibold"
              disabled={!isOnline}
            >
              Join Dandy Babe
            </button>
          </p>
          
          {/* Security Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg"
          >
            🔒 Your privacy and security are our top priorities. All connections are encrypted.
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
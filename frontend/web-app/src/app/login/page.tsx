'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Eye, EyeOff, Mail, Lock, Sparkles, Heart, Shield, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
    } catch (error) {
      // Error is handled in the auth context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Premium Branding & Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-luxury-black via-luxury-charcoal to-luxury-slate overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-pattern-dots opacity-20"></div>
        
        {/* Gradient Overlays */}
        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-primary-500/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-accent-500/20 to-transparent"></div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div>
            <a href="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-display font-bold text-gradient-gold">LuxeMatch</span>
            </a>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl xl:text-5xl font-display font-bold text-white leading-tight mb-4">
                Welcome Back to
                <span className="block text-gradient-gold">Luxury Dating</span>
              </h1>
              <p className="text-xl text-neutral-300 max-w-md">
                Your exclusive connections are waiting. Sign in to continue your journey.
              </p>
            </div>

            {/* Social Proof */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 border-2 border-luxury-charcoal"></div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 border-2 border-luxury-charcoal"></div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-300 to-primary-500 border-2 border-luxury-charcoal"></div>
                  <div className="w-10 h-10 rounded-full bg-luxury-slate border-2 border-luxury-charcoal flex items-center justify-center text-xs text-primary-400 font-medium">
                    +5K
                  </div>
                </div>
                <p className="text-neutral-400 text-sm">
                  Join <span className="text-primary-400 font-medium">5,000+</span> members online now
                </p>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary-400" />
                  <span className="text-sm text-neutral-400">Verified Profiles</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary-400" />
                  <span className="text-sm text-neutral-400">100% Secure</span>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial */}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                    Forgot your password?
                  </a>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button variant="outline" type="button">
                  Google
                </Button>
                <Button variant="outline" type="button">
                  Apple
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <a href="/register" className="font-medium text-primary-600 hover:text-primary-500">
                  Sign up
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
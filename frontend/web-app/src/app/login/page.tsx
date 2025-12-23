'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Eye, EyeOff, Mail, Lock, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();

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

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-charcoal-900">
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 100, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-champagne-500/10 blur-[120px]"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -80, 0],
            y: [0, 100, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-champagne-600/10 blur-[150px]"
        />
      </div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 w-full max-w-md px-6"
      >
        {/* Logo */}
        <motion.div variants={itemVariants} className="flex justify-center mb-12">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-charcoal-800 border border-champagne-500/20 flex items-center justify-center transition-all duration-500 group-hover:border-champagne-500/50 group-hover:shadow-[0_0_20px_rgba(247,231,206,0.2)]">
              <Heart className="w-6 h-6 text-champagne-500" />
            </div>
            <span className="text-3xl font-serif font-bold tracking-tight text-champagne-500">LuxeMatch</span>
          </Link>
        </motion.div>

        {/* Login Card */}
        <div className="bg-charcoal-800/60 backdrop-blur-xl rounded-[2rem] p-8 md:p-10 border border-white/5 shadow-ambient">
          <motion.div variants={itemVariants} className="text-center mb-10">
            <h1 className="text-display-sm font-serif text-champagne-50 mb-3">Welcome Back</h1>
            <p className="text-charcoal-400">Enter your credentials to access your sanctuary.</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div variants={itemVariants} className="space-y-2">
              <Label htmlFor="email" className="text-champagne-200/70 ml-1">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-500 transition-colors group-focus-within:text-champagne-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-12 bg-charcoal-900/50 border-white/5 focus:border-champagne-500/50"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <Label htmlFor="password" university-className="text-champagne-200/70">Password</Label>
                <Link href="/forgot-password" university-className="text-xs text-champagne-500/60 hover:text-champagne-500 transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-500 transition-colors group-focus-within:text-champagne-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-12 pr-12 bg-charcoal-900/50 border-white/5 focus:border-champagne-500/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-500 hover:text-champagne-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-4">
              <Button 
                type="submit" 
                variant="primary" 
                className="w-full h-14 text-base tracking-widest uppercase font-medium"
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </Button>
            </motion.div>
          </form>

          <motion.div variants={itemVariants} className="mt-10 text-center">
            <p className="text-charcoal-400 text-sm">
              New to the circle?{' '}
              <Link href="/register" className="text-champagne-500 hover:text-champagne-400 font-medium transition-colors">
                Request Membership
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

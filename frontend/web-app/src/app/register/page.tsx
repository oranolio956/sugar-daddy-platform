'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Eye, EyeOff, Mail, User, MapPin, Calendar, Heart, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    firstName: '',
    lastName: '',
    age: '',
    location: '',
    role: 'sugar_baby' as 'sugar_daddy' | 'sugar_baby',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!formData.age || parseInt(formData.age) < 18) {
      alert('You must be at least 18 years old');
      setLoading(false);
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        username: formData.username,
        role: formData.role,
        profile: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          age: parseInt(formData.age),
          location: formData.location,
        },
      });
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
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-charcoal-900 py-20">
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -100, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-champagne-600/10 blur-[150px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 120, 0],
            y: [0, -80, 0]
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[10%] -left-[10%] w-[45%] h-[45%] rounded-full bg-champagne-500/10 blur-[130px]"
        />
      </div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 w-full max-w-2xl px-6"
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

        {/* Register Card */}
        <div className="bg-charcoal-800/60 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 border border-white/5 shadow-ambient">
          <motion.div variants={itemVariants} className="text-center mb-10">
            <h1 className="text-display-sm font-serif text-champagne-50 mb-3">Create Your Account</h1>
            <p className="text-charcoal-400">Join the most exclusive community of refined individuals.</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="email" className="text-champagne-200/70 ml-1">Email Address</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-500 transition-colors group-focus-within:text-champagne-500" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="pl-12 bg-charcoal-900/50 border-white/5 focus:border-champagne-500/50"
                  />
                </div>
              </motion.div>

              {/* Username */}
              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="username" className="text-champagne-200/70 ml-1">Username</Label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-500 transition-colors group-focus-within:text-champagne-500" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="luxury_soul"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="pl-12 bg-charcoal-900/50 border-white/5 focus:border-champagne-500/50"
                  />
                </div>
              </motion.div>

              {/* Password */}
              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="password" className="text-champagne-200/70 ml-1">Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-500 transition-colors group-focus-within:text-champagne-500" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
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

              {/* Confirm Password */}
              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-champagne-200/70 ml-1">Confirm Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-500 transition-colors group-focus-within:text-champagne-500" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="pl-12 pr-12 bg-charcoal-900/50 border-white/5 focus:border-champagne-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-500 hover:text-champagne-500 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </motion.div>

              {/* Role Selection */}
              <motion.div variants={itemVariants} className="space-y-2 md:col-span-2">
                <Label htmlFor="role" className="text-champagne-200/70 ml-1">I am a</Label>
                <select
                  id="role"
                  name="role"
                  required
                  className="w-full h-12 px-4 rounded-xl border border-white/5 bg-charcoal-900/50 text-champagne-50 focus:border-champagne-500/50 focus:outline-none transition-all appearance-none cursor-pointer"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="sugar_baby">Sugar Baby</option>
                  <option value="sugar_daddy">Sugar Daddy</option>
                </select>
              </motion.div>

              {/* Personal Info */}
              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="firstName" className="text-champagne-200/70 ml-1">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="bg-charcoal-900/50 border-white/5 focus:border-champagne-500/50"
                />
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="lastName" className="text-champagne-200/70 ml-1">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="bg-charcoal-900/50 border-white/5 focus:border-champagne-500/50"
                />
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="age" className="text-champagne-200/70 ml-1">Age</Label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-500 transition-colors group-focus-within:text-champagne-500" />
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    min="18"
                    placeholder="25"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    className="pl-12 bg-charcoal-900/50 border-white/5 focus:border-champagne-500/50"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="location" className="text-champagne-200/70 ml-1">Location</Label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-500 transition-colors group-focus-within:text-champagne-500" />
                  <Input
                    id="location"
                    name="location"
                    type="text"
                    placeholder="Beverly Hills, CA"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="pl-12 bg-charcoal-900/50 border-white/5 focus:border-champagne-500/50"
                  />
                </div>
              </motion.div>
            </div>

            <motion.div variants={itemVariants} className="pt-4">
              <Button 
                type="submit" 
                variant="primary" 
                className="w-full h-14 text-base tracking-widest uppercase font-medium"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Create Account'}
              </Button>
            </motion.div>
          </form>

          <motion.div variants={itemVariants} className="mt-10 text-center">
            <p className="text-charcoal-400 text-sm">
              Already a member?{' '}
              <Link href="/login" className="text-champagne-500 hover:text-champagne-400 font-medium transition-colors">
                Sign In
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

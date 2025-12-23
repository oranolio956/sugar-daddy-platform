'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Heart,
  MessageCircle,
  DollarSign,
  User,
  Calendar,
  Users,
  Shield,
  Star,
  ArrowUpRight,
  TrendingUp,
  Clock,
  ChevronRight
} from 'lucide-react';
import { usePaginatedApi } from '@/hooks/useApi';
import { matchApi, messageApi, notificationApi } from '@/lib/api';
import { ProfileCard } from '@/components/premium/ProfileCard';
import { cn } from '@/lib/utils';

interface DashboardStats {
  totalMatches: number;
  unreadMessages: number;
  accountBalance: number;
  profileCompleteness: number;
}

const springTransition = { type: "spring", stiffness: 260, damping: 20 };

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const {
    data: recentMatches,
    loading: matchesLoading,
    execute: fetchMatches
  } = usePaginatedApi(matchApi.getMatches);

  const {
    data: recentMessages,
    loading: messagesLoading,
    execute: fetchMessages
  } = usePaginatedApi(messageApi.getConversations);

  const {
    data: notifications,
    loading: notificationsLoading,
    execute: fetchNotifications
  } = usePaginatedApi(notificationApi.getNotifications);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMatches(1, 3);
      fetchMessages(1, 3);
      fetchNotifications(1, 4);
      calculateStats();
    }
  }, [isAuthenticated]);

  const calculateStats = () => {
    setStats({
      totalMatches: 12,
      unreadMessages: 3,
      accountBalance: 250.00,
      profileCompleteness: 85,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-charcoal-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="bg-charcoal-800/60 backdrop-blur-xl border-white/5">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h2 className="text-display-sm font-display text-champagne-500">Access Restricted</h2>
                <p className="text-champagne-200/60">Please sign in to access your concierge dashboard.</p>
                <Button 
                  className="w-full bg-gradient-gold text-charcoal-900 font-medium tracking-widest uppercase"
                  onClick={() => window.location.href = '/login'}
                >
                  Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Concierge Header */}
      <motion.header 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springTransition}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-display-xl font-display text-champagne-500 leading-tight">
            Welcome back, <span className="italic">{user?.profile.firstName}</span>
          </h1>
          <p className="text-body-main text-champagne-200/60 mt-2 flex items-center gap-2">
            <Star className="w-4 h-4 text-champagne-500 fill-champagne-500" />
            Your personalized concierge is ready for your next move.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs uppercase tracking-widest text-champagne-500/50 font-medium">Account Status</p>
            <p className="text-champagne-200 font-medium">Premium Member</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-gradient-gold p-0.5">
            <div className="h-full w-full rounded-full bg-charcoal-900 flex items-center justify-center overflow-hidden">
              {user?.profile.avatarUrl ? (
                <img src={user.profile.avatarUrl} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-champagne-500" />
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Bento Grid Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 auto-rows-[minmax(180px,auto)]">
        
        {/* Profile Summary Widget - Large */}
        <motion.div 
          whileHover={{ scale: 1.01 }}
          transition={springTransition}
          className="md:col-span-2 lg:col-span-2 row-span-2 bg-charcoal-800/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden group relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-champagne-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="p-8 h-full flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-champagne-500/10 rounded-2xl">
                <User className="w-6 h-6 text-champagne-500" />
              </div>
              <Badge className="bg-champagne-500/20 text-champagne-500 border-none px-3 py-1">
                {stats?.profileCompleteness}% Complete
              </Badge>
            </div>
            <h3 className="text-2xl font-display text-champagne-200 mb-2">Profile Strength</h3>
            <p className="text-sm text-champagne-200/60 mb-8">Your profile is performing better than 85% of members in your area.</p>
            
            <div className="mt-auto space-y-4">
              <div className="w-full bg-charcoal-900 rounded-full h-1.5 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats?.profileCompleteness}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="bg-gradient-gold h-full"
                />
              </div>
              <Button 
                variant="outline" 
                className="w-full border-champagne-500/20 text-champagne-500 hover:bg-champagne-500/10 rounded-xl group"
                onClick={() => window.location.href = '/profile'}
              >
                Optimize Profile
                <ArrowUpRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid - Small Widgets */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="md:col-span-1 lg:col-span-1 bg-charcoal-800/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex flex-col justify-between group"
        >
          <div className="flex justify-between items-start">
            <div className="p-2 bg-pink-500/10 rounded-xl">
              <Heart className="w-5 h-5 text-pink-500" />
            </div>
            <TrendingUp className="w-4 h-4 text-success-500" />
          </div>
          <div>
            <p className="text-3xl font-display text-champagne-200">{stats?.totalMatches || 0}</p>
            <p className="text-xs uppercase tracking-widest text-champagne-200/40 font-medium mt-1">Total Matches</p>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="md:col-span-1 lg:col-span-1 bg-charcoal-800/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex flex-col justify-between group"
        >
          <div className="flex justify-between items-start">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <MessageCircle className="w-5 h-5 text-blue-500" />
            </div>
            {stats?.unreadMessages && stats.unreadMessages > 0 && (
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
            )}
          </div>
          <div>
            <p className="text-3xl font-display text-champagne-200">{stats?.unreadMessages || 0}</p>
            <p className="text-xs uppercase tracking-widest text-champagne-200/40 font-medium mt-1">Unread</p>
          </div>
        </motion.div>

        {/* Recent Activity - Medium */}
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="md:col-span-2 lg:col-span-2 row-span-2 bg-charcoal-800/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-display text-champagne-200">Recent Activity</h3>
            <Clock className="w-5 h-5 text-champagne-500/40" />
          </div>
          <div className="space-y-6 flex-1">
            {notificationsLoading ? (
              [1, 2, 3].map(i => <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />)
            ) : (
              notifications?.map((n, i) => (
                <div key={i} className="flex gap-4 group cursor-default">
                  <div className="mt-1 h-2 w-2 rounded-full bg-champagne-500 shrink-0" />
                  <div>
                    <p className="text-sm text-champagne-200 font-medium group-hover:text-champagne-500 transition-colors">{n.title}</p>
                    <p className="text-xs text-champagne-200/40 mt-0.5">{new Date(n.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <Button variant="link" className="text-champagne-500 p-0 h-auto mt-6 justify-start hover:no-underline group">
            View all activity <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        {/* Balance Widget - Small */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="md:col-span-2 lg:col-span-2 bg-gradient-gold rounded-3xl p-6 flex items-center justify-between group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-widest text-charcoal-900/60 font-bold">Available Balance</p>
            <p className="text-4xl font-display text-charcoal-900 mt-1">${stats?.accountBalance.toFixed(2)}</p>
          </div>
          <Button className="relative z-10 bg-charcoal-900 text-champagne-500 hover:bg-charcoal-800 rounded-xl px-6">
            Top Up
          </Button>
        </motion.div>

        {/* Featured Matches - Large Horizontal */}
        <motion.div 
          whileHover={{ scale: 1.005 }}
          className="md:col-span-4 lg:col-span-4 bg-charcoal-800/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-display text-champagne-200">Curated Matches</h3>
              <p className="text-sm text-champagne-200/60">Hand-picked based on your preferences</p>
            </div>
            <Button variant="outline" className="border-champagne-500/20 text-champagne-500 hover:bg-champagne-500/10 rounded-xl">
              Explore All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {matchesLoading ? (
              [1, 2, 3].map(i => <div key={i} className="aspect-[3/4] bg-white/5 rounded-2xl animate-pulse" />)
            ) : (
              recentMatches?.map((match, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -8 }}
                  transition={springTransition}
                >
                  <ProfileCard 
                    user={{
                      id: match.id,
                      name: match.user?.name || 'Elite Member',
                      age: 24, // Mock data
                      location: match.user?.location || 'London',
                      distance: 5,
                      bio: 'Sophisticated and adventurous...',
                      profilePhoto: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=400',
                      isVerified: true,
                      isPremium: i === 0,
                      isOnline: true,
                      tags: ['Travel', 'Fine Dining'],
                      hasLiked: false
                    }}
                    variant={i === 0 ? 'premium' : 'standard'}
                    showActions={false}
                    className="h-full"
                  />
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Quick Actions - Vertical */}
        <div className="md:col-span-2 lg:col-span-2 grid grid-cols-2 gap-4">
          {[
            { icon: Users, label: 'Discover', color: 'text-champagne-500', href: '/matches' },
            { icon: MessageCircle, label: 'Messages', color: 'text-blue-500', href: '/messages' },
            { icon: Shield, label: 'Security', color: 'text-success-500', href: '/settings' },
            { icon: Star, label: 'Premium', color: 'text-yellow-500', href: '/membership' },
          ].map((action, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(247, 231, 206, 0.1)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = action.href}
              className="bg-charcoal-800/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 transition-colors"
            >
              <action.icon className={cn("w-6 h-6", action.color)} />
              <span className="text-xs uppercase tracking-widest text-champagne-200/60 font-bold">{action.label}</span>
            </motion.button>
          ))}
        </div>

      </div>
    </div>
  );
}

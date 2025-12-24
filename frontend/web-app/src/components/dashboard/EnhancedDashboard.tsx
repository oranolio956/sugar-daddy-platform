'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSEO } from '../../components/seo/SEOProvider';
import { usePerformanceMonitor } from '../../lib/performance';
import { LazyFramerMotion, LazyChartJS, LazyLucideIcons } from '../../lib/lazyLoad';
import { OptimizedImage, Avatar } from '../ui/OptimizedImage';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';

const { motion, AnimatePresence } = LazyFramerMotion;
const { Users, Heart, TrendingUp, Calendar, MessageCircle, Star, Shield, Globe, DollarSign } = LazyLucideIcons;
const { Line } = LazyChartJS;

interface DashboardStats {
  totalMatches: number;
  newMessages: number;
  profileViews: number;
  weeklyActivity: number[];
}

interface RecentActivity {
  id: string;
  type: 'message' | 'like' | 'view' | 'match';
  title: string;
  description: string;
  time: string;
  avatar?: string;
}

export default function EnhancedDashboard() {
  const { user, isLoading } = useAuth();
  const { updateMeta } = useSEO();
  const { metrics } = usePerformanceMonitor();
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    updateMeta({
      title: 'Dashboard - Dandy Babe Premium Dating',
      description: 'Your personalized dashboard for managing connections, messages, and dating activity. Track your progress and find meaningful arrangements.',
      keywords: ['dashboard', 'dating dashboard', 'sugar daddy dashboard', 'sugar baby dashboard', 'matches', 'messages'],
      type: 'website',
    });

    // Monitor online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Simulate loading stats
    setTimeout(() => {
      setStats({
        totalMatches: 12,
        newMessages: 5,
        profileViews: 47,
        weeklyActivity: [12, 19, 8, 24, 15, 22, 18],
      });
    }, 1000);

    // Simulate recent activity
    setRecentActivity([
      {
        id: '1',
        type: 'message',
        title: 'New Message from Sarah',
        description: 'Hey there! I love your profile. Would love to chat more.',
        time: '2 minutes ago',
        avatar: '/avatars/sarah.jpg',
      },
      {
        id: '2',
        type: 'like',
        title: 'Someone liked your profile',
        description: 'Jessica found you interesting and sent a like.',
        time: '15 minutes ago',
        avatar: '/avatars/jessica.jpg',
      },
      {
        id: '3',
        type: 'view',
        title: 'Profile View',
        description: 'You were viewed by 3 new members today.',
        time: '1 hour ago',
      },
      {
        id: '4',
        type: 'match',
        title: 'New Match!',
        description: 'You matched with Michael. Start a conversation!',
        time: '3 hours ago',
        avatar: '/avatars/michael.jpg',
      },
    ]);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [updateMeta]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-2xl text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Sign In</h2>
          <p className="text-gray-600 mb-6">You need to be signed in to view your dashboard.</p>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar src={user.avatar} alt={user.name} size={60} />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Welcome back, {user.name}!</h1>
                <p className="text-gray-600">Your premium dating experience awaits</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="premium" className="text-sm">
                {user.subscription?.plan || 'Premium Member'}
              </Badge>
              {!isOnline && (
                <Badge variant="destructive" className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span>Offline</span>
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Stats Cards */}
          <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <Users className="h-6 w-6" />
                      <span>Total Matches</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats?.totalMatches || 0}</div>
                    <p className="text-pink-100 text-sm">Active connections</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-gradient-to-r from-blue-500 to-teal-600 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <MessageCircle className="h-6 w-6" />
                      <span>New Messages</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats?.newMessages || 0}</div>
                    <p className="text-blue-100 text-sm">Unread conversations</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <Eye className="h-6 w-6" />
                      <span>Profile Views</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats?.profileViews || 0}</div>
                    <p className="text-green-100 text-sm">This week</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Activity Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                    <span>Weekly Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats?.weeklyActivity && (
                    <div className="h-64">
                      <Line
                        data={{
                          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                          datasets: [
                            {
                              label: 'Activity',
                              data: stats.weeklyActivity,
                              borderColor: 'rgb(147 51 234)',
                              backgroundColor: 'rgba(147, 51, 234, 0.1)',
                              tension: 0.4,
                              fill: true,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: false,
                            },
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              grid: {
                                color: 'rgba(0, 0, 0, 0.1)',
                              },
                            },
                            x: {
                              grid: {
                                display: false,
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-6 w-6 text-purple-600" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <AnimatePresence>
                    {recentActivity.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        {activity.avatar ? (
                          <Avatar src={activity.avatar} size={40} />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                            {activity.type === 'message' && <MessageCircle className="h-5 w-5 text-white" />}
                            {activity.type === 'like' && <Heart className="h-5 w-5 text-white" />}
                            {activity.type === 'view' && <Eye className="h-5 w-5 text-white" />}
                            {activity.type === 'match' && <Star className="h-5 w-5 text-white" />}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 truncate">{activity.title}</p>
                          <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-6 w-6 text-purple-600" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Check Messages
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    View Matches
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Globe className="h-4 w-4 mr-2" />
                    Discover New Profiles
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Upgrade Plan
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Performance Metrics */}
            {metrics && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                      <span>Performance</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Load Time:</span>
                      <span className="font-semibold">{metrics.loadTime?.toFixed(2)}ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">FCP:</span>
                      <span className="font-semibold">{metrics.firstContentfulPaint?.toFixed(2)}ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">LCP:</span>
                      <span className="font-semibold">{metrics.largestContentfulPaint?.toFixed(2)}ms</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
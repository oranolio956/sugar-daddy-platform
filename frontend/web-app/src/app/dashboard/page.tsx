'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  Heart, 
  MessageCircle, 
  DollarSign, 
  User, 
  Calendar, 
  TrendingUp, 
  Users,
  Shield,
  Star
} from 'lucide-react';
import { useApi, usePaginatedApi } from '@/hooks/useApi';
import { matchApi, messageApi, paymentApi, notificationApi } from '@/lib/api';

interface DashboardStats {
  totalMatches: number;
  unreadMessages: number;
  accountBalance: number;
  profileCompleteness: number;
}

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // API calls for dashboard data
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
      fetchMatches(1, 5);
      fetchMessages(1, 5);
      fetchNotifications(1, 5);
      calculateStats();
    }
  }, [isAuthenticated]);

  const calculateStats = () => {
    // Mock stats calculation - in real app, this would come from API
    setStats({
      totalMatches: 12,
      unreadMessages: 3,
      accountBalance: 250.00,
      profileCompleteness: 85,
    });
  };

  const getProfileCompletenessColor = (percentage: number) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 70) return 'warning';
    return 'error';
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Please sign in</CardTitle>
              <CardDescription>
                You need to be signed in to view the dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button variant="outline" onClick={() => window.location.href = '/login'}>
                  Go to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {user?.profile.firstName}!</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
            <Heart className="h-4 w-4 text-primary-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalMatches || 0}</div>
            <p className="text-xs text-gray-600">Active connections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <MessageCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.unreadMessages || 0}</div>
            <p className="text-xs text-gray-600">New conversations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.accountBalance || 0}</div>
            <p className="text-xs text-gray-600">Available funds</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Complete</CardTitle>
            <User className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.profileCompleteness || 0}%</div>
            <Badge variant={getProfileCompletenessColor(stats?.profileCompleteness || 0)}>
              {stats?.profileCompleteness && stats.profileCompleteness >= 90 ? 'Excellent' : 
               stats?.profileCompleteness && stats.profileCompleteness >= 70 ? 'Good' : 'Needs Work'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Matches */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-primary-600" />
              <span>Recent Matches</span>
            </CardTitle>
            <CardDescription>Your latest connections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {matchesLoading ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="h-12 w-12 bg-gray-300 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                recentMatches?.map((match, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{match.user?.name || 'Unknown'}</h3>
                      <p className="text-sm text-gray-600">{match.user?.location || 'Location not set'}</p>
                    </div>
                    <Badge variant="success">Matched</Badge>
                  </div>
                ))
              )}
              <Button variant="outline" className="w-full" onClick={() => window.location.href = '/matches'}>
                View All Matches
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>What would you like to do?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/matches'}>
              <Users className="h-4 w-4 mr-2" />
              Find Matches
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/messages'}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Check Messages
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/payments'}>
              <DollarSign className="h-4 w-4 mr-2" />
              Add Funds
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/profile'}>
              <User className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/settings'}>
              <Shield className="h-4 w-4 mr-2" />
              Account Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Messages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              <span>Recent Messages</span>
            </CardTitle>
            <CardDescription>Your latest conversations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {messagesLoading ? (
                <div className="animate-pulse space-y-2">
                  {[1, 2].map(i => (
                    <div key={i} className="flex space-x-3 p-2 bg-gray-50 rounded">
                      <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
                      <div className="flex-1 space-y-1">
                        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                recentMessages?.map((message, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{message.participant?.name || 'Unknown'}</h4>
                      <p className="text-sm text-gray-600 truncate">{message.lastMessage?.content || 'No messages yet'}</p>
                    </div>
                    {message.unreadCount > 0 && (
                      <Badge variant="error" className="ml-2">{message.unreadCount}</Badge>
                    )}
                  </div>
                ))
              )}
              <Button variant="outline" className="w-full" onClick={() => window.location.href = '/messages'}>
                View All Messages
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>What's happening</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notificationsLoading ? (
                <div className="animate-pulse space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="p-3 bg-gray-50 rounded">
                      <div className="h-3 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                notifications?.map((notification, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                    <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Star className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      <p className="text-xs text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(notification.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
              <Button variant="outline" className="w-full" onClick={() => window.location.href = '/notifications'}>
                View All Activity
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
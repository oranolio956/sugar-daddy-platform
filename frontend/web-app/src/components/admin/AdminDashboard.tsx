'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { 
  Users, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Eye,
  EyeOff,
  Search,
  Filter,
  Download,
  RefreshCw,
  UserPlus,
  Ban,
  ShieldCheck,
  Clock,
  Mail,
  Smartphone
} from 'lucide-react';

interface AdminDashboardProps {
  user: any;
}

interface UserStats {
  total: number;
  verified: number;
  suspended: number;
  banned: number;
  pendingVerifications: number;
}

interface SecurityReport {
  recentLogins: any[];
  suspiciousActivity: any[];
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'verifications' | 'security' | 'reports'>('overview');
  const [users, setUsers] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [securityReport, setSecurityReport] = useState<SecurityReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    role: '',
    verified: '',
    subscriptionTier: '',
    emailVerified: '',
    search: ''
  });

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchUserStats();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'security') {
      fetchSecurityReport();
    }
  }, [activeTab]);

  const fetchUserStats = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/reports/security', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserStats(data.data);
      } else {
        setError('Failed to fetch user statistics');
      }
    } catch (err) {
      setError('An error occurred while fetching statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: '1',
        limit: '50',
        ...filters
      });

      const response = await fetch(`/api/admin/users?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data.users);
      } else {
        setError('Failed to fetch users');
      }
    } catch (err) {
      setError('An error occurred while fetching users');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSecurityReport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/reports/security', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSecurityReport(data.data);
      } else {
        setError('Failed to fetch security report');
      }
    } catch (err) {
      setError('An error occurred while fetching security report');
    } finally {
      setIsLoading(false);
    }
  };

  const suspendUser = async (userId: string, reason: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, subscription: { ...u.subscription, status: 'suspended' } } : u));
      } else {
        setError('Failed to suspend user');
      }
    } catch (err) {
      setError('An error occurred while suspending user');
    }
  };

  const banUser = async (userId: string, reason: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, subscription: { ...u.subscription, status: 'banned' } } : u));
      } else {
        setError('Failed to ban user');
      }
    } catch (err) {
      setError('An error occurred while banning user');
    }
  };

  const unbanUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/unban`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, subscription: { ...u.subscription, status: 'active' } } : u));
      } else {
        setError('Failed to unban user');
      }
    } catch (err) {
      setError('An error occurred while unbanning user');
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      } else {
        setError('Failed to update user role');
      }
    } catch (err) {
      setError('An error occurred while updating user role');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'sugar_daddy': return 'bg-blue-100 text-blue-800';
      case 'sugar_baby': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      case 'banned': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Users },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'verifications', label: 'Verifications', icon: ShieldCheck },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'reports', label: 'Reports', icon: BarChart }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="border-b">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-1 pb-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats?.total || 0}</div>
              <p className="text-xs text-muted-foreground">All registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats?.verified || 0}</div>
              <p className="text-xs text-muted-foreground">
                {userStats ? Math.round((userStats.verified / userStats.total) * 100) : 0}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Suspended Users</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats?.suspended || 0}</div>
              <p className="text-xs text-muted-foreground">Temporarily suspended</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Banned Users</CardTitle>
              <Ban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats?.banned || 0}</div>
              <p className="text-xs text-muted-foreground">Permanently banned</p>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={filters.role}
                onChange={(e) => setFilters({...filters, role: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Roles</option>
                <option value="sugar_daddy">Sugar Daddy</option>
                <option value="sugar_baby">Sugar Baby</option>
                <option value="admin">Admin</option>
              </select>

              <select
                value={filters.verified}
                onChange={(e) => setFilters({...filters, verified: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Verification</option>
                <option value="true">Verified</option>
                <option value="false">Not Verified</option>
              </select>

              <Button onClick={fetchUsers} variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">User Management</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">2FA</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(user.subscription.status)}`}>
                          {user.subscription.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.emailVerified ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.twoFactorEnabled ? (
                          <Smartphone className="h-4 w-4 text-green-600" />
                        ) : (
                          <Smartphone className="h-4 w-4 text-gray-400" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-xs"
                        >
                          <option value="sugar_daddy">Sugar Daddy</option>
                          <option value="sugar_baby">Sugar Baby</option>
                          <option value="admin">Admin</option>
                        </select>
                        
                        {user.subscription.status === 'active' ? (
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => suspendUser(user.id, 'Admin action')}
                          >
                            Suspend
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => unbanUser(user.id)}
                          >
                            Activate
                          </Button>
                        )}
                        
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => banUser(user.id, 'Admin action')}
                        >
                          Ban
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Logins</CardTitle>
                <CardDescription>Last 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {securityReport?.recentLogins?.map((login, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{login.username}</div>
                        <div className="text-sm text-gray-600">{login.email}</div>
                        <div className="text-xs text-gray-500">{new Date(login.lastLoginAt).toLocaleString()}</div>
                      </div>
                      <Mail className="h-4 w-4 text-green-600" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Suspicious Activity</CardTitle>
                <CardDescription>Users with potential security issues</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {securityReport?.suspiciousActivity?.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div>
                        <div className="font-medium">{activity.username}</div>
                        <div className="text-sm text-gray-600">{activity.email}</div>
                        <div className="text-xs text-yellow-600">Failed attempts: {activity.security?.loginAttempts}</div>
                      </div>
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
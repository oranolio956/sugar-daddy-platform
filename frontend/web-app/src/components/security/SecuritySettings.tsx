'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Alert, AlertDescription } from '../ui/Alert';
import { 
  Shield, 
  Smartphone, 
  Mail, 
  Key, 
  Eye, 
  EyeOff, 
  LogOut,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Lock,
  Globe,
  Clock,
  UserCheck
} from 'lucide-react';
import TwoFactorSetup from './TwoFactorSetup';

interface SecuritySettingsProps {
  user: any;
}

export default function SecuritySettings({ user }: SecuritySettingsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | '2fa' | 'password' | 'sessions' | 'devices'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [sessions, setSessions] = useState<any[]>([]);
  const [show2FASetup, setShow2FASetup] = useState(false);

  useEffect(() => {
    if (activeTab === 'sessions') {
      fetchSessions();
    }
  }, [activeTab]);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/auth/sessions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSessions(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Password changed successfully');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setError(data.message || 'Failed to change password');
      }
    } catch (err) {
      setError('An error occurred while changing password');
    } finally {
      setIsLoading(false);
    }
  };

  const logoutSession = async (sessionId: string) => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ sessionId })
      });

      if (response.ok) {
        setSessions(sessions.filter(session => session.id !== sessionId));
      } else {
        setError('Failed to logout session');
      }
    } catch (err) {
      setError('An error occurred while logging out session');
    }
  };

  const logoutAllSessions = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({})
      });

      if (response.ok) {
        setSessions([]);
      } else {
        setError('Failed to logout all sessions');
      }
    } catch (err) {
      setError('An error occurred while logging out all sessions');
    }
  };

  const getSecurityScore = () => {
    let score = 0;
    let maxScore = 4;

    if (user.emailVerified) score++;
    if (user.twoFactorEnabled) score++;
    if (user.security.lastPasswordChange) {
      const daysSinceChange = Math.floor((Date.now() - new Date(user.security.lastPasswordChange).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceChange < 90) score++;
    }
    if (user.security.trustedDevices && user.security.trustedDevices.length > 0) score++;

    return { score, maxScore, percentage: Math.round((score / maxScore) * 100) };
  };

  const securityScore = getSecurityScore();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: '2fa', label: 'Two-Factor Auth', icon: Smartphone },
    { id: 'password', label: 'Password', icon: Key },
    { id: 'sessions', label: 'Active Sessions', icon: Globe },
    { id: 'devices', label: 'Devices', icon: Clock }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Security Settings</h1>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-600">Security Score</div>
          <div className="text-2xl font-bold text-green-600">{securityScore.percentage}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="font-semibold mb-4">Security Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">Email Verified</span>
                </div>
                {user.emailVerified ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">2FA Enabled</span>
                </div>
                {user.twoFactorEnabled ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Lock className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">Password Age</span>
                </div>
                <span className="text-sm text-gray-600">
                  {user.security.lastPasswordChange ? 
                    `${Math.floor((Date.now() - new Date(user.security.lastPasswordChange).getTime()) / (1000 * 60 * 60 * 24))} days` : 
                    'Unknown'
                  }
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <UserCheck className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">Trusted Devices</span>
                </div>
                <span className="text-sm text-gray-600">
                  {user.security.trustedDevices?.length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="border-b px-6 py-4">
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

            <div className="p-6">
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mb-6 bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">Email Verification</h4>
                      <p className="text-sm text-blue-800 mb-3">
                        Verify your email to secure your account and receive important notifications.
                      </p>
                      {!user.emailVerified && (
                        <Button variant="outline" size="sm">Verify Email</Button>
                      )}
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-900 mb-2">Two-Factor Authentication</h4>
                      <p className="text-sm text-purple-800 mb-3">
                        Add an extra layer of security to your account with 2FA.
                      </p>
                      {!user.twoFactorEnabled && (
                        <Button variant="outline" size="sm" onClick={() => setShow2FASetup(true)}>
                          Enable 2FA
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-900 mb-2">Security Recommendations</h4>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      {!user.emailVerified && <li>• Verify your email address</li>}
                      {!user.twoFactorEnabled && <li>• Enable two-factor authentication</li>}
                      {user.security.lastPasswordChange && 
                        Math.floor((Date.now() - new Date(user.security.lastPasswordChange).getTime()) / (1000 * 60 * 60 * 24)) > 90 && 
                        <li>• Change your password (it's been over 90 days)</li>
                      }
                      <li>• Review active sessions regularly</li>
                      <li>• Use strong, unique passwords</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === '2fa' && (
                <div className="space-y-6">
                  {user.twoFactorEnabled ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                        <h3 className="text-lg font-semibold">Two-Factor Authentication is Enabled</h3>
                      </div>
                      <p className="text-green-800 mb-4">
                        Your account is protected with two-factor authentication. You can manage your 2FA settings below.
                      </p>
                      <div className="flex gap-3">
                        <Button variant="outline">Regenerate Backup Codes</Button>
                        <Button variant="destructive">Disable 2FA</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">Enable Two-Factor Authentication</h3>
                      <p className="text-gray-600 mb-6">
                        Two-factor authentication adds an extra layer of security to your account. 
                        You'll need to enter a code from your authenticator app when signing in.
                      </p>
                      <Button onClick={() => setShow2FASetup(true)} className="w-full md:w-auto">
                        <Smartphone className="h-4 w-4 mr-2" />
                        Setup 2FA
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'password' && (
                <form onSubmit={changePassword} className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          required
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" disabled={isLoading}>
                      Change Password
                    </Button>
                    <Button variant="outline" type="button" onClick={() => setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })}>
                      Clear
                    </Button>
                  </div>
                </form>
              )}

              {activeTab === 'sessions' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Active Sessions</h3>
                    <Button variant="destructive" onClick={logoutAllSessions}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout All Sessions
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {sessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Globe className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">{session.deviceName}</div>
                            <div className="text-sm text-gray-500">{session.userAgent}</div>
                            <div className="text-xs text-gray-400">Last used: {new Date(session.lastUsedAt).toLocaleString()}</div>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => logoutSession(session.id)}
                          disabled={session.active === false}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'devices' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Trusted Devices</h3>
                  <p className="text-gray-600">Manage devices that have been marked as trusted for your account.</p>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Device management functionality coming soon.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {show2FASetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Setup Two-Factor Authentication</h2>
                <Button variant="ghost" onClick={() => setShow2FASetup(false)}>
                  Close
                </Button>
              </div>
              <TwoFactorSetup onSuccess={() => setShow2FASetup(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
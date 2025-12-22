'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, MessageCircle, User, Menu, X, LogOut, Settings, DollarSign, Heart, Crown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  // Close sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Crown },
    { name: 'Matches', href: '/matches', icon: Heart },
    { name: 'Messages', href: '/messages', icon: MessageCircle },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Payments', href: '/payments', icon: DollarSign },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!isAuthenticated) {
    return <div className="min-h-screen bg-ivory-pearl">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-ivory-pearl dark:bg-luxury-charcoal">
      {/* Mobile menu button */}
      <div className="lg:hidden">
        <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-luxury-slate border-b border-gold-100 dark:border-luxury-graphite">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-neutral-400 hover:text-gold-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gold-500"
              >
                <span className="sr-only">Open sidebar</span>
                {sidebarOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
              <Link href="/dashboard" className="ml-4 text-xl font-display font-bold text-transparent bg-clip-text bg-gradient-gold">
                LuxeMatch
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 text-neutral-400 hover:text-gold-500 relative"
              >
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-luxury-black shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 border-r border-gold-900/30",
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between px-6 py-6 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center">
              <Crown className="w-5 h-5 text-luxury-black" />
            </div>
            <span className="text-xl font-display font-bold text-white">
              LuxeMatch
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-neutral-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-8 px-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                  isActive
                    ? 'bg-gradient-gold text-luxury-black shadow-glow'
                    : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                )}
              >
                <Icon className={cn(
                  "mr-3 h-5 w-5 transition-colors",
                  isActive ? 'text-luxury-black' : 'text-neutral-500 group-hover:text-gold-400'
                )} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-4 bg-luxury-black">
          <div className="flex items-center space-x-3">
            {user?.profile.profileImage ? (
              <Image
                src={user.profile.profileImage}
                alt={user.profile.firstName}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full border-2 border-gold-500"
              />
            ) : (
              <div className="h-10 w-10 bg-gradient-gold rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-luxury-black" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.profile.firstName} {user?.profile.lastName}
              </p>
              <p className="text-xs text-gold-400 truncate">
                {user?.role.replace('_', ' ')}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-neutral-400 hover:text-white transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <nav className="bg-white dark:bg-luxury-slate shadow-sm border-b border-gold-100 dark:border-luxury-graphite sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-display font-bold text-luxury-charcoal dark:text-white">
                  {pathname === '/dashboard' && 'Dashboard'}
                  {pathname === '/matches' && 'Matches'}
                  {pathname === '/messages' && 'Messages'}
                  {pathname === '/profile' && 'Profile'}
                  {pathname === '/payments' && 'Payments'}
                  {pathname === '/settings' && 'Settings'}
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="p-2 text-neutral-400 hover:text-gold-500 relative transition-colors"
                  >
                    <Bell className="h-6 w-6" />
                    <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-luxury-slate"></span>
                  </button>
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-luxury-slate rounded-xl shadow-premium border border-gold-100 dark:border-luxury-graphite z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="p-4">
                        <h3 className="text-sm font-medium text-luxury-charcoal dark:text-white mb-2">Notifications</h3>
                        <div className="space-y-2">
                          <div className="text-sm text-neutral-500 dark:text-neutral-400 py-4 text-center">No new notifications</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* User menu */}
                <div className="relative">
                  <button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500">
                    {user?.profile.profileImage ? (
                      <Image
                        src={user.profile.profileImage}
                        alt={user.profile.firstName}
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-full border border-gold-200"
                      />
                    ) : (
                      <div className="h-8 w-8 bg-gold-100 rounded-full flex items-center justify-center border border-gold-200">
                        <User className="h-5 w-5 text-gold-600" />
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;

'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useToast } from '@/components/ui/Toast';
import { Bell, MessageCircle, User, Menu, X, LogOut, Settings, DollarSign, Heart, Crown, Moon, Sun, Contrast, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [accessibilityMenuOpen, setAccessibilityMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const {
    isHighContrast,
    fontSize,
    isReducedMotion,
    isScreenReaderMode,
    toggleHighContrast,
    setFontSize,
    toggleReducedMotion,
    toggleScreenReaderMode,
    announce
  } = useAccessibility();
  const { toast } = useToast();

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
      toast({
        title: "Logged out successfully",
        description: "You have been signed out of your account.",
        variant: "default",
      });
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        title: "Logout failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  const handleAccessibilityAction = (action: string) => {
    switch (action) {
      case 'high-contrast':
        toggleHighContrast();
        announce(isHighContrast ? "High contrast mode disabled" : "High contrast mode enabled");
        break;
      case 'reduced-motion':
        toggleReducedMotion();
        announce(isReducedMotion ? "Reduced motion disabled" : "Reduced motion enabled");
        break;
      case 'screen-reader':
        toggleScreenReaderMode();
        announce(isScreenReaderMode ? "Screen reader mode disabled" : "Screen reader mode enabled");
        break;
      case 'font-size-small':
        setFontSize('small');
        announce("Font size set to small");
        break;
      case 'font-size-medium':
        setFontSize('medium');
        announce("Font size set to medium");
        break;
      case 'font-size-large':
        setFontSize('large');
        announce("Font size set to large");
        break;
    }
    setAccessibilityMenuOpen(false);
  };

  if (!isAuthenticated) {
    return <div className="min-h-screen bg-ivory-pearl">{children}</div>;
  }

  return (
    <motion.div
      className="min-h-screen bg-ivory-pearl dark:bg-luxury-charcoal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Mobile menu button */}
      <div className="lg:hidden">
        <motion.div
          className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-luxury-slate border-b border-gold-100 dark:border-luxury-graphite shadow-sm"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center">
              <motion.button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-3 text-neutral-400 hover:text-gold-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gold-500 rounded-lg touch-target hover-lift"
                aria-label="Open navigation"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="sr-only">Open navigation</span>
                <motion.div
                  animate={{ rotate: sidebarOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {sidebarOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </motion.div>
              </motion.button>
              <Link href="/dashboard" className="ml-3 text-xl font-display font-bold text-transparent bg-clip-text bg-gradient-gold hover-glow">
                Dandy Babe
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <motion.button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-3 text-neutral-400 hover:text-gold-500 relative rounded-lg touch-target hover-lift"
                aria-label="Notifications"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bell className="h-6 w-6" />
                {notificationsOpen && (
                  <motion.span
                    className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                )}
              </motion.button>
              <Link
                href="/profile"
                className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center touch-target hover-scale"
                aria-label="Profile"
              >
                {user?.profile.profileImage ? (
                  <img src={user.profile.profileImage} alt="Profile" className="w-full h-full rounded-full" />
                ) : (
                  <User className="w-5 h-5 text-luxury-black" />
                )}
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className={cn(
              "fixed inset-y-0 left-0 z-40 w-72 bg-luxury-black shadow-2xl border-r border-gold-900/30"
            )}
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex items-center justify-between px-6 py-6 border-b border-white/10">
              <Link href="/dashboard" className="flex items-center gap-3">
                <motion.div
                  className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Crown className="w-6 h-6 text-luxury-black" />
                </motion.div>
                <span className="text-xl font-display font-bold text-white">
                  Dandy Babe
                </span>
              </Link>
              <motion.button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-3 text-neutral-400 hover:text-white rounded-lg touch-target"
                aria-label="Close navigation"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="h-6 w-6" />
              </motion.button>
            </div>

            <nav className="mt-6 px-4 space-y-1">
              {navigation.map((item, index) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center px-4 py-4 text-sm font-medium rounded-xl transition-all duration-200 touch-target hover-lift",
                        isActive
                          ? 'bg-gradient-gold text-luxury-black shadow-glow'
                          : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                      )}
                    >
                      <Icon className={cn(
                        "mr-3 h-5 w-5 transition-colors",
                        isActive ? 'text-luxury-black' : 'text-neutral-500 group-hover:text-gold-400'
                      )} />
                      <span className="flex-1">{item.name}</span>
                      <motion.div
                        animate={{ x: isActive ? 4 : 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      >
                        <ArrowRight className={cn(
                          "h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity",
                          isActive ? 'opacity-100' : ''
                        )} />
                      </motion.div>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            <motion.div
              className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-4 bg-luxury-black"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  {user?.profile.profileImage ? (
                    <motion.div whileHover={{ scale: 1.05 }}>
                      <Image
                        src={user.profile.profileImage}
                        alt={user.profile.firstName}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-full border-2 border-gold-500 shadow-lg"
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      className="h-12 w-12 bg-gradient-gold rounded-full flex items-center justify-center shadow-lg"
                      whileHover={{ scale: 1.05 }}
                    >
                      <User className="h-7 w-7 text-luxury-black" />
                    </motion.div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user?.profile.firstName} {user?.profile.lastName}
                    </p>
                    <p className="text-xs text-gold-400 truncate font-medium">
                      {user?.role.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors touch-target"
                  >
                    Edit Profile
                  </motion.button>
                  <motion.button
                    onClick={handleLogout}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium px-4 py-2 rounded-lg transition-colors touch-target"
                  >
                    Sign Out
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <motion.div
        className="lg:pl-72"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {/* Top navigation */}
        <motion.nav
          className="bg-white dark:bg-luxury-slate shadow-sm border-b border-gold-100 dark:border-luxury-graphite sticky top-0 z-50 lg:top-0"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          role="navigation"
          aria-label="Main navigation"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 lg:h-20">
              <div className="flex items-center">
                <motion.h1
                  className="text-2xl lg:text-3xl font-display font-bold text-luxury-charcoal dark:text-white"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {pathname === '/dashboard' && 'Dashboard'}
                  {pathname === '/matches' && 'Matches'}
                  {pathname === '/messages' && 'Messages'}
                  {pathname === '/profile' && 'Profile'}
                  {pathname === '/payments' && 'Payments'}
                  {pathname === '/settings' && 'Settings'}
                </motion.h1>
              </div>
              <div className="hidden lg:flex items-center space-x-4">
                {/* Accessibility Menu */}
                <div className="relative">
                  <motion.button
                    onClick={() => setAccessibilityMenuOpen(!accessibilityMenuOpen)}
                    className="p-3 text-neutral-400 hover:text-gold-500 relative transition-colors rounded-lg touch-target hover-lift"
                    aria-label="Accessibility options"
                    aria-expanded={accessibilityMenuOpen}
                    aria-haspopup="menu"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Contrast className="h-6 w-6" />
                  </motion.button>
                  <AnimatePresence>
                    {accessibilityMenuOpen && (
                      <motion.div
                        className="absolute right-0 mt-2 w-64 bg-white dark:bg-luxury-slate rounded-xl shadow-premium border border-gold-100 dark:border-luxury-graphite z-50"
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        role="menu"
                      >
                        <div className="p-3 border-b border-gold-100 dark:border-luxury-graphite">
                          <h3 className="text-sm font-medium text-luxury-charcoal dark:text-white">Accessibility</h3>
                        </div>
                        <div className="p-3 space-y-2">
                          <button
                            onClick={() => handleAccessibilityAction('high-contrast')}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-gold-50 dark:hover:bg-white/5 text-sm"
                            role="menuitem"
                          >
                            <div className="flex items-center justify-between">
                              <span>High Contrast</span>
                              <span className={`w-4 h-4 rounded-full ${isHighContrast ? 'bg-gold-500' : 'bg-gray-300'}`}></span>
                            </div>
                          </button>
                          <button
                            onClick={() => handleAccessibilityAction('reduced-motion')}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-gold-50 dark:hover:bg-white/5 text-sm"
                            role="menuitem"
                          >
                            <div className="flex items-center justify-between">
                              <span>Reduced Motion</span>
                              <span className={`w-4 h-4 rounded-full ${isReducedMotion ? 'bg-gold-500' : 'bg-gray-300'}`}></span>
                            </div>
                          </button>
                          <button
                            onClick={() => handleAccessibilityAction('screen-reader')}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-gold-50 dark:hover:bg-white/5 text-sm"
                            role="menuitem"
                          >
                            <div className="flex items-center justify-between">
                              <span>Screen Reader</span>
                              <span className={`w-4 h-4 rounded-full ${isScreenReaderMode ? 'bg-gold-500' : 'bg-gray-300'}`}></span>
                            </div>
                          </button>
                          <div className="border-t border-gold-100 dark:border-luxury-graphite my-2"></div>
                          <div className="space-y-1">
                            <button
                              onClick={() => handleAccessibilityAction('font-size-small')}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-gold-50 dark:hover:bg-white/5 text-sm"
                              role="menuitem"
                            >
                              Font Size: Small
                            </button>
                            <button
                              onClick={() => handleAccessibilityAction('font-size-medium')}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-gold-50 dark:hover:bg-white/5 text-sm"
                              role="menuitem"
                            >
                              Font Size: Medium
                            </button>
                            <button
                              onClick={() => handleAccessibilityAction('font-size-large')}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-gold-50 dark:hover:bg-white/5 text-sm"
                              role="menuitem"
                            >
                              Font Size: Large
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Notifications */}
                <div className="relative">
                  <motion.button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="p-3 text-neutral-400 hover:text-gold-500 relative transition-colors rounded-lg touch-target hover-lift"
                    aria-label="Notifications"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Bell className="h-6 w-6" />
                    <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-luxury-slate"></span>
                  </motion.button>
                  <AnimatePresence>
                    {notificationsOpen && (
                      <motion.div
                        className="absolute right-0 mt-2 w-80 bg-white dark:bg-luxury-slate rounded-xl shadow-premium border border-gold-100 dark:border-luxury-graphite z-50"
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      >
                        <div className="p-4">
                          <h3 className="text-sm font-medium text-luxury-charcoal dark:text-white mb-2">Notifications</h3>
                          <div className="space-y-2">
                            <div className="text-sm text-neutral-500 dark:text-neutral-400 py-4 text-center">No new notifications</div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* User menu */}
                <div className="relative">
                  <Link
                    href="/profile"
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors touch-target hover-lift"
                  >
                    {user?.profile.profileImage ? (
                      <motion.div whileHover={{ scale: 1.05 }}>
                        <Image
                          src={user.profile.profileImage}
                          alt={user.profile.firstName}
                          width={36}
                          height={36}
                          className="h-9 w-9 rounded-full border border-gold-200"
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        className="h-9 w-9 bg-gold-100 rounded-full flex items-center justify-center border border-gold-200"
                        whileHover={{ scale: 1.05 }}
                      >
                        <User className="h-6 w-6 text-gold-600" />
                      </motion.div>
                    )}
                    <div className="hidden xl:block text-left">
                      <p className="text-sm font-medium text-luxury-charcoal dark:text-white">{user?.profile.firstName}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{user?.role.replace('_', ' ')}</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.nav>

        {/* Page content */}
        <main className="flex-1">
          <motion.div
            className="py-6 lg:py-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mobile-p">
                {children}
              </div>
            </div>
          </motion.div>
        </main>
      </motion.div>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Layout;

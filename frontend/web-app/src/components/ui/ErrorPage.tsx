'use client';

import React from 'react';
import { Button } from './Button';
import { motion } from 'framer-motion';
import { AlertTriangle, Home, RefreshCw, Mail } from 'lucide-react';
import Link from 'next/link';

interface ErrorPageProps {
  statusCode?: number;
  title?: string;
  message?: string;
  showActions?: boolean;
  onRetry?: () => void;
}

const ErrorPage: React.FC<ErrorPageProps> = ({
  statusCode = 500,
  title,
  message,
  showActions = true,
  onRetry
}) => {
  const defaultTitle = statusCode === 404 ? "Page Not Found" : "Something Went Wrong";
  const defaultMessage = statusCode === 404 
    ? "The page you're looking for doesn't exist or has been moved."
    : "We're experiencing technical difficulties. Please try again later.";

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 via-champagne-100 to-champagne-200 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-premium p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="w-16 h-16 mx-auto bg-champagne-100 rounded-full flex items-center justify-center mb-6"
        >
          <AlertTriangle className="w-8 h-8 text-champagne-600" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl font-display font-bold text-champagne-900 mb-2"
        >
          {title || defaultTitle}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-champagne-600 mb-8"
        >
          {message || defaultMessage}
        </motion.p>

        {showActions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-4"
          >
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                asChild
                className="bg-gradient-gold text-charcoal-900 hover:shadow-glow"
              >
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Link>
              </Button>
              
              {onRetry && (
                <Button
                  variant="outline"
                  onClick={onRetry}
                  className="border-champagne-300 text-champagne-700 hover:bg-champagne-50"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              )}
            </div>

            <div className="pt-4 border-t border-champagne-200">
              <p className="text-sm text-champagne-500 mb-4">
                Still having trouble? Contact our support team.
              </p>
              <Button
                variant="ghost"
                asChild
                className="text-champagne-600 hover:text-champagne-900"
              >
                <a href="mailto:support@dandybabe.com">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Support
                </a>
              </Button>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8 text-xs text-champagne-400"
        >
          Error Code: {statusCode}
        </motion.div>
      </motion.div>
    </div>
  );
};

// 404 Error Page Component
export const NotFoundPage: React.FC = () => (
  <ErrorPage
    statusCode={404}
    title="Page Not Found"
    message="The page you're looking for doesn't exist or has been moved."
    onRetry={() => window.location.reload()}
  />
);

// 500 Error Page Component
export const ServerErrorPage: React.FC = () => (
  <ErrorPage
    statusCode={500}
    title="Server Error"
    message="We're experiencing technical difficulties. Please try again later."
    onRetry={() => window.location.reload()}
  />
);

// Maintenance Page Component
export const MaintenancePage: React.FC = () => (
  <ErrorPage
    statusCode={503}
    title="Under Maintenance"
    message="We're currently performing scheduled maintenance. Please check back soon."
    showActions={false}
  />
);

export default ErrorPage;
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LoadingProps {
  type?: 'spinner' | 'pulse' | 'wave' | 'dots' | 'bar';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'accent' | 'white';
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  type = 'spinner',
  size = 'md',
  color = 'primary',
  className,
  text,
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  const colorClasses = {
    primary: 'text-champagne-600',
    secondary: 'text-charcoal-600',
    accent: 'text-gold-500',
    white: 'text-white',
  };

  const renderSpinner = () => (
    <motion.div
      className={cn(
        "animate-spin rounded-full border-4 border-gray-300 border-t-current",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );

  const renderPulse = () => (
    <motion.div
      className={cn(
        "rounded-full bg-current",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    />
  );

  const renderWave = () => (
    <div className="flex space-x-1">
      {[0, 1, 2, 3, 4].map((index) => (
        <motion.div
          key={index}
          className={cn(
            "w-2 rounded-full bg-current",
            colorClasses[color],
            className
          )}
          animate={{ height: [8, 24, 8], opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: index * 0.1,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={cn(
            "w-3 h-3 rounded-full bg-current",
            colorClasses[color],
            className
          )}
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: index * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );

  const renderBar = () => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <motion.div
        className={cn("h-2 rounded-full", colorClasses[color], className)}
        animate={{ width: ["0%", "100%", "0%"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );

  const renderContent = () => {
    let content;
    
    switch (type) {
      case 'pulse':
        content = renderPulse();
        break;
      case 'wave':
        content = renderWave();
        break;
      case 'dots':
        content = renderDots();
        break;
      case 'bar':
        content = renderBar();
        break;
      default:
        content = renderSpinner();
    }

    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        {content}
        {text && (
          <motion.p
            className="text-sm text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 dark:bg-charcoal-900/80 backdrop-blur-sm flex items-center justify-center z-50">
        {renderContent()}
      </div>
    );
  }

  return renderContent();
};

// Skeleton component for loading states
interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'circle' | 'text';
  width?: number | string;
  height?: number | string;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rect',
  width,
  height,
  animation = 'pulse',
}) => {
  const baseClasses = "bg-gray-300 dark:bg-gray-700 rounded-md";
  
  const variantClasses = {
    rect: "rounded-md",
    circle: "rounded-full",
    text: "rounded-md h-4",
  };

  const animationClasses = {
    pulse: "animate-pulse",
    wave: "animate-[shimmer_2s_infinite]",
    none: "",
  };

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={{ width, height }}
    />
  );
};

// Skeleton wrapper for lists
interface SkeletonListProps {
  count?: number;
  className?: string;
  itemHeight?: number | string;
  itemClassName?: string;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  count = 5,
  className,
  itemHeight = 60,
  itemClassName,
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }, (_, index) => (
        <Skeleton
          key={index}
          variant="rect"
          height={itemHeight}
          className={cn("w-full", itemClassName)}
          animation="wave"
        />
      ))}
    </div>
  );
};

// Skeleton wrapper for cards
interface SkeletonCardProps {
  className?: string;
  image?: boolean;
  title?: boolean;
  subtitle?: boolean;
  content?: boolean;
  actions?: boolean;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  className,
  image = true,
  title = true,
  subtitle = true,
  content = true,
  actions = true,
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      {image && (
        <Skeleton
          variant="rect"
          height={200}
          className="w-full rounded-lg"
          animation="wave"
        />
      )}
      {title && (
        <Skeleton
          variant="rect"
          height={24}
          className="w-3/4"
          animation="pulse"
        />
      )}
      {subtitle && (
        <Skeleton
          variant="rect"
          height={16}
          className="w-1/2"
          animation="pulse"
        />
      )}
      {content && (
        <div className="space-y-2">
          <Skeleton variant="rect" height={12} animation="wave" />
          <Skeleton variant="rect" height={12} className="w-5/6" animation="wave" />
          <Skeleton variant="rect" height={12} className="w-4/6" animation="wave" />
        </div>
      )}
      {actions && (
        <div className="flex space-x-2">
          <Skeleton variant="rect" height={32} width={80} className="rounded" animation="pulse" />
          <Skeleton variant="rect" height={32} width={80} className="rounded" animation="pulse" />
        </div>
      )}
    </div>
  );
};

// Progress bar component
interface ProgressBarProps {
  progress: number; // 0 to 100
  className?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className,
  showPercentage = true,
  size = 'md',
  color = 'primary',
}) => {
  const sizeClasses = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  };

  const colorClasses = {
    primary: "bg-gradient-gold",
    secondary: "bg-charcoal-600",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-red-500",
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
        <span>Loading...</span>
        {showPercentage && <span>{Math.round(progress)}%</span>}
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full transition-all duration-300", colorClasses[color])}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

// Hook for managing loading states
export const useLoading = (initialLoading = false) => {
  const [isLoading, setIsLoading] = useState(initialLoading);

  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);
  const setLoading = (loading: boolean) => setIsLoading(loading);

  return {
    isLoading,
    startLoading,
    stopLoading,
    setLoading,
  };
};
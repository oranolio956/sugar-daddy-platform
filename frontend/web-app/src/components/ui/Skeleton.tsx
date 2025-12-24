'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const skeletonVariants = cva(
  'animate-pulse bg-gradient-to-r from-champagne-100/50 via-champagne-200/50 to-champagne-100/50',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-champagne-100/50 via-champagne-200/50 to-champagne-100/50',
        subtle: 'bg-gradient-to-r from-champagne-50/50 via-champagne-100/50 to-champagne-50/50',
        bold: 'bg-gradient-to-r from-champagne-300/50 via-champagne-400/50 to-champagne-300/50',
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        '3xl': 'rounded-3xl',
        full: 'rounded-full',
      },
      shimmer: {
        slow: 'animate-[shimmer_3s_infinite]',
        medium: 'animate-[shimmer_2s_infinite]',
        fast: 'animate-[shimmer_1s_infinite]',
      },
    },
    defaultVariants: {
      variant: 'default',
      rounded: 'md',
      shimmer: 'medium',
    },
  }
);

const shimmerKeyframes = `
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
`;

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  /**
   * The animation duration in seconds
   */
  duration?: number;
  /**
   * Whether to show a shimmer effect
   */
  shimmer?: boolean;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, rounded, shimmer = true, duration = 2, style, ...props }, ref) => {
    const shimmerStyle = shimmer ? {
      backgroundImage: `linear-gradient(90deg, rgba(247, 231, 206, 0.1) 25%, rgba(247, 231, 206, 0.3) 50%, rgba(247, 231, 206, 0.1) 75%)`,
      backgroundSize: '200% 100%',
      animation: `shimmer ${duration}s infinite`,
    } : {};

    return (
      <>
        <style>{shimmerKeyframes}</style>
        <div
          ref={ref}
          className={cn(skeletonVariants({ variant, rounded, className }))}
          style={{ ...shimmerStyle, ...style }}
          {...props}
        />
      </>
    );
  }
);
Skeleton.displayName = 'Skeleton';

// Predefined skeleton components for common use cases
export const SkeletonCard = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('space-y-4', className)} {...props}>
    <Skeleton className="h-48 w-full rounded-xl" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-3/4 rounded" />
      <Skeleton className="h-3 w-1/2 rounded" />
    </div>
  </div>
);

export const SkeletonText = ({ lines = 3, className, ...props }: { lines?: number } & React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('space-y-2', className)} {...props}>
    {Array.from({ length: lines }, (_, i) => (
      <Skeleton key={i} className="h-4 rounded" style={{ width: `${70 + Math.random() * 30}%` }} />
    ))}
  </div>
);

export const SkeletonAvatar = ({ size = 'md', className, ...props }: { size?: 'sm' | 'md' | 'lg' | 'xl' } & React.HTMLAttributes<HTMLDivElement>) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20',
  };

  return (
    <Skeleton
      className={cn('rounded-full', sizeClasses[size], className)}
      {...props}
    />
  );
};

export const SkeletonButton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <Skeleton className={cn('h-10 w-24 rounded-full', className)} {...props} />
);

export const SkeletonInput = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <Skeleton className={cn('h-10 w-full rounded-lg', className)} {...props} />
);

export const SkeletonList = ({ items = 5, className, ...props }: { items?: number } & React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('space-y-4', className)} {...props}>
    {Array.from({ length: items }, (_, i) => (
      <div key={i} className="flex space-x-4">
        <SkeletonAvatar size="md" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4 rounded" />
          <Skeleton className="h-3 w-1/2 rounded" />
        </div>
      </div>
    ))}
  </div>
);

export { Skeleton, skeletonVariants };
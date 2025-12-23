'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-champagne-500 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-champagne-500 text-charcoal-900 hover:bg-champagne-600',
        secondary:
          'border-transparent bg-charcoal-800 text-champagne-50 hover:bg-charcoal-900',
        destructive:
          'border-transparent bg-red-500 text-white hover:bg-red-600',
        outline: 'border-champagne-200 text-charcoal-700 hover:bg-champagne-50 dark:border-champagne-500/30 dark:text-champagne-200',
        glass: 'border-white/20 bg-white/30 backdrop-blur-md text-charcoal-900 dark:bg-charcoal-900/40 dark:text-champagne-50',
        premium: 'bg-gradient-gold border-none text-charcoal-900 shadow-sm font-bold tracking-wider uppercase text-[10px]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, className }))} {...props} />
  );
}

export { Badge, badgeVariants };

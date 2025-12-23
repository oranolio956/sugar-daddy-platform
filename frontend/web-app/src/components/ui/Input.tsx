'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl border border-champagne-200 bg-white/50 backdrop-blur-sm px-4 py-2 text-sm transition-all duration-300 placeholder:text-charcoal-400 focus:bg-white focus:border-champagne-500 focus:ring-0 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          "dark:bg-charcoal-900/50 dark:border-white/5 dark:text-champagne-50 dark:focus:border-champagne-500/50 dark:focus:bg-charcoal-900",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };

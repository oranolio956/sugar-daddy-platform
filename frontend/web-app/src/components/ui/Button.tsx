'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-champagne-400 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
  {
    variants: {
      variant: {
        default:
          'bg-charcoal-900 text-champagne-50 hover:bg-charcoal-800 border border-white/10',
        primary:
          'bg-gradient-gold text-charcoal-900 hover:shadow-[0_0_20px_rgba(247,231,206,0.3)] border-none',
        outline:
          'border border-champagne-200 bg-transparent hover:bg-champagne-50 text-charcoal-900 dark:text-champagne-200 dark:border-champagne-500/20 dark:hover:bg-champagne-500/10',
        secondary:
          'bg-champagne-100 text-charcoal-900 hover:bg-champagne-200 dark:bg-charcoal-800 dark:text-champagne-50 dark:hover:bg-charcoal-700',
        ghost: 'hover:bg-champagne-50 text-charcoal-900 dark:text-champagne-200 dark:hover:bg-white/5',
        link: 'text-champagne-600 underline-offset-4 hover:underline dark:text-champagne-500',
      },
      size: {
        default: 'h-11 px-6 py-2',
        sm: 'h-9 px-4',
        lg: 'h-14 px-10 text-base tracking-widest uppercase font-bold',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };

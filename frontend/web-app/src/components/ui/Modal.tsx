'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const Modal = Dialog.Root;

const ModalTrigger = Dialog.Trigger;

const ModalPortal = Dialog.Portal;

const ModalClose = Dialog.Close;

const ModalOverlay = React.forwardRef<
  React.ElementRef<typeof Dialog.Overlay>,
  React.ComponentPropsWithoutRef<typeof Dialog.Overlay>
>(({ className, ...props }, ref) => (
  <Dialog.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-all duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
));
ModalOverlay.displayName = Dialog.Overlay.displayName;

const ModalContent = React.forwardRef<
  React.ElementRef<typeof Dialog.Content>,
  React.ComponentPropsWithoutRef<typeof Dialog.Content>
>(({ className, children, ...props }, ref) => (
  <ModalPortal>
    <ModalOverlay />
    <Dialog.Content
      ref={ref}
      className={cn(
        'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-champagne-200 bg-white/95 shadow-premium backdrop-blur-lg animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] duration-200 dark:border-champagne-700 dark:bg-champagne-900/95',
        'sm:rounded-2xl',
        className
      )}
      {...props}
    >
      {children}
      <Dialog.Close className="absolute right-4 top-4 rounded-md p-1 text-champagne-500 opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-champagne-500 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-champagne-100 dark:ring-offset-champagne-950 dark:focus:ring-champagne-300 dark:data-[state=open]:bg-champagne-800">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </Dialog.Close>
    </Dialog.Content>
  </ModalPortal>
));
ModalContent.displayName = Dialog.Content.displayName;

const ModalHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-2 text-center sm:text-left',
      className
    )}
    {...props}
  />
);
ModalHeader.displayName = 'ModalHeader';

const ModalFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className
    )}
    {...props}
  />
);
ModalFooter.displayName = 'ModalFooter';

const ModalTitle = React.forwardRef<
  React.ElementRef<typeof Dialog.Title>,
  React.ComponentPropsWithoutRef<typeof Dialog.Title>
>(({ className, ...props }, ref) => (
  <Dialog.Title
    ref={ref}
    className={cn(
      'text-lg font-semibold text-champagne-900 dark:text-champagne-100',
      className
    )}
    {...props}
  />
));
ModalTitle.displayName = Dialog.Title.displayName;

const ModalDescription = React.forwardRef<
  React.ElementRef<typeof Dialog.Description>,
  React.ComponentPropsWithoutRef<typeof Dialog.Description>
>(({ className, ...props }, ref) => (
  <Dialog.Description
    ref={ref}
    className={cn('text-sm text-champagne-500 dark:text-champagne-400', className)}
    {...props}
  />
));
ModalDescription.displayName = Dialog.Description.displayName;

// Premium Modal with enhanced animations
interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
}

const PremiumModal: React.FC<PremiumModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  className,
  showCloseButton = true,
  closeOnOverlayClick = true,
}) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={closeOnOverlayClick ? onClose : undefined}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'relative w-full',
              sizeClasses[size],
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white/95 dark:bg-champagne-900/95 backdrop-blur-lg rounded-2xl border border-champagne-200 dark:border-champagne-700 shadow-premium overflow-hidden">
              {(title || description) && (
                <div className="p-6 border-b border-champagne-200 dark:border-champagne-700">
                  {title && (
                    <h2 className="text-2xl font-display font-bold text-champagne-900 dark:text-champagne-100 mb-2">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="text-champagne-600 dark:text-champagne-300">
                      {description}
                    </p>
                  )}
                </div>
              )}
              
              <div className="p-6">
                {children}
              </div>

              {showCloseButton && (
                <div className="absolute top-4 right-4">
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full bg-champagne-100/50 hover:bg-champagne-200/50 dark:bg-champagne-800/50 dark:hover:bg-champagne-700/50 transition-colors"
                  >
                    <X className="w-5 h-5 text-champagne-600 dark:text-champagne-300" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export {
  Modal,
  ModalPortal,
  ModalOverlay,
  ModalClose,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalTitle,
  ModalDescription,
  PremiumModal,
};
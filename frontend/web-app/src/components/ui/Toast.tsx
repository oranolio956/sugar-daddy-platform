'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: 'default' | 'success' | 'destructive' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  toast: (toast: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((toastData: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { ...toastData, id };
    
    setToasts(prev => [...prev, newToast]);

    // Auto-dismiss after duration
    if (toastData.duration !== 0) {
      const duration = toastData.duration || 5000;
      setTimeout(() => {
        dismiss(id);
      }, duration);
    }
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const contextValue: ToastContextType = {
    toasts,
    toast,
    dismiss,
    dismissAll,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts, dismiss } = useToast();

  const getToastIcon = (variant: Toast['variant']) => {
    switch (variant) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'destructive':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getToastClasses = (variant: Toast['variant']) => {
    switch (variant) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'destructive':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-white border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={cn(
              "min-w-[300px] max-w-md rounded-lg border shadow-lg p-4",
              getToastClasses(toast.variant)
            )}
            role="alert"
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="flex items-start space-x-3">
              {getToastIcon(toast.variant)}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{toast.title}</p>
                {toast.description && (
                  <p className="text-sm opacity-80 mt-1">{toast.description}</p>
                )}
                {toast.action && (
                  <button
                    onClick={toast.action.onClick}
                    className="mt-2 text-sm font-medium text-current hover:underline focus:outline-none focus:underline"
                  >
                    {toast.action.label}
                  </button>
                )}
              </div>
              <button
                onClick={() => dismiss(toast.id)}
                className="ml-2 p-1 rounded-full hover:bg-black/10 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current"
                aria-label="Close notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Convenience hook for common toast types
export const useToasts = () => {
  const { toast } = useToast();

  return {
    success: (title: string, description?: string, duration?: number) =>
      toast({ title, description, variant: 'success', duration }),
    error: (title: string, description?: string, duration?: number) =>
      toast({ title, description, variant: 'destructive', duration }),
    warning: (title: string, description?: string, duration?: number) =>
      toast({ title, description, variant: 'warning', duration }),
    info: (title: string, description?: string, duration?: number) =>
      toast({ title, description, variant: 'info', duration }),
    default: (title: string, description?: string, duration?: number) =>
      toast({ title, description, variant: 'default', duration }),
  };
};
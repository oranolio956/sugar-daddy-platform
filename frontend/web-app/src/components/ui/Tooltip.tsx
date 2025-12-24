'use client';

import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TooltipContextType {
  showTooltip: (id: string, content: string, options?: TooltipOptions) => void;
  hideTooltip: (id: string) => void;
}

interface TooltipOptions {
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  interactive?: boolean;
  maxWidth?: string;
}

const TooltipContext = createContext<TooltipContextType | undefined>(undefined);

export const useTooltip = () => {
  const context = useContext(TooltipContext);
  if (context === undefined) {
    throw new Error('useTooltip must be used within a TooltipProvider');
  }
  return context;
};

interface TooltipProviderProps {
  children: ReactNode;
}

export const TooltipProvider: React.FC<TooltipProviderProps> = ({ children }) => {
  const [tooltips, setTooltips] = useState<Map<string, { content: string; options: TooltipOptions; element: HTMLElement }>>(new Map());

  const showTooltip = (id: string, content: string, options: TooltipOptions = {}) => {
    const element = document.getElementById(id);
    if (element) {
      setTooltips(prev => new Map(prev.set(id, { content, options, element }));
    }
  };

  const hideTooltip = (id: string) => {
    setTooltips(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  };

  const contextValue: TooltipContextType = {
    showTooltip,
    hideTooltip,
  };

  return (
    <TooltipContext.Provider value={contextValue}>
      {children}
      <TooltipContainer tooltips={tooltips} />
    </TooltipContext.Provider>
  );
};

interface TooltipContainerProps {
  tooltips: Map<string, { content: string; options: TooltipOptions; element: HTMLElement }>;
}

const TooltipContainer: React.FC<TooltipContainerProps> = ({ tooltips }) => {
  const getTooltipPosition = (element: HTMLElement, position: string) => {
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    switch (position) {
      case 'top':
        return {
          top: rect.top + scrollTop - 10,
          left: rect.left + scrollLeft + rect.width / 2,
          transform: 'translate(-50%, -100%)',
        };
      case 'bottom':
        return {
          top: rect.bottom + scrollTop + 10,
          left: rect.left + scrollLeft + rect.width / 2,
          transform: 'translate(-50%, 0)',
        };
      case 'left':
        return {
          top: rect.top + scrollTop + rect.height / 2,
          left: rect.left + scrollLeft - 10,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        return {
          top: rect.top + scrollTop + rect.height / 2,
          left: rect.right + scrollLeft + 10,
          transform: 'translate(0, -50%)',
        };
      default:
        return {
          top: rect.top + scrollTop - 10,
          left: rect.left + scrollLeft + rect.width / 2,
          transform: 'translate(-50%, -100%)',
        };
    }
  };

  return (
    <div className="fixed top-0 left-0 pointer-events-none z-50">
      <AnimatePresence>
        {Array.from(tooltips.entries()).map(([id, { content, options, element }]) => {
          const position = getTooltipPosition(element, options.position || 'top');
          
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="pointer-events-auto"
              style={{
                position: 'absolute',
                ...position,
                maxWidth: options.maxWidth || '200px',
              }}
            >
              <div
                className={cn(
                  "bg-charcoal-900 text-champagne-50 text-sm px-3 py-2 rounded-lg shadow-lg border border-white/10",
                  "before:content-[''] before:absolute before:w-0 before:h-0 before:border-4",
                  options.position === 'top' && "before:top-full before:left-1/2 before:ml-[-8px] before:border-t-charcoal-900 before:border-l-transparent before:border-r-transparent before:border-b-transparent",
                  options.position === 'bottom' && "before:bottom-full before:left-1/2 before:ml-[-8px] before:border-b-charcoal-900 before:border-l-transparent before:border-r-transparent before:border-t-transparent",
                  options.position === 'left' && "before:left-full before:top-1/2 before:mt-[-8px] before:border-l-charcoal-900 before:border-t-transparent before:border-b-transparent before:border-r-transparent",
                  options.position === 'right' && "before:right-full before:top-1/2 before:mt-[-8px] before:border-r-charcoal-900 before:border-t-transparent before:border-b-transparent before:border-l-transparent"
                )}
                role="tooltip"
              >
                {content}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

// Tooltip wrapper component
interface TooltipProps {
  content: string;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  interactive?: boolean;
  maxWidth?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 200,
  interactive = false,
  maxWidth,
}) => {
  const { showTooltip, hideTooltip } = useTooltip();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const show = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        showTooltip(element.id, content, { position, delay, interactive, maxWidth });
      }, delay);
    };

    const hide = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      hideTooltip(element.id);
    };

    element.addEventListener('mouseenter', show);
    element.addEventListener('mouseleave', hide);
    element.addEventListener('focus', show);
    element.addEventListener('blur', hide);

    return () => {
      element.removeEventListener('mouseenter', show);
      element.removeEventListener('mouseleave', hide);
      element.removeEventListener('focus', show);
      element.removeEventListener('blur', hide);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [content, position, delay, interactive, maxWidth, showTooltip, hideTooltip]);

  // Clone child to add necessary props
  const child = React.Children.only(children);
  return React.cloneElement(child as React.ReactElement<any>, {
    ref: elementRef,
    id: child.props.id || `tooltip-${Math.random().toString(36).substr(2, 9)}`,
    'aria-describedby': child.props['aria-describedby'] || `tooltip-${Math.random().toString(36).substr(2, 9)}`,
  });
};

// Hook for programmatic tooltip control
export const useTooltipControl = () => {
  const { showTooltip, hideTooltip } = useTooltip();
  
  return {
    show: (elementId: string, content: string, options?: TooltipOptions) =>
      showTooltip(elementId, content, options),
    hide: (elementId: string) => hideTooltip(elementId),
  };
};
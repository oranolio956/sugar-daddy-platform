'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AccessibilityContextType {
  isHighContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  isReducedMotion: boolean;
  isScreenReaderMode: boolean;
  toggleHighContrast: () => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  toggleReducedMotion: () => void;
  toggleScreenReaderMode: () => void;
  announce: (message: string) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isScreenReaderMode, setIsScreenReaderMode] = useState(false);
  const [announcement, setAnnouncement] = useState<string>('');

  // Check user preferences on mount
  useEffect(() => {
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    setIsHighContrast(prefersHighContrast);
    setIsReducedMotion(prefersReducedMotion);

    // Apply system preferences to document
    if (prefersHighContrast) {
      document.documentElement.classList.add('high-contrast');
    }
    if (prefersReducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    }
  }, []);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleContrastChange = (e: MediaQueryListEvent) => {
      if (!isHighContrast) {
        setIsHighContrast(e.matches);
        if (e.matches) {
          document.documentElement.classList.add('high-contrast');
        } else {
          document.documentElement.classList.remove('high-contrast');
        }
      }
    };

    const handleMotionChange = (e: MediaQueryListEvent) => {
      if (!isReducedMotion) {
        setIsReducedMotion(e.matches);
        if (e.matches) {
          document.documentElement.classList.add('reduced-motion');
        } else {
          document.documentElement.classList.remove('reduced-motion');
        }
      }
    };

    mediaQuery.addEventListener('change', handleContrastChange);
    motionQuery.addEventListener('change', handleMotionChange);

    return () => {
      mediaQuery.removeEventListener('change', handleContrastChange);
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, [isHighContrast, isReducedMotion]);

  // Apply font size changes
  useEffect(() => {
    document.documentElement.style.fontSize = fontSize === 'small' ? '0.875rem' : 
                                              fontSize === 'medium' ? '1rem' : 
                                              '1.125rem';
  }, [fontSize]);

  const toggleHighContrast = () => {
    const newContrast = !isHighContrast;
    setIsHighContrast(newContrast);
    if (newContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  };

  const setFontSizeInternal = (size: 'small' | 'medium' | 'large') => {
    setFontSize(size);
  };

  const toggleReducedMotion = () => {
    const newMotion = !isReducedMotion;
    setIsReducedMotion(newMotion);
    if (newMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
  };

  const toggleScreenReaderMode = () => {
    setIsScreenReaderMode(!isScreenReaderMode);
  };

  const announce = (message: string) => {
    setAnnouncement(message);
    // Clear announcement after a short delay
    setTimeout(() => setAnnouncement(''), 1000);
  };

  const value: AccessibilityContextType = {
    isHighContrast,
    fontSize,
    isReducedMotion,
    isScreenReaderMode,
    toggleHighContrast,
    setFontSize: setFontSizeInternal,
    toggleReducedMotion,
    toggleScreenReaderMode,
    announce,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      {/* Screen reader announcement element */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {announcement}
      </div>
    </AccessibilityContext.Provider>
  );
};
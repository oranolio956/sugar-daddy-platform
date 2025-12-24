'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseAccessibilityOptions {
  ariaLabel?: string;
  role?: string;
  description?: string;
  keyboardNavigation?: boolean;
  focusManagement?: boolean;
  screenReaderAnnouncement?: string;
}

export const useAccessibility = (options: UseAccessibilityOptions = {}) => {
  const {
    ariaLabel,
    role,
    description,
    keyboardNavigation = true,
    focusManagement = true,
    screenReaderAnnouncement,
  } = options;

  const elementRef = useRef<HTMLElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!keyboardNavigation) return;

    const { key, target } = event;
    const element = target as HTMLElement;
    
    // Common keyboard shortcuts
    switch (key) {
      case 'Enter':
      case ' ':
        if (element.tagName === 'BUTTON' || element.getAttribute('role') === 'button') {
          event.preventDefault();
          element.click();
        }
        break;
      case 'Escape':
        // Close modals, dropdowns, etc.
        const modal = element.closest('[role="dialog"], [role="menu"], [role="alertdialog"]');
        if (modal) {
          const closeButton = modal.querySelector('[data-close], [aria-label="Close"]');
          if (closeButton) {
            (closeButton as HTMLElement).click();
          }
        }
        break;
      case 'Tab':
        // Enhanced tab navigation
        if (element.classList.contains('skip-link')) {
          event.preventDefault();
          const targetId = element.getAttribute('href')?.replace('#', '');
          if (targetId) {
            const targetElement = document.getElementById(targetId);
            targetElement?.focus();
          }
        }
        break;
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        // Handle arrow key navigation for lists, grids, etc.
        handleArrowNavigation(event, element);
        break;
    }
  }, [keyboardNavigation]);

  // Focus management
  const handleFocus = useCallback(() => {
    if (focusManagement) {
      setIsFocused(true);
      // Announce focus for screen readers
      if (screenReaderAnnouncement) {
        announceToScreenReader(screenReaderAnnouncement);
      }
    }
  }, [focusManagement, screenReaderAnnouncement]);

  const handleBlur = useCallback(() => {
    if (focusManagement) {
      setIsFocused(false);
    }
  }, [focusManagement]);

  // Arrow key navigation for lists and grids
  const handleArrowNavigation = useCallback((event: KeyboardEvent, element: HTMLElement) => {
    const key = event.key;
    const parent = element.parentElement;
    
    if (!parent) return;

    const items = Array.from(parent.children) as HTMLElement[];
    const currentIndex = items.indexOf(element);
    
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;

    switch (key) {
      case 'ArrowDown':
        nextIndex = Math.min(currentIndex + 1, items.length - 1);
        break;
      case 'ArrowUp':
        nextIndex = Math.max(currentIndex - 1, 0);
        break;
      case 'ArrowRight':
        // For horizontal lists or grids
        nextIndex = Math.min(currentIndex + 1, items.length - 1);
        break;
      case 'ArrowLeft':
        // For horizontal lists or grids
        nextIndex = Math.max(currentIndex - 1, 0);
        break;
    }

    if (nextIndex !== currentIndex) {
      event.preventDefault();
      items[nextIndex].focus();
    }
  }, []);

  // Screen reader announcement
  const announceToScreenReader = useCallback((message: string) => {
    const announcer = document.getElementById('screen-reader-announcer');
    if (announcer) {
      announcer.textContent = message;
      // Clear after a short delay
      setTimeout(() => {
        if (announcer) announcer.textContent = '';
      }, 1000);
    }
  }, []);

  // Focus trap for modals
  const createFocusTrap = useCallback((container: HTMLElement) => {
    if (!focusManagement) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleFocusTrap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleFocusTrap);
    
    return () => {
      container.removeEventListener('keydown', handleFocusTrap);
    };
  }, [focusManagement]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Add event listeners
    element.addEventListener('keydown', handleKeyDown);
    element.addEventListener('focus', handleFocus);
    element.addEventListener('blur', handleBlur);

    // Set ARIA attributes
    if (ariaLabel) {
      element.setAttribute('aria-label', ariaLabel);
    }
    if (role) {
      element.setAttribute('role', role);
    }
    if (description) {
      const descriptionId = `desc-${Math.random().toString(36).substr(2, 9)}`;
      element.setAttribute('aria-describedby', descriptionId);
      // Create description element if it doesn't exist
      if (!document.getElementById(descriptionId)) {
        const descElement = document.createElement('div');
        descElement.id = descriptionId;
        descElement.className = 'sr-only';
        descElement.textContent = description;
        document.body.appendChild(descElement);
      }
    }

    // Create screen reader announcer if it doesn't exist
    if (!document.getElementById('screen-reader-announcer')) {
      const announcer = document.createElement('div');
      announcer.id = 'screen-reader-announcer';
      announcer.className = 'sr-only';
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      document.body.appendChild(announcer);
    }

    return () => {
      element.removeEventListener('keydown', handleKeyDown);
      element.removeEventListener('focus', handleFocus);
      element.removeEventListener('blur', handleBlur);
    };
  }, [handleKeyDown, handleFocus, handleBlur, ariaLabel, role, description]);

  return {
    ref: elementRef,
    isFocused,
    createFocusTrap,
    announceToScreenReader,
  };
};

// Utility function to check color contrast
export const checkColorContrast = (foreground: string, background: string): number => {
  // This is a simplified version - in production, you'd want a more robust implementation
  const getLuminance = (color: string): number => {
    // Convert hex to RGB
    let r: number, g: number, b: number;
    if (color.length === 4) {
      r = parseInt(color[1] + color[1], 16);
      g = parseInt(color[2] + color[2], 16);
      b = parseInt(color[3] + color[3], 16);
    } else {
      r = parseInt(color.slice(1, 3), 16);
      g = parseInt(color.slice(3, 5), 16);
      b = parseInt(color.slice(5, 7), 16);
    }
    
    // Calculate relative luminance
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const lum1 = getLuminance(foreground);
  const lum2 = getLuminance(background);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
};

// Utility to generate accessible color combinations
export const generateAccessibleColors = (baseColor: string): { text: string; background: string } => {
  // This would implement a color generation algorithm
  // For now, return a safe combination
  return {
    text: '#1a1a1a',
    background: '#ffffff',
  };
};
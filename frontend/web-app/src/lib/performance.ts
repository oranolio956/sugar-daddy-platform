import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Performance monitoring and optimization utilities
 */

// Performance metrics interface
interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  bundleSize: number;
  renderTime: number;
}

// Bundle analysis interface
interface BundleAnalysis {
  totalSize: number;
  chunkSizes: Record<string, number>;
  largestChunks: string[];
  suggestions: string[];
}

/**
 * Performance monitoring hook
 */
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const startMonitoring = useCallback(() => {
    if (typeof window === 'undefined') return;

    setIsMonitoring(true);
    const startTime = performance.now();

    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        if (entry.entryType === 'paint') {
          // First Contentful Paint
          if (entry.name === 'first-contentful-paint') {
            setMetrics(prev => ({
              ...prev!,
              firstContentfulPaint: entry.startTime,
            }));
          }
        } else if (entry.entryType === 'largest-contentful-paint') {
          // Largest Contentful Paint
          setMetrics(prev => ({
            ...prev!,
            largestContentfulPaint: entry.startTime,
          }));
        } else if (entry.entryType === 'layout-shift') {
          // Cumulative Layout Shift
          if (!entry.hadRecentInput) {
            setMetrics(prev => ({
              ...prev!,
              cumulativeLayoutShift: (prev?.cumulativeLayoutShift || 0) + entry.value,
            }));
          }
        } else if (entry.entryType === 'first-input') {
          // First Input Delay
          setMetrics(prev => ({
            ...prev!,
            firstInputDelay: entry.processingStart - entry.startTime,
          }));
        }
      });
    });

    observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift', 'first-input'] });

    // Monitor load time
    window.addEventListener('load', () => {
      const loadTime = performance.now() - startTime;
      setMetrics(prev => ({
        ...prev!,
        loadTime,
      }));
    });

    return () => {
      observer.disconnect();
      setIsMonitoring(false);
    };
  }, []);

  return { metrics, isMonitoring, startMonitoring };
};

/**
 * Bundle size analyzer
 */
export const useBundleAnalyzer = () => {
  const [analysis, setAnalysis] = useState<BundleAnalysis | null>(null);

  const analyzeBundle = useCallback(async () => {
    if (typeof window === 'undefined') return;

    try {
      // Get performance entries for resources
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      const chunkSizes: Record<string, number> = {};
      let totalSize = 0;

      resources.forEach(resource => {
        if (resource.transferSize > 0) {
          const url = new URL(resource.name);
          const chunkName = url.pathname.split('/').pop() || resource.name;
          chunkSizes[chunkName] = resource.transferSize;
          totalSize += resource.transferSize;
        }
      });

      const largestChunks = Object.entries(chunkSizes)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name]) => name);

      const suggestions = generateOptimizationSuggestions(chunkSizes, totalSize);

      setAnalysis({
        totalSize,
        chunkSizes,
        largestChunks,
        suggestions,
      });
    } catch (error) {
      console.error('Bundle analysis failed:', error);
    }
  }, []);

  return { analysis, analyzeBundle };
};

/**
 * Memory usage monitor
 */
export const useMemoryMonitor = () => {
  const [memory, setMemory] = useState<MemoryInfo | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('memory' in performance)) return;

    const updateMemory = () => {
      setMemory((performance as any).memory);
    };

    updateMemory();
    const interval = setInterval(updateMemory, 5000);

    return () => clearInterval(interval);
  }, []);

  return memory;
};

/**
 * Virtualization hook for long lists
 */
export const useVirtualization = (
  items: any[],
  itemHeight: number,
  containerHeight: number,
  overscan = 5
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const totalHeight = items.length * itemHeight;
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(items.length - 1, startIndex + visibleCount + overscan * 2);

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalItems = items.length;

  const getItemStyle = (index: number) => ({
    position: 'absolute' as const,
    top: index * itemHeight,
    left: 0,
    right: 0,
    height: itemHeight,
  });

  return {
    visibleItems,
    totalHeight,
    startIndex,
    endIndex,
    totalItems,
    getItemStyle,
    setScrollTop,
  };
};

/**
 * Intersection Observer hook
 */
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      if (entry.isIntersecting && !hasIntersected) {
        setHasIntersected(true);
      }
    }, options);

    observer.observe(element);

    return () => observer.disconnect();
  }, [options, hasIntersected]);

  return { elementRef, isIntersecting, hasIntersected };
};

/**
 * Debounce hook
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Throttle hook
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args: Parameters<T>) => {
      if (Date.now() - lastRun.current >= delay) {
        lastRun.current = Date.now();
        callback(...args);
      }
    }) as T,
    [callback, delay]
  );
};

/**
 * Memoization with cache size limit
 */
export const useLruCache = <K, V>(maxSize: number = 100) => {
  const cache = useRef(new Map<K, V>());
  const keys = useRef<K[]>([]);

  const get = useCallback((key: K): V | undefined => {
    if (cache.current.has(key)) {
      // Move to end (most recently used)
      keys.current = keys.current.filter(k => k !== key);
      keys.current.push(key);
      return cache.current.get(key);
    }
    return undefined;
  }, []);

  const set = useCallback((key: K, value: V): void => {
    if (cache.current.has(key)) {
      cache.current.set(key, value);
      keys.current = keys.current.filter(k => k !== key);
      keys.current.push(key);
    } else {
      if (cache.current.size >= maxSize) {
        // Remove least recently used item
        const oldestKey = keys.current.shift();
        if (oldestKey) {
          cache.current.delete(oldestKey);
        }
      }
      cache.current.set(key, value);
      keys.current.push(key);
    }
  }, [maxSize]);

  const clear = useCallback(() => {
    cache.current.clear();
    keys.current.length = 0;
  }, []);

  return { get, set, clear };
};

/**
 * Performance utilities
 */
export const PerformanceUtils = {
  // Generate optimization suggestions based on bundle analysis
  generateOptimizationSuggestions: (chunkSizes: Record<string, number>, totalSize: number): string[] => {
    const suggestions: string[] = [];
    
    // Check for large chunks
    Object.entries(chunkSizes).forEach(([name, size]) => {
      if (size > 500000) { // > 500KB
        suggestions.push(`Consider code splitting for large chunk: ${name} (${Math.round(size / 1024)}KB)`);
      }
    });

    // Check total bundle size
    if (totalSize > 2000000) { // > 2MB
      suggestions.push('Total bundle size is large. Consider implementing more aggressive code splitting.');
    }

    // Check for duplicate dependencies
    const duplicatePatterns = ['lodash', 'moment', 'date-fns'];
    const foundDuplicates = duplicatePatterns.filter(pattern => 
      Object.keys(chunkSizes).some(name => name.includes(pattern))
    );

    if (foundDuplicates.length > 1) {
      suggestions.push(`Consider consolidating duplicate dependencies: ${foundDuplicates.join(', ')}`);
    }

    return suggestions;
  },

  // Measure render time
  measureRenderTime: (componentName: string, renderFn: () => void) => {
    const start = performance.now();
    renderFn();
    const end = performance.now();
    
    console.log(`${componentName} render time: ${end - start}ms`);
    return end - start;
  },

  // Check if component is rendering too often
  useRenderCounter: (componentName: string) => {
    const renderCount = useRef(0);
    
    useEffect(() => {
      renderCount.current += 1;
      if (renderCount.current > 10) {
        console.warn(`${componentName} has rendered ${renderCount.current} times. Consider memoization.`);
      }
    });

    return renderCount.current;
  },

  // Memory leak detection
  detectMemoryLeaks: () => {
    if (typeof window === 'undefined' || !('memory' in performance)) return;

    const memory = (performance as any).memory;
    const threshold = 100 * 1024 * 1024; // 100MB

    if (memory.usedJSHeapSize > threshold) {
      console.warn('High memory usage detected:', {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB',
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB',
      });
    }
  },
};

/**
 * Resource preloading utilities
 */
export const ResourcePreloader = {
  // Preload images
  preloadImages: (urls: string[]) => {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
    });
  },

  // Preload fonts
  preloadFonts: (urls: string[]) => {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.href = url;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  },

  // Preload critical CSS
  preloadCriticalCSS: (urls: string[]) => {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = url;
      document.head.appendChild(link);
    });
  },

  // Preconnect to external domains
  preconnect: (domains: string[]) => {
    domains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      document.head.appendChild(link);
    });
  },
};
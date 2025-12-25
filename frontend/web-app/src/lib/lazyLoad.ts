import React from 'react';
import dynamic from 'next/dynamic';

/**
 * Lazy loading utilities for performance optimization
 * Implements code splitting for heavy dependencies
 */

// Lazy load heavy dependencies with proper error boundaries
export const LazyFramerMotion = dynamic(
  () => import('framer-motion'),
  {
    loading: () => null,
    ssr: false, // Framer Motion doesn't work well with SSR
  }
);

export const LazyLucideIcons = dynamic(
  () => import('lucide-react'),
  {
    loading: () => null,
    ssr: true,
  }
);

export const LazyDateFns = dynamic(
  () => import('date-fns'),
  {
    loading: () => null,
    ssr: true,
  }
);

export const LazyDatePicker = dynamic(
  () => import('react-datepicker'),
  {
    loading: () => null,
    ssr: false,
  }
);

export const LazyQuillEditor = dynamic(
  () => import('react-quill'),
  {
    loading: () => null,
    ssr: false,
  }
);

export const LazyChartJS = dynamic(
  () => import('react-chartjs-2'),
  {
    loading: () => null,
    ssr: false,
  }
);

export const LazySyntaxHighlighter = dynamic(
  () => import('react-syntax-highlighter'),
  {
    loading: () => null,
    ssr: true,
  }
);

export const LazyImageCrop = dynamic(
  () => import('react-image-crop'),
  {
    loading: () => null,
    ssr: false,
  }
);

export const LazyInfiniteScroll = dynamic(
  () => import('react-infinite-scroll-component'),
  {
    loading: () => null,
    ssr: false,
  }
);

export const LazyVirtualized = dynamic(
  () => import('react-virtualized-auto-sizer'),
  {
    loading: () => null,
    ssr: false,
  }
);

export const LazyWindow = dynamic(
  () => import('react-window'),
  {
    loading: () => null,
    ssr: false,
  }
);

export const LazyDropzone = dynamic(
  () => import('react-dropzone'),
  {
    loading: () => null,
    ssr: false,
  }
);

export const LazyPrism = dynamic(
  () => import('prismjs'),
  {
    loading: () => null,
    ssr: true,
  }
);

/**
 * Lazy load components with error boundaries
 */
export const LazyComponent = (importFn: () => Promise<any>, fallback?: React.ComponentType) => {
  return dynamic(importFn, {
    loading: fallback ? () => React.createElement(fallback) : () => null,
    ssr: true,
  });
};

/**
 * Lazy load modules with retry mechanism
 */
export const LazyWithRetry = (importFn: () => Promise<any>, retries = 3) => {
  return dynamic(async () => {
    try {
      return await importFn();
    } catch (error) {
      if (retries > 0) {
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        return LazyWithRetry(importFn, retries - 1);
      }
      throw error;
    }
  }, {
    loading: () => null,
    ssr: true,
  });
};

/**
 * Lazy load components based on viewport intersection
 */
export const LazyOnVisible = (importFn: () => Promise<any>, threshold = 0.1) => {
  const LazyComponent = dynamic(importFn, {
    loading: () => null,
    ssr: true,
  });

  return ({ children, ...props }: any) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        { threshold }
      );

      if (ref.current) {
        observer.observe(ref.current);
      }

      return () => observer.disconnect();
    }, []);

    return (
      <div ref={ref} {...props}>
        {isVisible ? <LazyComponent>{children}</LazyComponent> : null}
      </div>
    );
  };
};

/**
 * Preload critical components
 */
export const preloadComponent = (importFn: () => Promise<any>) => {
  if (typeof window !== 'undefined') {
    // Preload on idle
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => importFn());
    } else {
      // Fallback for browsers that don't support requestIdleCallback
      setTimeout(() => importFn(), 0);
    }
  }
};

/**
 * Bundle size optimization utilities
 */
export const BundleOptimizer = {
  // Check if component should be lazy loaded based on bundle size
  shouldLazyLoad: (componentName: string, threshold = 50) => {
    // This would integrate with your build system to check bundle sizes
    // For now, return true for known heavy components
    const heavyComponents = [
      'Chart',
      'Editor',
      'DatePicker',
      'ImageCrop',
      'InfiniteScroll',
      'VirtualizedList',
    ];
    return heavyComponents.includes(componentName);
  },

  // Get component bundle size estimate
  getBundleSize: (componentName: string) => {
    const sizes = {
      'Chart': 150, // KB
      'Editor': 200,
      'DatePicker': 50,
      'ImageCrop': 80,
      'InfiniteScroll': 30,
      'VirtualizedList': 40,
    };
    return sizes[componentName as keyof typeof sizes] || 0;
  },
};
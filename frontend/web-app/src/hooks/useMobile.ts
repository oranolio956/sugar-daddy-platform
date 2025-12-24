// Mobile-first responsive design hook
import { useState, useEffect } from 'react';

export interface UseMobileOptions {
  breakpoints?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    xxl?: number;
  };
  throttleMs?: number;
}

export interface UseMobileReturn {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  width: number;
  height: number;
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  isTouchDevice: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
  pixelRatio: number;
}

export const useMobile = (options: UseMobileOptions = {}): UseMobileReturn => {
  const {
    breakpoints = {
      xs: 320,
      sm: 475,
      md: 640,
      lg: 768,
      xl: 1024,
      xxl: 1280,
    },
    throttleMs = 100,
  } = options;

  const [state, setState] = useState(() => {
    if (typeof window === 'undefined') {
      return {
        width: 0,
        height: 0,
        isTouchDevice: false,
        pixelRatio: 1,
      };
    }

    return {
      width: window.innerWidth,
      height: window.innerHeight,
      isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      pixelRatio: window.devicePixelRatio || 1,
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setState({
          width: window.innerWidth,
          height: window.innerHeight,
          isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
          pixelRatio: window.devicePixelRatio || 1,
        });
      }, throttleMs);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [throttleMs]);

  const { width, height, isTouchDevice, pixelRatio } = state;

  // Determine breakpoint
  let breakpoint: UseMobileReturn['breakpoint'] = 'xxl';
  if (width < breakpoints.xs!) breakpoint = 'xs';
  else if (width < breakpoints.sm!) breakpoint = 'sm';
  else if (width < breakpoints.md!) breakpoint = 'md';
  else if (width < breakpoints.lg!) breakpoint = 'lg';
  else if (width < breakpoints.xl!) breakpoint = 'xl';

  // Determine device types
  const isMobile = width < breakpoints.md!;
  const isTablet = width >= breakpoints.md! && width < breakpoints.lg!;
  const isDesktop = width >= breakpoints.lg! && width < breakpoints.xxl!;
  const isLargeDesktop = width >= breakpoints.xxl!;

  // Determine orientation
  const isPortrait = height > width;
  const isLandscape = width > height;

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    width,
    height,
    breakpoint,
    isTouchDevice,
    isPortrait,
    isLandscape,
    pixelRatio,
  };
};

// Hook for detecting specific breakpoints
export const useBreakpoint = (breakpoint: keyof NonNullable<UseMobileOptions['breakpoints']>) => {
  const { width } = useMobile();
  const breakpoints = {
    xs: 320,
    sm: 475,
    md: 640,
    lg: 768,
    xl: 1024,
    xxl: 1280,
  };

  return width >= (breakpoints[breakpoint] || 0);
};

// Hook for touch device detection
export const useTouchDevice = () => {
  const { isTouchDevice } = useMobile();
  return isTouchDevice;
};

// Hook for orientation detection
export const useOrientation = () => {
  const { isPortrait, isLandscape } = useMobile();
  return { isPortrait, isLandscape };
};

// Hook for viewport dimensions
export const useViewport = () => {
  const { width, height } = useMobile();
  return { width, height };
};

// Hook for pixel ratio
export const usePixelRatio = () => {
  const { pixelRatio } = useMobile();
  return pixelRatio;
};

// Hook for mobile-first responsive values
export const useResponsiveValue = <T>(
  values: {
    xs?: T;
    sm?: T;
    md?: T;
    lg?: T;
    xl?: T;
    xxl?: T;
  }
): T => {
  const { breakpoint } = useMobile();

  // Return the value for the current breakpoint, falling back to smaller breakpoints
  return (
    values[breakpoint] ??
    values.xl ??
    values.lg ??
    values.md ??
    values.sm ??
    values.xs ??
    (Object.values(values)[0] as T)
  );
};

// Hook for mobile-first responsive styles
export const useResponsiveStyles = <T extends Record<string, any>>(
  styles: {
    xs?: Partial<T>;
    sm?: Partial<T>;
    md?: Partial<T>;
    lg?: Partial<T>;
    xl?: Partial<T>;
    xxl?: Partial<T>;
  }
): Partial<T> => {
  const { breakpoint } = useMobile();

  // Merge styles from smallest to largest breakpoint
  const baseStyles = styles.xs || {};
  const smStyles = styles.sm ? { ...baseStyles, ...styles.sm } : baseStyles;
  const mdStyles = styles.md ? { ...smStyles, ...styles.md } : smStyles;
  const lgStyles = styles.lg ? { ...mdStyles, ...styles.lg } : mdStyles;
  const xlStyles = styles.xl ? { ...lgStyles, ...styles.xl } : lgStyles;
  const xxlStyles = styles.xxl ? { ...xlStyles, ...styles.xxl } : xlStyles;

  switch (breakpoint) {
    case 'xs':
      return baseStyles;
    case 'sm':
      return smStyles;
    case 'md':
      return mdStyles;
    case 'lg':
      return lgStyles;
    case 'xl':
      return xlStyles;
    case 'xxl':
      return xxlStyles;
    default:
      return baseStyles;
  }
};

// Hook for mobile-first responsive grid columns
export const useResponsiveGrid = (columns: {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  xxl?: number;
}) => {
  const { breakpoint } = useMobile();

  return (
    columns[breakpoint] ??
    columns.xl ??
    columns.lg ??
    columns.md ??
    columns.sm ??
    columns.xs ??
    1
  );
};

// Hook for mobile-first responsive spacing
export const useResponsiveSpacing = (spacing: {
  xs?: number | string;
  sm?: number | string;
  md?: number | string;
  lg?: number | string;
  xl?: number | string;
  xxl?: number | string;
}) => {
  const { breakpoint } = useMobile();

  return (
    spacing[breakpoint] ??
    spacing.xl ??
    spacing.lg ??
    spacing.md ??
    spacing.sm ??
    spacing.xs ??
    0
  );
};

// Hook for mobile-first responsive typography
export const useResponsiveTypography = (typography: {
  xs?: { fontSize: number | string; lineHeight?: number | string };
  sm?: { fontSize: number | string; lineHeight?: number | string };
  md?: { fontSize: number | string; lineHeight?: number | string };
  lg?: { fontSize: number | string; lineHeight?: number | string };
  xl?: { fontSize: number | string; lineHeight?: number | string };
  xxl?: { fontSize: number | string; lineHeight?: number | string };
}) => {
  const { breakpoint } = useMobile();

  return (
    typography[breakpoint] ??
    typography.xl ??
    typography.lg ??
    typography.md ??
    typography.sm ??
    typography.xs ??
    { fontSize: 16 }
  );
};

// Hook for mobile-first responsive animations
export const useResponsiveAnimation = (animations: {
  xs?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  xxl?: string;
}) => {
  const { breakpoint, isMobile } = useMobile();

  // Disable animations on mobile for performance if not specified
  if (isMobile && !animations.xs && !animations.sm && !animations.md) {
    return 'none';
  }

  return (
    animations[breakpoint] ??
    animations.xl ??
    animations.lg ??
    animations.md ??
    animations.sm ??
    animations.xs ??
    'ease'
  );
};

// Hook for mobile-first responsive shadows
export const useResponsiveShadow = (shadows: {
  xs?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  xxl?: string;
}) => {
  const { breakpoint } = useMobile();

  return (
    shadows[breakpoint] ??
    shadows.xl ??
    shadows.lg ??
    shadows.md ??
    shadows.sm ??
    shadows.xs ??
    'none'
  );
};

// Hook for mobile-first responsive z-index
export const useResponsiveZIndex = (zIndices: {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  xxl?: number;
}) => {
  const { breakpoint } = useMobile();

  return (
    zIndices[breakpoint] ??
    zIndices.xl ??
    zIndices.lg ??
    zIndices.md ??
    zIndices.sm ??
    zIndices.xs ??
    0
  );
};
// Mobile-first CSS-in-JS styles for comprehensive mobile responsiveness
import { css } from 'styled-components';

// Touch target utilities
export const touchTarget = css`
  min-height: 44px;
  min-width: 44px;
  padding: 12px 16px;
  border-radius: 12px;
`;

export const touchTargetLg = css`
  min-height: 48px;
  min-width: 48px;
  padding: 14px 20px;
  border-radius: 14px;
`;

export const touchTargetXl = css`
  min-height: 56px;
  min-width: 56px;
  padding: 16px 24px;
  border-radius: 16px;
`;

// Mobile spacing utilities
export const mobilePadding = css`
  padding: 16px;
`;

export const mobilePaddingLg = css`
  padding: 24px;
`;

export const mobileMargin = css`
  margin: 16px;
`;

export const mobileMarginLg = css`
  margin: 24px;
`;

// Mobile typography utilities
export const mobileTextSm = css`
  font-size: 14px;
  line-height: 1.4;
`;

export const mobileTextBase = css`
  font-size: 16px;
  line-height: 1.5;
`;

export const mobileTextLg = css`
  font-size: 18px;
  line-height: 1.6;
`;

export const mobileTextXl = css`
  font-size: 20px;
  line-height: 1.5;
`;

// Mobile form utilities
export const mobileInput = css`
  height: 48px;
  padding: 12px 16px;
  font-size: 16px;
  border-radius: 12px;
  border: 1px solid #374151;
  background-color: #111827;
  color: #ffffff;
`;

export const mobileInputLg = css`
  height: 56px;
  padding: 14px 18px;
  font-size: 18px;
  border-radius: 14px;
  border: 1px solid #374151;
  background-color: #111827;
  color: #ffffff;
`;

// Mobile button utilities
export const mobileButton = css`
  height: 44px;
  padding: 12px 16px;
  font-size: 16px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
`;

export const mobileButtonLg = css`
  height: 48px;
  padding: 14px 20px;
  font-size: 18px;
  border-radius: 14px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
`;

// Mobile card utilities
export const mobileCard = css`
  border-radius: 16px;
  padding: 16px;
  margin: 16px;
  background-color: #111827;
  border: 1px solid #374151;
`;

export const mobileCardLg = css`
  border-radius: 20px;
  padding: 20px;
  margin: 20px;
  background-color: #111827;
  border: 1px solid #374151;
`;

// Mobile layout utilities
export const mobileContainer = css`
  max-width: 100%;
  width: 100%;
  margin: 0 auto;
  padding: 0 16px;
`;

export const mobileContainerLg = css`
  max-width: 100%;
  width: 100%;
  margin: 0 auto;
  padding: 0 24px;
`;

// Mobile grid utilities
export const mobileGrid = css`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
`;

export const mobileGridTwo = css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

export const mobileGridThree = css`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
`;

// Mobile flex utilities
export const mobileFlex = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const mobileFlexRow = css`
  display: flex;
  flex-direction: row;
  gap: 16px;
`;

export const mobileFlexCenter = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

// Mobile responsive breakpoints
export const breakpoints = {
  xs: 320,
  sm: 475,
  md: 640,
  lg: 768,
  xl: 1024,
  xxl: 1280,
};

// Media query helpers
export const mq = {
  xs: `@media (min-width: ${breakpoints.xs}px)`,
  sm: `@media (min-width: ${breakpoints.sm}px)`,
  md: `@media (min-width: ${breakpoints.md}px)`,
  lg: `@media (min-width: ${breakpoints.lg}px)`,
  xl: `@media (min-width: ${breakpoints.xl}px)`,
  xxl: `@media (min-width: ${breakpoints.xxl}px)`,
};

// Mobile navigation styles
export const mobileNav = css`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background-color: #0b1220;
  border-bottom: 1px solid #374151;
  padding: 16px;
`;

export const mobileNavOverlay = css`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 40;
  backdrop-filter: blur(4px);
`;

export const mobileSidebar = css`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  background-color: #0b1220;
  border-right: 1px solid #374151;
  z-index: 50;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  padding: 16px;
`;

export const mobileSidebarOpen = css`
  transform: translateX(0);
`;

// Mobile form validation styles
export const mobileFormError = css`
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
`;

export const mobileFormSuccess = css`
  border-color: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
`;

// Mobile loading states
export const mobileSkeleton = css`
  background-color: #374151;
  border-radius: 8px;
  animation: pulse 1.5s ease-in-out infinite;
`;

// Mobile accessibility styles
export const mobileFocus = css`
  outline: 2px solid #f59e0b;
  outline-offset: 2px;
`;

export const mobileSkipLink = css`
  position: absolute;
  top: -40px;
  left: 6px;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 100;
  
  &:focus {
    top: 6px;
  }
`;

// Mobile gesture styles
export const mobileSwipeable = css`
  touch-action: pan-y;
  -webkit-overflow-scrolling: touch;
`;

export const mobileDraggable = css`
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
`;

// Mobile performance optimizations
export const mobileOptimized = css`
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
`;

// Mobile typography scale
export const typographyScale = {
  xs: '12px',
  sm: '14px',
  base: '16px',
  lg: '18px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '30px',
  '4xl': '36px',
  '5xl': '48px',
  '6xl': '60px',
  '7xl': '72px',
  '8xl': '96px',
  '9xl': '128px',
};

// Mobile color palette
export const colors = {
  primary: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  yellow: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
};

// Mobile animation utilities
export const animations = {
  fadeIn: 'opacity 0.3s ease-in-out',
  slideUp: 'transform 0.3s ease-out, opacity 0.3s ease-out',
  slideDown: 'transform 0.3s ease-out, opacity 0.3s ease-out',
  scaleIn: 'transform 0.2s ease-out',
  pulse: 'opacity 1s ease-in-out infinite',
  bounce: 'transform 1s infinite',
};

// Mobile shadow utilities
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none',
};

// Mobile border radius utilities
export const borderRadius = {
  none: '0',
  sm: '0.125rem',
  base: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
};

// Mobile spacing scale
export const spacing = {
  px: '1px',
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
  40: '10rem',
  48: '12rem',
  56: '14rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
};

// Mobile z-index scale
export const zIndex = {
  auto: 'auto',
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  60: '60',
  70: '70',
  80: '80',
  90: '90',
  100: '100',
  max: '9999',
};

// Export all mobile styles as a single object
export const mobileStyles = {
  touchTarget,
  touchTargetLg,
  touchTargetXl,
  mobilePadding,
  mobilePaddingLg,
  mobileMargin,
  mobileMarginLg,
  mobileTextSm,
  mobileTextBase,
  mobileTextLg,
  mobileTextXl,
  mobileInput,
  mobileInputLg,
  mobileButton,
  mobileButtonLg,
  mobileCard,
  mobileCardLg,
  mobileContainer,
  mobileContainerLg,
  mobileGrid,
  mobileGridTwo,
  mobileGridThree,
  mobileFlex,
  mobileFlexRow,
  mobileFlexCenter,
  breakpoints,
  mq,
  mobileNav,
  mobileNavOverlay,
  mobileSidebar,
  mobileSidebarOpen,
  mobileFormError,
  mobileFormSuccess,
  mobileSkeleton,
  mobileFocus,
  mobileSkipLink,
  mobileSwipeable,
  mobileDraggable,
  mobileOptimized,
  typographyScale,
  colors,
  animations,
  shadows,
  borderRadius,
  spacing,
  zIndex,
};
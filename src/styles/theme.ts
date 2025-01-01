import { Theme } from '../types/ui';

export const theme: Theme = {
  colors: {
    primary: '#2563eb', // Blue
    secondary: '#4f46e5', // Indigo
    success: '#16a34a', // Green
    warning: '#eab308', // Yellow
    error: '#dc2626', // Red
    info: '#0891b2', // Cyan
    background: '#f8fafc', // Slate 50
    surface: '#ffffff', // White
    text: {
      primary: '#1e293b', // Slate 800
      secondary: '#64748b', // Slate 500
      disabled: '#94a3b8', // Slate 400
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  transitions: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  zIndex: {
    modal: 1000,
    toast: 2000,
    dropdown: 500,
    tooltip: 1500,
  },
};

// Utility functions for using theme values
export const getColor = (color: keyof Theme['colors'] | string): string => {
  if (color in theme.colors) {
    return theme.colors[color as keyof Theme['colors']];
  }
  return color;
};

export const getFontSize = (size: keyof Theme['typography']['fontSize']): string => {
  return theme.typography.fontSize[size];
};

export const getSpacing = (space: keyof Theme['spacing']): string => {
  return theme.spacing[space];
};

export const getBreakpoint = (breakpoint: keyof Theme['breakpoints']): string => {
  return theme.breakpoints[breakpoint];
};

// Media query helpers
export const media = {
  sm: `@media (min-width: ${theme.breakpoints.sm})`,
  md: `@media (min-width: ${theme.breakpoints.md})`,
  lg: `@media (min-width: ${theme.breakpoints.lg})`,
  xl: `@media (min-width: ${theme.breakpoints.xl})`,
  '2xl': `@media (min-width: ${theme.breakpoints['2xl']})`,
};

// CSS helper functions
export const createTransition = (
  properties: string[],
  duration: keyof Theme['transitions'] = 'normal',
  easing = 'ease-in-out'
): string => {
  return properties
    .map((prop) => `${prop} ${theme.transitions[duration]} ${easing}`)
    .join(', ');
};

export const rgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Common style mixins
export const mixins = {
  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  absoluteFill: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  truncate: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  scrollbar: {
    '::-webkit-scrollbar': {
      width: '6px',
      height: '6px',
    },
    '::-webkit-scrollbar-track': {
      background: rgba(theme.colors.text.primary, 0.1),
    },
    '::-webkit-scrollbar-thumb': {
      background: rgba(theme.colors.text.primary, 0.2),
      borderRadius: theme.borderRadius.full,
    },
  },
} as const;

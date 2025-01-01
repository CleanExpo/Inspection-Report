import { useMemo } from 'react';
import { useTheme, ThemeConfig } from '../utils/theme';

/**
 * Hook to get contrast color (black or white) based on background color
 */
export function useContrastColor(backgroundColor: string) {
  return useMemo(() => {
    // Convert hex to RGB
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }, [backgroundColor]);
}

/**
 * Hook to get theme-aware color with optional opacity
 */
export function useThemeColor(colorVar: keyof ThemeConfig['colors'], opacity?: number) {
  const { theme } = useTheme();
  
  return useMemo(() => {
    const color = theme.colors[colorVar];
    if (!opacity || opacity === 1) return color;
    
    // Convert hex to RGBA
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }, [theme.colors, colorVar, opacity]);
}

/**
 * Hook to get theme-aware spacing value
 */
export function useThemeSpacing(size: keyof ThemeConfig['spacing']) {
  const { theme } = useTheme();
  return theme.spacing[size];
}

/**
 * Hook to check if current theme is dark mode
 */
export function useIsDarkMode() {
  const { theme } = useTheme();
  return theme.mode === 'dark';
}

/**
 * Hook to get theme-aware styles with media query support
 */
export function useThemeResponsive<T>(
  stylesFn: (theme: ThemeConfig) => T,
  breakpoints?: {
    sm?: Partial<T>;
    md?: Partial<T>;
    lg?: Partial<T>;
  }
) {
  const { theme } = useTheme();
  
  return useMemo(() => {
    const baseStyles = stylesFn(theme);
    
    if (!breakpoints) return baseStyles;
    
    return {
      ...baseStyles,
      '@media (min-width: 640px)': breakpoints.sm,
      '@media (min-width: 768px)': breakpoints.md,
      '@media (min-width: 1024px)': breakpoints.lg,
    };
  }, [theme, breakpoints]);
}

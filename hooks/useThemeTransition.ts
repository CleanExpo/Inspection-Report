import { useEffect, useState } from 'react';
import { useTheme, ThemeMode } from '../utils/theme';

/**
 * Hook to handle smooth transitions between themes
 * Applies transition classes to handle animation of color changes
 */
export function useThemeTransition() {
  const { theme } = useTheme();

  useEffect(() => {
    // Add transition class to body when theme changes
    document.body.classList.add('theme-transition');

    // Remove transition class after animation completes
    const timeout = setTimeout(() => {
      document.body.classList.remove('theme-transition');
    }, 200); // Match duration in theme.tsx

    return () => {
      clearTimeout(timeout);
      document.body.classList.remove('theme-transition');
    };
  }, [theme.mode]);

  // Add global styles for theme transitions
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .theme-transition,
      .theme-transition *,
      .theme-transition *::before,
      .theme-transition *::after {
        transition: all var(--transition-duration) var(--transition-timing) !important;
        transition-property: background-color, color, border-color, outline-color, box-shadow !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return theme.mode;
}

/**
 * Hook to handle theme transition with loading state
 * Useful for components that need to handle heavy theme-dependent calculations
 */
export function useThemeTransitionWithLoading() {
  const { theme } = useTheme();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    const timeout = setTimeout(() => {
      setIsTransitioning(false);
    }, 200); // Match duration in theme.tsx

    return () => clearTimeout(timeout);
  }, [theme.mode]);

  return {
    currentTheme: theme,
    isTransitioning
  };
}

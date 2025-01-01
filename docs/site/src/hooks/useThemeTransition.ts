import { useEffect, useCallback, useState } from 'react';
import { Theme } from '../types/theme';

const TRANSITION_DURATION = 200; // Match CSS transition duration

export function useThemeTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionClass, setTransitionClass] = useState('');

  // Start theme transition
  const startTransition = useCallback(() => {
    setIsTransitioning(true);
    setTransitionClass('theme-transition-active');

    // Remove transition class after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
      setTransitionClass('');
    }, TRANSITION_DURATION);
  }, []);

  // Apply theme with transition
  const applyThemeWithTransition = useCallback((
    theme: Theme,
    applyFn: (colors: Theme['colors']) => void
  ) => {
    startTransition();
    
    // Apply new theme colors
    requestAnimationFrame(() => {
      applyFn(theme.colors);
    });
  }, [startTransition]);

  // Clean up any ongoing transitions
  useEffect(() => {
    return () => {
      setIsTransitioning(false);
      setTransitionClass('');
    };
  }, []);

  return {
    isTransitioning,
    transitionClass,
    applyThemeWithTransition
  };
}

// Helper to apply theme colors to document
export function applyThemeColors(colors: Theme['colors']) {
  Object.entries(colors).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--color-${key}`, value);
  });
}

// Helper to remove theme colors from document
export function removeThemeColors(colors: Theme['colors']) {
  Object.keys(colors).forEach(key => {
    document.documentElement.style.removeProperty(`--color-${key}`);
  });
}

// Helper to get computed theme colors
export function getComputedThemeColors(): Partial<Theme['colors']> {
  const computedStyle = getComputedStyle(document.documentElement);
  const colors: Partial<Theme['colors']> = {};

  // Get all CSS custom properties that start with --color-
  for (let i = 0; i < computedStyle.length; i++) {
    const prop = computedStyle[i];
    if (prop.startsWith('--color-')) {
      const key = prop.replace('--color-', '') as keyof Theme['colors'];
      colors[key] = computedStyle.getPropertyValue(prop).trim();
    }
  }

  return colors;
}

// Helper to check if theme transition is supported
export function isThemeTransitionSupported(): boolean {
  return CSS.supports('transition', 'background-color 0.2s ease-in-out') &&
         !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

import { useState, useEffect, useCallback } from 'react';
import { Theme, ThemeName, themes } from './themeConfig';

const THEME_STORAGE_KEY = 'docs-theme-preference';

// Type guard to validate stored theme name
const isValidThemeName = (value: unknown): value is ThemeName => {
  return typeof value === 'string' && value in themes;
};

// Safe localStorage wrapper with type checking
const storage = {
  getItem(): ThemeName | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const storedValue = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (!storedValue) return null;
      
      const parsed = JSON.parse(storedValue);
      return isValidThemeName(parsed) ? parsed : null;
    } catch {
      return null;
    }
  },

  setItem(value: ThemeName): void {
    if (typeof window === 'undefined') return;
    
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  }
};

// Custom hook for theme management
export const useTheme = () => {
  const [themeName, setThemeNameState] = useState<ThemeName>('light');
  const [theme, setThemeState] = useState<Theme>(themes.light);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = storage.getItem();
    if (savedTheme) {
      setThemeNameState(savedTheme);
      setThemeState(themes[savedTheme]);
    } else if (typeof window !== 'undefined' && window.matchMedia) {
      // Check system preference if no saved theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const defaultTheme = prefersDark ? 'dark' : 'light';
      setThemeNameState(defaultTheme);
      setThemeState(themes[defaultTheme]);
    }
  }, []);

  // Update localStorage when theme changes
  const setThemeName = useCallback((name: ThemeName) => {
    storage.setItem(name);
    setThemeNameState(name);
    setThemeState(themes[name]);
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    const newThemeName = themeName === 'light' ? 'dark' : 'light';
    setThemeName(newThemeName);
  }, [themeName, setThemeName]);

  return {
    theme,
    setTheme,
    themeName,
    setThemeName,
    toggleTheme,
  };
};

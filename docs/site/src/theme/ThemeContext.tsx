import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { Theme, ThemeName, themes } from './themeConfig';

interface ThemeContextType {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'docs-theme-preference';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize theme from storage or system preference
  const [themeName, setThemeName] = useState<ThemeName>(() => {
    if (typeof window === 'undefined') return 'light';
    
    // Check local storage first
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeName | null;
    if (stored && themes[stored]) return stored;
    
    // Fall back to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Get the current theme object
  const theme = useMemo(() => themes[themeName], [themeName]);

  // Handle system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      // Only update if user hasn't explicitly set a preference
      if (!stored) {
        setThemeName(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Update theme and persist to storage
  const setTheme = useCallback((name: ThemeName) => {
    setThemeName(name);
    localStorage.setItem(THEME_STORAGE_KEY, name);
    
    // Update document root class for global CSS
    document.documentElement.classList.remove('theme-light', 'theme-dark');
    document.documentElement.classList.add(`theme-${name}`);
  }, []);

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    setTheme(themeName === 'light' ? 'dark' : 'light');
  }, [themeName, setTheme]);

  // Set initial document class
  useEffect(() => {
    document.documentElement.classList.add(`theme-${themeName}`);
  }, []);

  const contextValue = useMemo(
    () => ({
      theme,
      themeName,
      setTheme,
      toggleTheme,
    }),
    [theme, themeName, setTheme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

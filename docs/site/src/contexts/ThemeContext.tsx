import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type {
  Theme,
  ThemeMode,
  ThemeContextValue,
  ThemeProviderProps
} from '../types/theme';
import { defaultThemes } from './defaultThemes';
import { themeStorage } from '../utils/themeStorage';
import { useThemeTransition, applyThemeColors } from '../hooks/useThemeTransition';
import { getAccessibleTextColor } from '../utils/themeUtils';

// Create Theme Context
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// Default theme and mode
const DEFAULT_THEME = defaultThemes[0];
const DEFAULT_MODE: ThemeMode = 'system';

export function ThemeProvider({
  children,
  defaultTheme = DEFAULT_THEME,
  defaultMode = DEFAULT_MODE
}: ThemeProviderProps) {
  // Initialize state with saved values or defaults
  const [theme, setTheme] = useState<Theme>(() => 
    themeStorage.loadTheme() || defaultTheme
  );
  const [mode, setMode] = useState<ThemeMode>(() => 
    themeStorage.loadMode() || defaultMode
  );
  const [systemMode, setSystemMode] = useState<'light' | 'dark'>('light');
  const [customThemes, setCustomThemes] = useState<Theme[]>(() =>
    themeStorage.loadCustomThemes()
  );

  // Handle system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemMode(e.matches ? 'dark' : 'light');
    };

    // Set initial value
    setSystemMode(mediaQuery.matches ? 'dark' : 'light');

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const { isTransitioning, transitionClass, applyThemeWithTransition } = useThemeTransition();

  // Apply theme to document with transition
  const applyTheme = useCallback((newTheme: Theme, newMode: ThemeMode) => {
    const currentMode = newMode === 'system' ? systemMode : newMode;
    document.documentElement.setAttribute('data-theme', currentMode);
    
    // Apply theme colors with transition
    applyThemeWithTransition(newTheme, (colors) => {
      applyThemeColors(colors);
      
      // Update text color based on background for better contrast
      const textColor = getAccessibleTextColor(colors.background);
      document.documentElement.style.setProperty('--color-text', textColor);
    });
  }, [systemMode, applyThemeWithTransition]);

  // Update theme when changed
  useEffect(() => {
    applyTheme(theme, mode);
  }, [theme, mode, applyTheme]);

  // Save theme changes to storage
  useEffect(() => {
    themeStorage.saveTheme(theme);
  }, [theme]);

  useEffect(() => {
    themeStorage.saveMode(mode);
  }, [mode]);

  useEffect(() => {
    themeStorage.saveCustomThemes(customThemes);
  }, [customThemes]);

  // Add custom theme
  const addCustomTheme = (newTheme: Theme) => {
    setCustomThemes(prev => [...prev, newTheme]);
  };

  // Remove custom theme
  const removeCustomTheme = (themeId: string) => {
    setCustomThemes(prev => prev.filter(theme => theme.id !== themeId));
    
    // If current theme is being removed, switch to default
    if (theme.id === themeId) {
      setTheme(DEFAULT_THEME);
    }
  };

  const value: ThemeContextValue = {
    theme,
    mode,
    setTheme,
    setMode,
    addCustomTheme,
    removeCustomTheme,
    customThemes,
    systemMode,
    isTransitioning,
    transitionClass
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

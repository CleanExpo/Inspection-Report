import React, { createContext, useContext, useEffect, useState } from 'react';

// Theme configuration types
export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
}

export interface ThemeConfig {
  mode: ThemeMode;
  colors: ThemeColors;
  borderRadius: string;
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  transitions: {
    duration: string;
    timing: string;
  };
}

// Default theme configurations
export const lightTheme: ThemeColors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  background: '#FFFFFF',
  surface: '#F2F2F7',
  text: '#000000',
  textSecondary: '#6C6C6C',
  border: '#C6C6C8',
  error: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500'
};

export const darkTheme: ThemeColors = {
  primary: '#0A84FF',
  secondary: '#5E5CE6',
  background: '#000000',
  surface: '#1C1C1E',
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  border: '#38383A',
  error: '#FF453A',
  success: '#32D74B',
  warning: '#FF9F0A'
};

const defaultConfig: ThemeConfig = {
  mode: 'light',
  colors: lightTheme,
  borderRadius: '8px',
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  },
  transitions: {
    duration: '200ms',
    timing: 'ease-in-out'
  }
};

// Theme context
interface ThemeContextType {
  theme: ThemeConfig;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: defaultConfig,
  setTheme: () => {},
  toggleTheme: () => {}
});

// Theme hook
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// CSS variable generator
export function generateThemeVars(theme: ThemeConfig): string {
  return `
    :root {
      --primary: ${theme.colors.primary};
      --secondary: ${theme.colors.secondary};
      --background: ${theme.colors.background};
      --surface: ${theme.colors.surface};
      --text: ${theme.colors.text};
      --text-secondary: ${theme.colors.textSecondary};
      --border: ${theme.colors.border};
      --error: ${theme.colors.error};
      --success: ${theme.colors.success};
      --warning: ${theme.colors.warning};
      
      --border-radius: ${theme.borderRadius};
      
      --spacing-xs: ${theme.spacing.xs};
      --spacing-sm: ${theme.spacing.sm};
      --spacing-md: ${theme.spacing.md};
      --spacing-lg: ${theme.spacing.lg};
      --spacing-xl: ${theme.spacing.xl};
      
      --transition-duration: ${theme.transitions.duration};
      --transition-timing: ${theme.transitions.timing};
    }
  `;
}

// Theme provider props
interface ThemeProviderProps {
  children: React.ReactNode;
  initialMode?: ThemeMode;
}

// Theme provider component
export function ThemeProvider({ children, initialMode = 'light' }: ThemeProviderProps): JSX.Element {
  const [theme, setThemeState] = useState<ThemeConfig>({
    ...defaultConfig,
    mode: initialMode,
    colors: initialMode === 'light' ? lightTheme : darkTheme
  });

  const setTheme = (mode: ThemeMode) => {
    setThemeState({
      ...theme,
      mode,
      colors: mode === 'light' ? lightTheme : darkTheme
    });
  };

  const toggleTheme = () => {
    const newMode = theme.mode === 'light' ? 'dark' : 'light';
    setTheme(newMode);
  };

  // Update CSS variables when theme changes
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = generateThemeVars(theme);
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [theme]);

  // Sync with system theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Themed component hook
export function useThemedStyles<T>(
  stylesFn: (theme: ThemeConfig) => T
): T {
  const { theme } = useTheme();
  return stylesFn(theme);
}

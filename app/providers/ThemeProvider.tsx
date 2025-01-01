'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider as MuiThemeProvider, useMediaQuery } from '@mui/material';
import { getTheme } from '../theme';
import type { PaletteMode } from '@mui/material';

interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  fontSize: number;
  animationSpeed: number;
  enableAnimations: boolean;
}

interface ThemeContextType {
  mode: PaletteMode;
  settings: ThemeSettings;
  toggleTheme: () => void;
  setMode: (mode: PaletteMode) => void;
  updateSettings: (settings: Partial<ThemeSettings>) => void;
}

const defaultSettings: ThemeSettings = {
  primaryColor: '#1976d2',
  secondaryColor: '#9c27b0',
  fontFamily: 'Roboto',
  fontSize: 1,
  animationSpeed: 1,
  enableAnimations: true,
};

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  settings: defaultSettings,
  toggleTheme: () => {},
  setMode: () => {},
  updateSettings: () => {},
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Check system preference
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  
  // Initialize theme state from localStorage or system preference
  const [mode, setMode] = useState<PaletteMode>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('themeMode') as PaletteMode | null;
      return savedMode || (prefersDarkMode ? 'dark' : 'light');
    }
    return 'light';
  });

  // Initialize settings from localStorage or defaults
  const [settings, setSettings] = useState<ThemeSettings>(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('themeSettings');
      if (savedSettings) {
        try {
          return {
            ...defaultSettings,
            ...JSON.parse(savedSettings),
          };
        } catch (error) {
          console.error('Failed to parse theme settings:', error);
        }
      }
    }
    return defaultSettings;
  });

  // Update localStorage when theme mode changes
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  // Update localStorage when settings change
  useEffect(() => {
    localStorage.setItem('themeSettings', JSON.stringify(settings));
  }, [settings]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if no theme is saved in localStorage
      if (!localStorage.getItem('themeMode')) {
        setMode(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Generate theme with current mode and settings
  const theme = useMemo(() => {
    const baseTheme = getTheme(mode);
    return {
      ...baseTheme,
      palette: {
        ...baseTheme.palette,
        primary: {
          ...baseTheme.palette.primary,
          main: settings.primaryColor,
        },
        secondary: {
          ...baseTheme.palette.secondary,
          main: settings.secondaryColor,
        },
      },
      typography: {
        ...baseTheme.typography,
        fontFamily: settings.fontFamily,
        fontSize: 14 * settings.fontSize,
      },
      transitions: {
        ...baseTheme.transitions,
        duration: {
          ...baseTheme.transitions.duration,
          shortest: 150 / settings.animationSpeed,
          shorter: 200 / settings.animationSpeed,
          short: 250 / settings.animationSpeed,
          standard: 300 / settings.animationSpeed,
          complex: 375 / settings.animationSpeed,
          enteringScreen: 225 / settings.animationSpeed,
          leavingScreen: 195 / settings.animationSpeed,
        },
      },
      components: {
        ...baseTheme.components,
        MuiCssBaseline: {
          styleOverrides: {
            '*': settings.enableAnimations
              ? undefined
              : {
                  transition: 'none !important',
                  animation: 'none !important',
                },
          },
        },
      },
    };
  }, [mode, settings]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const updateSettings = (newSettings: Partial<ThemeSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
    }));
  };

  const contextValue = useMemo(
    () => ({
      mode,
      settings,
      toggleTheme,
      setMode,
      updateSettings,
    }),
    [mode, settings]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

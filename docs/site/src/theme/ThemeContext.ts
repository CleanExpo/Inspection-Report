import { createContext, useContext } from 'react';
import { Theme, ThemeName, themes } from './themeConfig';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themeName: ThemeName;
  setThemeName: (name: ThemeName) => void;
  toggleTheme: () => void;
}

// Create context with a default value matching the interface
export const ThemeContext = createContext<ThemeContextValue>({
  theme: themes.light,
  setTheme: () => {},
  themeName: 'light',
  setThemeName: () => {},
  toggleTheme: () => {},
});

// Custom hook for using the theme context with type safety
export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

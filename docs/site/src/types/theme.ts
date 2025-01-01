/**
 * Theme System Types
 */

export type ThemeMode = 'light' | 'dark' | 'system' | 'all';

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  accent: string;
  error: string;
  warning: string;
  success: string;
  info: string;
}

export interface Theme {
  id: string;
  name: string;
  mode: ThemeMode;
  colors: ThemeColors;
  description?: string;
  author?: string;
}

export interface ThemePreviewColors {
  primary: string;
  background: string;
  text: string;
}

export interface ThemePreview {
  id: string;
  name: string;
  mode: ThemeMode;
  thumbnail?: string;
  colors: ThemePreviewColors;
  description?: string;
}

// Type guard to check if an object is a full Theme
export function isFullTheme(theme: Theme | ThemePreview): theme is Theme {
  return 'colors' in theme && 
    'secondary' in (theme as Theme).colors &&
    'surface' in (theme as Theme).colors;
}

// Type guard to check if an object is a ThemePreview
export function isThemePreview(theme: Theme | ThemePreview): theme is ThemePreview {
  return 'colors' in theme && 
    Object.keys(theme.colors).length === 3 &&
    'primary' in theme.colors &&
    'background' in theme.colors &&
    'text' in theme.colors;
}

export interface ThemeState {
  current: Theme;
  mode: ThemeMode;
  systemMode: 'light' | 'dark';
  customThemes: Theme[];
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultMode?: ThemeMode;
}

export type ThemeContextValue = {
  theme: Theme;
  mode: ThemeMode;
  setTheme: (theme: Theme) => void;
  setMode: (mode: ThemeMode) => void;
  addCustomTheme: (theme: Theme) => void;
  removeCustomTheme: (themeId: string) => void;
  customThemes: Theme[];
  systemMode: 'light' | 'dark';
  isTransitioning: boolean;
  transitionClass: string;
};

import type { Theme, ThemeMode } from '../types/theme';

const STORAGE_KEYS = {
  THEME: 'app-theme',
  MODE: 'app-theme-mode',
  CUSTOM_THEMES: 'app-custom-themes'
} as const;

export const themeStorage = {
  // Save current theme
  saveTheme(theme: Theme): void {
    localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(theme));
  },

  // Load saved theme
  loadTheme(): Theme | null {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (!saved) return null;
    
    try {
      return JSON.parse(saved) as Theme;
    } catch {
      return null;
    }
  },

  // Save theme mode preference
  saveMode(mode: ThemeMode): void {
    localStorage.setItem(STORAGE_KEYS.MODE, mode);
  },

  // Load saved theme mode
  loadMode(): ThemeMode | null {
    const saved = localStorage.getItem(STORAGE_KEYS.MODE) as ThemeMode | null;
    return saved || null;
  },

  // Save custom themes
  saveCustomThemes(themes: Theme[]): void {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_THEMES, JSON.stringify(themes));
  },

  // Load custom themes
  loadCustomThemes(): Theme[] {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_THEMES);
    if (!saved) return [];
    
    try {
      return JSON.parse(saved) as Theme[];
    } catch {
      return [];
    }
  },

  // Clear all theme-related data
  clearThemeData(): void {
    localStorage.removeItem(STORAGE_KEYS.THEME);
    localStorage.removeItem(STORAGE_KEYS.MODE);
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_THEMES);
  }
};

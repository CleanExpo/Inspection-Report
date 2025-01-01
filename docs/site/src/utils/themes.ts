import type { Theme } from '../types/theme';

export const defaultThemes: Theme[] = [
  {
    id: 'light-default',
    name: 'Light',
    mode: 'light',
    description: 'Default light theme',
    colors: {
      primary: '#0066cc',
      secondary: '#6c757d',
      background: '#ffffff',
      surface: '#f8f9fa',
      text: '#212529',
      textSecondary: '#6c757d',
      border: '#dee2e6',
      accent: '#0066cc',
      error: '#dc3545',
      warning: '#ffc107',
      success: '#28a745',
      info: '#17a2b8'
    }
  },
  {
    id: 'dark-default',
    name: 'Dark',
    mode: 'dark',
    description: 'Default dark theme',
    colors: {
      primary: '#4d9fff',
      secondary: '#adb5bd',
      background: '#1a1a1a',
      surface: '#2d2d2d',
      text: '#e9ecef',
      textSecondary: '#adb5bd',
      border: '#404040',
      accent: '#4d9fff',
      error: '#ff4d4d',
      warning: '#ffd24d',
      success: '#4dff4d',
      info: '#4dffff'
    }
  }
];

// Helper to get theme by ID
export const getThemeById = (id: string): Theme | undefined => {
  return defaultThemes.find(theme => theme.id === id);
};

// Helper to get theme by mode
export const getThemeByMode = (mode: 'light' | 'dark'): Theme => {
  return defaultThemes.find(theme => theme.mode === mode) || defaultThemes[0];
};

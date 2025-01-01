import type { Theme } from '../types/theme';

export const themePresets: Theme[] = [
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    mode: 'light',
    description: 'Calming blue tones inspired by the ocean',
    colors: {
      primary: '#2196f3',
      secondary: '#64b5f6',
      background: '#f5f9fc',
      surface: '#ffffff',
      text: '#1e3a5f',
      textSecondary: '#5c7a99',
      border: '#e3f2fd',
      accent: '#03a9f4',
      error: '#f44336',
      warning: '#ff9800',
      success: '#4caf50',
      info: '#00bcd4'
    }
  },
  {
    id: 'forest-night',
    name: 'Forest Night',
    mode: 'dark',
    description: 'Deep greens inspired by a nighttime forest',
    colors: {
      primary: '#4caf50',
      secondary: '#81c784',
      background: '#1a2421',
      surface: '#243830',
      text: '#e8f5e9',
      textSecondary: '#a5d6a7',
      border: '#2e4538',
      accent: '#00e676',
      error: '#ff5252',
      warning: '#ffab40',
      success: '#69f0ae',
      info: '#64ffda'
    }
  },
  {
    id: 'sunset-warm',
    name: 'Sunset Warm',
    mode: 'light',
    description: 'Warm colors inspired by a summer sunset',
    colors: {
      primary: '#ff5722',
      secondary: '#ff8a65',
      background: '#fff5f2',
      surface: '#ffffff',
      text: '#442c2a',
      textSecondary: '#805b57',
      border: '#ffe0d6',
      accent: '#ff7043',
      error: '#d32f2f',
      warning: '#ffa000',
      success: '#388e3c',
      info: '#0097a7'
    }
  },
  {
    id: 'midnight-purple',
    name: 'Midnight Purple',
    mode: 'dark',
    description: 'Rich purple tones for a luxurious dark theme',
    colors: {
      primary: '#9c27b0',
      secondary: '#ba68c8',
      background: '#1a1721',
      surface: '#2c2438',
      text: '#f3e5f5',
      textSecondary: '#ce93d8',
      border: '#382c48',
      accent: '#e040fb',
      error: '#ff4081',
      warning: '#ffab40',
      success: '#69f0ae',
      info: '#40c4ff'
    }
  }
];

// Helper to get preset by ID
export const getPresetById = (id: string): Theme | undefined => {
  return themePresets.find(preset => preset.id === id);
};

// Helper to get presets by mode
export const getPresetsByMode = (mode: 'light' | 'dark'): Theme[] => {
  return themePresets.filter(preset => preset.mode === mode);
};

// Helper to get random preset
export const getRandomPreset = (): Theme => {
  const index = Math.floor(Math.random() * themePresets.length);
  return themePresets[index];
};

// Helper to get complementary preset
export const getComplementaryPreset = (theme: Theme): Theme | undefined => {
  return themePresets.find(preset => 
    preset.mode !== theme.mode && 
    preset.colors.primary !== theme.colors.primary
  );
};

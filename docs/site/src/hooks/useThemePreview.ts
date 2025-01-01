import { useMemo } from 'react';
import type { Theme, ThemePreview, ThemePreviewColors } from '../types/theme';
import { isFullTheme, isThemePreview } from '../types/theme';
import { getAccessibleTextColor } from '../utils/themeUtils';

type Options = { generateThumbnail?: boolean };

export function useThemePreview({ generateThumbnail = false }: Options = {}) {
  const createPreview = ({ id, name, mode, description, colors }: Theme): ThemePreview => ({
    id,
    name,
    mode,
    description,
    colors: {
      primary: colors.primary,
      background: colors.background,
      text: colors.text
    }
  });

  const createPreviews = (themes: Theme[]): ThemePreview[] => themes.map(createPreview);

  const generatePreviewColors = (primary: string, mode: 'light' | 'dark'): ThemePreviewColors => ({
    primary,
    background: mode === 'light' ? '#ffffff' : '#1a1a1a',
    text: getAccessibleTextColor(mode === 'light' ? '#ffffff' : '#1a1a1a')
  });

  const getPreviewColors = (theme: Theme | ThemePreview): ThemePreviewColors => {
    if (isFullTheme(theme)) return {
      primary: theme.colors.primary,
      background: theme.colors.background,
      text: theme.colors.text
    };
    if (isThemePreview(theme)) return theme.colors;
    throw new Error('Invalid theme object');
  };

  const thumbnailGenerator = useMemo(() => {
    if (!generateThumbnail) return undefined;

    return (colors: ThemePreviewColors): string => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';

      canvas.width = 100;
      canvas.height = 60;

      ctx.fillStyle = colors.background;
      ctx.fillRect(0, 0, 100, 60);

      ctx.fillStyle = colors.primary;
      ctx.fillRect(0, 0, 40, 60);

      ctx.fillStyle = colors.text;
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Aa', 70, 30);

      return canvas.toDataURL('image/png');
    };
  }, [generateThumbnail]);

  return {
    createPreview,
    createPreviews,
    generatePreviewColors,
    getPreviewColors,
    generateThumbnail: thumbnailGenerator
  };
}

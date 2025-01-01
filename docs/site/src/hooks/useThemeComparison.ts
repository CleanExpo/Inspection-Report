import type { Theme, ThemePreview } from '../types/theme';
import { useThemePreview } from './useThemePreview';
import { calculateColorDifference } from '../utils/colorUtils';

export function useThemeComparison(theme1: Theme | ThemePreview, theme2: Theme | ThemePreview) {
  const { getPreviewColors } = useThemePreview();
  const colors1 = getPreviewColors(theme1);
  const colors2 = getPreviewColors(theme2);

  const difference = {
    primary: calculateColorDifference(colors1.primary, colors2.primary),
    background: calculateColorDifference(colors1.background, colors2.background),
    text: calculateColorDifference(colors1.text, colors2.text)
  };

  const totalDifference = Object.values(difference).reduce((a, b) => a + b, 0);

  return {
    difference,
    totalDifference,
    isSignificantlyDifferent: totalDifference > 100
  };
}

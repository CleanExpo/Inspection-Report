import type { Theme, ThemeColors } from '../types/theme';

// Calculate contrast ratio between two colors
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(color1: string, color2: string): number {
  const getRGB = (hex: string) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0];
  };

  const [r1, g1, b1] = getRGB(color1);
  const [r2, g2, b2] = getRGB(color2);
  const l1 = getLuminance(r1, g1, b1);
  const l2 = getLuminance(r2, g2, b2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Check if a color has enough contrast with background
export function hasEnoughContrast(color: string, background: string): boolean {
  const ratio = getContrastRatio(color, background);
  return ratio >= 4.5; // WCAG AA standard for normal text
}

// Adjust color brightness
export function adjustBrightness(color: string, factor: number): string {
  const getRGB = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0];
  };

  const [r, g, b] = getRGB(color);
  const adjust = (c: number) => Math.min(255, Math.max(0, Math.round(c * factor)));
  
  const newR = adjust(r);
  const newG = adjust(g);
  const newB = adjust(b);

  return `#${[newR, newG, newB]
    .map(c => c.toString(16).padStart(2, '0'))
    .join('')}`;
}

// Generate a complete theme from base colors
export function generateCompleteTheme(
  baseColors: Partial<ThemeColors>,
  mode: 'light' | 'dark'
): ThemeColors {
  const isDark = mode === 'dark';
  const primary = baseColors.primary || (isDark ? '#4d9fff' : '#0066cc');
  const background = baseColors.background || (isDark ? '#1a1a1a' : '#ffffff');

  return {
    primary,
    secondary: baseColors.secondary || (isDark ? '#adb5bd' : '#6c757d'),
    background,
    surface: baseColors.surface || (isDark ? '#2d2d2d' : '#f8f9fa'),
    text: baseColors.text || (isDark ? '#e9ecef' : '#212529'),
    textSecondary: baseColors.textSecondary || (isDark ? '#adb5bd' : '#6c757d'),
    border: baseColors.border || (isDark ? '#404040' : '#dee2e6'),
    accent: baseColors.accent || primary,
    error: baseColors.error || (isDark ? '#ff4d4d' : '#dc3545'),
    warning: baseColors.warning || (isDark ? '#ffd24d' : '#ffc107'),
    success: baseColors.success || (isDark ? '#4dff4d' : '#28a745'),
    info: baseColors.info || (isDark ? '#4dffff' : '#17a2b8')
  };
}

// Mix two themes to create a new one
export function mixThemes(theme1: Theme, theme2: Theme, ratio: number = 0.5): Theme {
  const mixColor = (color1: string, color2: string) => {
    const getRGB = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ] : [0, 0, 0];
    };

    const [r1, g1, b1] = getRGB(color1);
    const [r2, g2, b2] = getRGB(color2);

    const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
    const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
    const b = Math.round(b1 * (1 - ratio) + b2 * ratio);

    return `#${[r, g, b]
      .map(c => c.toString(16).padStart(2, '0'))
      .join('')}`;
  };

  const colors = Object.entries(theme1.colors).reduce((acc, [key, value]) => ({
    ...acc,
    [key]: mixColor(value, theme2.colors[key as keyof ThemeColors])
  }), {} as ThemeColors);

  return {
    id: `mixed-${Date.now()}`,
    name: `Mixed ${theme1.name} & ${theme2.name}`,
    mode: theme1.mode,
    colors,
    description: `Mixed theme combining ${theme1.name} and ${theme2.name}`
  };
}

// Get accessible text color based on background
export function getAccessibleTextColor(backgroundColor: string): string {
  const luminance = getLuminance(...getRGB(backgroundColor));
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

function getRGB(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [0, 0, 0];
}

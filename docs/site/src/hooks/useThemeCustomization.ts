import { useState, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import type { Theme, ThemeColors } from '../types/theme';

interface ThemeValidationError {
  field: string;
  message: string;
}

export function useThemeCustomization() {
  const { addCustomTheme, removeCustomTheme, customThemes } = useTheme();
  const [errors, setErrors] = useState<ThemeValidationError[]>([]);

  const validateThemeColors = (colors: Partial<ThemeColors>): ThemeValidationError[] => {
    const errors: ThemeValidationError[] = [];
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

    Object.entries(colors).forEach(([key, value]) => {
      if (!value) {
        errors.push({
          field: key,
          message: `${key} color is required`
        });
      } else if (!hexColorRegex.test(value)) {
        errors.push({
          field: key,
          message: `${key} must be a valid hex color (e.g., #FF0000)`
        });
      }
    });

    return errors;
  };

  const createCustomTheme = useCallback((
    name: string,
    colors: ThemeColors,
    mode: 'light' | 'dark',
    description?: string
  ): boolean => {
    // Reset previous errors
    setErrors([]);

    // Validate name
    if (!name.trim()) {
      setErrors([{ field: 'name', message: 'Theme name is required' }]);
      return false;
    }

    // Validate colors
    const colorErrors = validateThemeColors(colors);
    if (colorErrors.length > 0) {
      setErrors(colorErrors);
      return false;
    }

    // Create theme object
    const newTheme: Theme = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      mode,
      colors,
      description
    };

    // Add the theme
    addCustomTheme(newTheme);
    return true;
  }, [addCustomTheme]);

  const deleteCustomTheme = useCallback((themeId: string) => {
    removeCustomTheme(themeId);
  }, [removeCustomTheme]);

  const getCustomTheme = useCallback((themeId: string) => {
    return customThemes.find(theme => theme.id === themeId);
  }, [customThemes]);

  return {
    createCustomTheme,
    deleteCustomTheme,
    getCustomTheme,
    customThemes,
    errors
  };
}

// Helper to generate a theme from base colors
export function generateThemeColors(
  primary: string,
  background: string = '#ffffff',
  isDark: boolean = false
): ThemeColors {
  return {
    primary,
    secondary: isDark ? '#adb5bd' : '#6c757d',
    background,
    surface: isDark ? '#2d2d2d' : '#f8f9fa',
    text: isDark ? '#e9ecef' : '#212529',
    textSecondary: isDark ? '#adb5bd' : '#6c757d',
    border: isDark ? '#404040' : '#dee2e6',
    accent: primary,
    error: isDark ? '#ff4d4d' : '#dc3545',
    warning: isDark ? '#ffd24d' : '#ffc107',
    success: isDark ? '#4dff4d' : '#28a745',
    info: isDark ? '#4dffff' : '#17a2b8'
  };
}

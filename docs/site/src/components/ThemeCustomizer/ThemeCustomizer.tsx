import React, { useState, useCallback, useEffect } from 'react';
import { useTheme, Theme, ThemeColors, themes } from '../../theme';
import styles from './ThemeCustomizer.module.css';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange }) => (
  <div className={styles.colorField}>
    <label className={styles.colorLabel}>
      {label}
      <div className={styles.colorInputWrapper}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={styles.colorInput}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={styles.colorText}
          pattern="^#[0-9A-Fa-f]{6}$"
          title="Hex color code (e.g., #FF0000)"
        />
      </div>
    </label>
  </div>
);

interface ColorGroupProps {
  title: string;
  colors: Record<string, string | Record<string, string>>;
  onChange: (key: string, value: string) => void;
  flattenKeys?: boolean;
}

const ColorGroup: React.FC<ColorGroupProps> = ({ title, colors, onChange, flattenKeys = false }) => (
  <div className={styles.colorGroup}>
    <h3 className={styles.groupTitle}>{title}</h3>
    {Object.entries(colors).map(([key, value]) => {
      if (typeof value === 'object') {
        return Object.entries(value).map(([subKey, subValue]) => (
          <ColorPicker
            key={`${key}-${subKey}`}
            label={`${key} ${subKey}`.replace(/([A-Z])/g, ' $1').toLowerCase()}
            value={subValue}
            onChange={(newValue) => onChange(`${key}.${subKey}`, newValue)}
          />
        ));
      }
      return (
        <ColorPicker
          key={key}
          label={key.replace(/([A-Z])/g, ' $1').toLowerCase()}
          value={value}
          onChange={(newValue) => onChange(key, newValue)}
        />
      );
    })}
  </div>
);

export const ThemeCustomizer: React.FC = () => {
  const { theme: currentTheme, setTheme: setGlobalTheme, themeName } = useTheme();
  const [customColors, setCustomColors] = useState<ThemeColors>(currentTheme.colors);
  const [isModified, setIsModified] = useState(false);

  const handleColorChange = useCallback((path: string, value: string) => {
    setCustomColors((prev) => {
      const newColors = { ...prev };
      const keys = path.split('.');
      
      if (keys.length === 2) {
        // Handle nested color objects (e.g., text.primary)
        const [group, key] = keys;
        (newColors[group as keyof ThemeColors] as Record<string, string>)[key] = value;
      } else {
        // Handle top-level colors
        newColors[path as keyof ThemeColors] = value as any;
      }
      
      return newColors;
    });
    setIsModified(true);
  }, []);

  const CUSTOM_COLORS_KEY = 'docs-custom-colors';

// Type guard for ThemeColors
const isThemeColors = (value: unknown): value is ThemeColors => {
  if (!value || typeof value !== 'object') return false;
  
  const colors = value as Partial<ThemeColors>;
  return (
    typeof colors.primary === 'string' &&
    typeof colors.secondary === 'string' &&
    typeof colors.background === 'string' &&
    typeof colors.surface === 'string' &&
    typeof colors.border === 'string' &&
    colors.text !== undefined &&
    colors.code !== undefined &&
    colors.sidebar !== undefined &&
    typeof colors.text === 'object' &&
    typeof colors.code === 'object' &&
    typeof colors.sidebar === 'object'
  );
};

// Type-safe storage implementation
const storage = {
  getItem(key: string): ThemeColors | null {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    
    try {
      const rawValue = window.localStorage.getItem(key);
      if (!rawValue) return null;
      
      try {
        const parsed = JSON.parse(rawValue);
        if (isThemeColors(parsed)) {
          return parsed;
        }
        console.error('Invalid theme colors structure in localStorage');
        return null;
      } catch (parseError) {
        console.error('Failed to parse theme colors:', parseError);
        return null;
      }
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return null;
    }
  },

  setItem(key: string, value: ThemeColors): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    
    try {
      const serialized = JSON.stringify(value);
      window.localStorage.setItem(key, serialized);
    } catch (error) {
      console.error('Failed to save theme to localStorage:', error);
    }
  },

  removeItem(key: string): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove theme from localStorage:', error);
    }
  }
};



  const handleSave = useCallback(() => {
    // Save custom colors to localStorage with type safety
    storage.setItem(
      `${CUSTOM_COLORS_KEY}-${themeName}`,
      customColors
    );
    
    // Apply custom colors via CSS variables
    (Object.entries(customColors) as [keyof ThemeColors, any][]).forEach(([key, value]) => {
      if (typeof value === 'object') {
        Object.entries(value).forEach(([subKey, subValue]) => {
          document.documentElement.style.setProperty(
            `--${key}-${subKey}`,
            subValue
          );
        });
      } else {
        document.documentElement.style.setProperty(
          `--${key}`,
          value
        );
      }
    });
    
    setIsModified(false);
  }, [customColors, themeName]);

  // Load saved custom colors on mount and theme change
  useEffect(() => {
    try {
      const savedColors = storage.getItem(`${CUSTOM_COLORS_KEY}-${themeName}`);
      if (savedColors && isThemeColors(savedColors)) {
        setCustomColors(savedColors);
        
        // Apply saved colors
        Object.entries(savedColors).forEach(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            Object.entries(value).forEach(([subKey, subValue]) => {
              if (typeof subValue === 'string') {
                document.documentElement.style.setProperty(
                  `--${key}-${subKey}`,
                  subValue
                );
              }
            });
          } else if (typeof value === 'string') {
            document.documentElement.style.setProperty(
              `--${key}`,
              value
            );
          }
        });
      } else {
        setCustomColors(currentTheme.colors);
      }
    } catch (error) {
      console.error('Failed to load saved colors:', error);
      setCustomColors(currentTheme.colors);
    }
  }, [themeName, currentTheme, storage]);

  const handleReset = useCallback(() => {
    // Remove custom colors from localStorage
    storage.removeItem(`${CUSTOM_COLORS_KEY}-${themeName}`);
    
    // Reset to theme defaults
    setCustomColors(currentTheme.colors);
    
    // Remove custom CSS variables
    (Object.entries(currentTheme.colors) as [keyof ThemeColors, any][]).forEach(([key, value]) => {
      if (typeof value === 'object') {
        Object.entries(value).forEach(([subKey]) => {
          document.documentElement.style.removeProperty(`--${key}-${subKey}`);
        });
      } else {
        document.documentElement.style.removeProperty(`--${key}`);
      }
    });
    
    setIsModified(false);
  }, [currentTheme, themeName]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Customize Theme</h2>
        <div className={styles.actions}>
          <button
            className={`${styles.button} ${styles.resetButton}`}
            onClick={handleReset}
            disabled={!isModified}
          >
            Reset
          </button>
          <button
            className={`${styles.button} ${styles.saveButton}`}
            onClick={handleSave}
            disabled={!isModified}
          >
            Save Changes
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.colorPickers}>
          {/* Base colors */}
          <ColorGroup
            title="Base Colors"
            colors={{
              primary: customColors.primary,
              secondary: customColors.secondary,
              background: customColors.background,
              surface: customColors.surface,
              border: customColors.border,
            }}
            onChange={handleColorChange}
          />

          {/* Text colors */}
          <ColorGroup
            title="Text Colors"
            colors={customColors.text}
            onChange={(key, value) => handleColorChange(`text.${key}`, value)}
          />

          {/* Code colors */}
          <ColorGroup
            title="Code Colors"
            colors={customColors.code}
            onChange={(key, value) => handleColorChange(`code.${key}`, value)}
          />

          {/* Sidebar colors */}
          <ColorGroup
            title="Sidebar Colors"
            colors={customColors.sidebar}
            onChange={(key, value) => handleColorChange(`sidebar.${key}`, value)}
          />
        </div>

        <div className={styles.preview}>
          <h3 className={styles.previewTitle}>Preview</h3>
          <div
            className={styles.previewContent}
            style={{
              '--preview-bg': customColors.background,
              '--preview-surface': customColors.surface,
              '--preview-primary': customColors.primary,
              '--preview-text': customColors.text.primary,
              '--preview-border': customColors.border,
            } as React.CSSProperties}
          >
            <div className={styles.previewHeader}>
              <div className={styles.previewText}>Sample Text</div>
              <div className={styles.previewAccent} />
            </div>
            <div className={styles.previewBody}>
              <div className={styles.previewCard}>
                <div className={styles.previewCardTitle}>Card Title</div>
                <div className={styles.previewCardContent}>
                  Content preview with different theme colors and styles.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

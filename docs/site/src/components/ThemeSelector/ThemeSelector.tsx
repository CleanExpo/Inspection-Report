import React, { useState } from 'react';
import { useTheme, Theme, themes } from '../../theme';
import styles from './ThemeSelector.module.css';

interface ThemePreviewProps {
  theme: Theme;
  isActive: boolean;
  onClick: () => void;
}

const ThemePreview: React.FC<ThemePreviewProps> = ({ theme, isActive, onClick }) => (
  <button
    className={`${styles.themePreview} ${isActive ? styles.active : ''}`}
    onClick={onClick}
    aria-pressed={isActive}
    title={`Select ${theme.name} theme`}
  >
    <div className={styles.previewHeader}>
      <span className={styles.themeName}>{theme.name}</span>
      {isActive && (
        <span className={styles.activeIndicator} aria-hidden="true">
          ✓
        </span>
      )}
    </div>
    <div 
      className={styles.previewContent}
      style={{
        '--preview-bg': theme.colors.background,
        '--preview-surface': theme.colors.surface,
        '--preview-primary': theme.colors.primary,
        '--preview-text': theme.colors.text.primary,
      } as React.CSSProperties}
    >
      <div className={styles.previewSurface}>
        <div className={styles.previewText}>Aa</div>
        <div className={styles.previewAccent} />
      </div>
    </div>
  </button>
);

export const ThemeSelector: React.FC = () => {
  const { themeName, setThemeName } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.container}>
      <button
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="theme-selector-content"
      >
        <span>Theme: {themeName}</span>
        <svg
          className={`${styles.chevron} ${isOpen ? styles.open : ''}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2 4L6 8L10 4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          id="theme-selector-content"
          className={styles.content}
          role="listbox"
          aria-label="Available themes"
        >
          {Object.entries(themes).map(([name, theme]) => (
            <ThemePreview
              key={name}
              theme={theme}
              isActive={name === themeName}
              onClick={() => {
                setThemeName(name as keyof typeof themes);
                setIsOpen(false);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

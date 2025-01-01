import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import type { Theme, ThemeMode } from '../types/theme';
import { defaultThemes } from '../utils/themes';

export function ThemeSelector() {
  const { theme, mode, setTheme, setMode, customThemes } = useTheme();
  
  const handleModeChange = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  const handleThemeChange = (themeId: string) => {
    const allThemes = [...defaultThemes, ...customThemes];
    const selectedTheme = allThemes.find(t => t.id === themeId);
    if (selectedTheme) {
      setTheme(selectedTheme);
    }
  };

  return (
    <div className="theme-selector">
      <div className="mode-selector">
        <label htmlFor="mode-select">Theme Mode:</label>
        <select
          id="mode-select"
          value={mode}
          onChange={(e) => handleModeChange(e.target.value as ThemeMode)}
          className="mode-select"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System</option>
        </select>
      </div>

      <div className="theme-selector-grid">
        {[...defaultThemes, ...customThemes].map((themeOption) => (
          <button
            key={themeOption.id}
            onClick={() => handleThemeChange(themeOption.id)}
            className={`theme-option ${theme.id === themeOption.id ? 'active' : ''}`}
            aria-label={`Select ${themeOption.name} theme`}
            title={themeOption.description || themeOption.name}
          >
            <div className="theme-preview">
              <div 
                className="color-primary"
                style={{ backgroundColor: themeOption.colors.primary }}
              />
              <div 
                className="color-background"
                style={{ backgroundColor: themeOption.colors.background }}
              />
              <div 
                className="color-text"
                style={{ backgroundColor: themeOption.colors.text }}
              />
            </div>
            <span className="theme-name">{themeOption.name}</span>
          </button>
        ))}
      </div>

      <style jsx>{`
        .theme-selector {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .mode-selector {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .mode-select {
          padding: 0.5rem;
          border-radius: 4px;
          border: 1px solid var(--color-border);
          background: var(--color-surface);
          color: var(--color-text);
        }

        .theme-selector-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 1rem;
        }

        .theme-option {
          padding: 0.5rem;
          border: 2px solid transparent;
          border-radius: 8px;
          background: var(--color-surface);
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .theme-option:hover {
          border-color: var(--color-primary);
        }

        .theme-option.active {
          border-color: var(--color-primary);
          background: var(--color-surface);
        }

        .theme-preview {
          width: 100%;
          height: 60px;
          border-radius: 4px;
          overflow: hidden;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 2px;
        }

        .color-primary,
        .color-background,
        .color-text {
          width: 100%;
          height: 100%;
        }

        .theme-name {
          font-size: 0.875rem;
          color: var(--color-text);
        }
      `}</style>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { ThemePreviewGrid } from './ThemePreview';
import { themePresets, getPresetsByMode } from '../utils/themePresets';
import { useTheme } from '../contexts/ThemeContext';
import type { Theme, ThemeMode, ThemePreview } from '../types/theme';
import './ThemePresetGallery.css';

type Props = {
  onSelect?: (theme: Theme | ThemePreview) => void;
};

const filterModes = [
  { id: 'all', label: 'All' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'system', label: 'System' }
] as const;

export function ThemePresetGallery({ onSelect }: Props) {
  const { mode } = useTheme();
  const [filter, setFilter] = useState<ThemeMode>('all');

  const filteredThemes = useMemo(() => {
    if (filter === 'all') return themePresets;
    if (filter === 'system') return getPresetsByMode(mode === 'dark' ? 'dark' : 'light');
    return getPresetsByMode(filter === 'dark' ? 'dark' : 'light');
  }, [filter, mode]);

  return (
    <div className="theme-preset-gallery">
      <div className="gallery-header">
        <h3>Theme Presets</h3>
        <div className="filter-controls">
          {filterModes.map(({ id, label }) => (
            <button
              key={id}
              className={`filter-btn ${filter === id ? 'active' : ''}`}
              onClick={() => setFilter(id as ThemeMode)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="gallery-content">
        <ThemePreviewGrid themes={filteredThemes} size="medium" onSelect={onSelect} />
      </div>
    </div>
  );
}

export function CompactThemePresetGallery({ onSelect }: Props) {
  const { mode } = useTheme();
  const themes = useMemo(() => 
    getPresetsByMode(mode === 'dark' ? 'dark' : 'light'),
    [mode]
  );

  return (
    <div className="compact-gallery">
      <ThemePreviewGrid themes={themes} size="small" onSelect={onSelect} />
    </div>
  );
}

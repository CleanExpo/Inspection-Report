import React, { useState } from 'react';
import { ThemeSelector } from './ThemeSelector';
import { ThemeCustomizer } from './ThemeCustomizer';
import { ThemePresetGallery } from './ThemePresetGallery';
import { useTheme } from '../contexts/ThemeContext';
import type { Theme, ThemePreview } from '../types/theme';
import './ThemeManager.css';

export function ThemeManager() {
  const { setTheme } = useTheme();
  const [tab, setTab] = useState('select');

  const tabs = [
    { id: 'select', label: 'Current Theme', component: ThemeSelector },
    { id: 'customize', label: 'Custom Theme', component: ThemeCustomizer },
    { id: 'presets', label: 'Theme Presets', component: ThemePresetGallery }
  ];

  const handlePresetSelect = (theme: Theme | ThemePreview) => {
    if ('secondary' in theme.colors) setTheme(theme as Theme);
  };

  const ActiveComponent = tabs.find(t => t.id === tab)?.component;

  return (
    <div className="theme-manager">
      <nav className="tabs">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            className={`tab ${tab === id ? 'active' : ''}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>
      <div className="tab-content">
        {ActiveComponent && (
          <ActiveComponent 
            {...(tab === 'presets' ? { onSelect: handlePresetSelect } : {})}
          />
        )}
      </div>
    </div>
  );
}

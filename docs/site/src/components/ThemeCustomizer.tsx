import React, { useState } from 'react';
import { useThemeCustomization, generateThemeColors } from '../hooks/useThemeCustomization';
import type { ThemeColors } from '../types/theme';

export function ThemeCustomizer() {
  const { createCustomTheme, errors } = useThemeCustomization();
  const [name, setName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#0066cc');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [isDark, setIsDark] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const colors = generateThemeColors(primaryColor, backgroundColor, isDark);
    const success = createCustomTheme(
      name,
      colors,
      isDark ? 'dark' : 'light',
      `Custom theme created with primary color ${primaryColor}`
    );

    if (success) {
      // Reset form
      setName('');
      setPrimaryColor('#0066cc');
      setBackgroundColor('#ffffff');
      setIsDark(false);
    }
  };

  return (
    <div className="theme-customizer">
      <h3>Create Custom Theme</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="theme-name">Theme Name:</label>
          <input
            id="theme-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Custom Theme"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="primary-color">Primary Color:</label>
          <div className="color-input">
            <input
              id="primary-color"
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
            />
            <input
              type="text"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
              placeholder="#000000"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="background-color">Background Color:</label>
          <div className="color-input">
            <input
              id="background-color"
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
            />
            <input
              type="text"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
              placeholder="#FFFFFF"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={isDark}
              onChange={(e) => setIsDark(e.target.checked)}
            />
            Dark Theme
          </label>
        </div>

        {errors.length > 0 && (
          <div className="error-list">
            {errors.map((error, index) => (
              <p key={index} className="error-message">
                {error.message}
              </p>
            ))}
          </div>
        )}

        <button type="submit" className="create-button">
          Create Theme
        </button>
      </form>

      <style jsx>{`
        .theme-customizer {
          padding: 1rem;
          background: var(--color-surface);
          border-radius: 8px;
          border: 1px solid var(--color-border);
        }

        h3 {
          margin: 0 0 1rem;
          color: var(--color-text);
        }

        .form-group {
          margin-bottom: 1rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--color-text);
        }

        input[type="text"] {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid var(--color-border);
          border-radius: 4px;
          background: var(--color-background);
          color: var(--color-text);
        }

        .color-input {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        input[type="color"] {
          width: 50px;
          height: 38px;
          padding: 0;
          border: 1px solid var(--color-border);
          border-radius: 4px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .error-list {
          margin-bottom: 1rem;
          padding: 0.5rem;
          border-radius: 4px;
          background: var(--color-error);
          color: white;
        }

        .error-message {
          margin: 0.25rem 0;
        }

        .create-button {
          width: 100%;
          padding: 0.75rem;
          background: var(--color-primary);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .create-button:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import type { Theme, ThemePreview as ThemePreviewType } from '../types/theme';
import { useThemePreview } from '../hooks/useThemePreview';
import './ThemePreview.css';

type Size = 'small' | 'medium' | 'large';

interface Props {
  theme: Theme | ThemePreviewType;
  size?: Size;
  showName?: boolean;
  onClick?: () => void;
}

export function ThemePreview({ 
  theme, 
  size = 'medium',
  showName = true,
  onClick 
}: Props) {
  const { getPreviewColors, generateThumbnail } = useThemePreview({ generateThumbnail: true });
  const [thumbnail, setThumbnail] = useState<string>();
  const colors = getPreviewColors(theme);

  useEffect(() => {
    if (generateThumbnail) {
      setThumbnail(generateThumbnail(colors));
    }
  }, [theme, generateThumbnail, colors]);

  return (
    <div 
      className="theme-preview"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      data-clickable={!!onClick}
    >
      <div 
        className={`preview-box preview-box--${size}`}
        style={{ background: colors.background }}
        aria-label={`Theme preview for ${theme.name}: Primary color ${colors.primary}, Background color ${colors.background}`}
      >
        {thumbnail ? (
          <img src={thumbnail} alt={`${theme.name} theme preview`} className="thumbnail" />
        ) : (
          <>
            <div className="color-strip" style={{ background: colors.primary }} />
            <div className="color-strip">
              <span className={`sample-text sample-text--${size}`} style={{ color: colors.text }}>
                Aa
              </span>
            </div>
          </>
        )}
      </div>
      {showName && (
        <span className={`theme-name theme-name--${size}`}>
          {theme.name}
        </span>
      )}
    </div>
  );
}

export function ThemePreviewGrid({
  themes,
  size = 'medium',
  onSelect
}: {
  themes: (Theme | ThemePreviewType)[];
  size?: Size;
  onSelect?: (theme: Theme | ThemePreviewType) => void;
}) {
  return (
    <div className={`theme-preview-grid theme-preview-grid--${size}`}>
      {themes.map((theme) => (
        <ThemePreview
          key={theme.id}
          theme={theme}
          size={size}
          onClick={onSelect ? () => onSelect(theme) : undefined}
        />
      ))}
    </div>
  );
}

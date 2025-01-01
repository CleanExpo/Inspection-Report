export interface ExportThemeColors {
  primary: string;
  secondary: string;
  text: string;
  background: string;
  border: string;
  accent: string;
}

export interface ExportThemeTypography {
  fontFamily: string;
  headingFont: string;
  fontSize: {
    small: string;
    base: string;
    large: string;
    heading1: string;
    heading2: string;
    heading3: string;
  };
  lineHeight: {
    tight: string;
    normal: string;
    relaxed: string;
  };
}

export interface ExportThemeSpacing {
  small: string;
  medium: string;
  large: string;
  section: string;
}

export interface ExportTheme {
  colors: ExportThemeColors;
  typography: ExportThemeTypography;
  spacing: ExportThemeSpacing;
  borderRadius: string;
  boxShadow: string;
}

// Theme presets for different styles
export const professionalTheme: ExportTheme = {
  colors: {
    primary: '#1a365d',
    secondary: '#2c5282',
    text: '#2d3748',
    background: '#ffffff',
    border: '#e2e8f0',
    accent: '#ebf8ff'
  },
  typography: {
    fontFamily: '"Times New Roman", serif',
    headingFont: '"Arial", sans-serif',
    fontSize: {
      small: '0.875rem',
      base: '1rem',
      large: '1.125rem',
      heading1: '2.25rem',
      heading2: '1.75rem',
      heading3: '1.5rem'
    },
    lineHeight: {
      tight: '1.2',
      normal: '1.5',
      relaxed: '1.75'
    }
  },
  spacing: {
    small: '0.75rem',
    medium: '1.5rem',
    large: '2.5rem',
    section: '4rem'
  },
  borderRadius: '0.25rem',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
};

export const minimalTheme: ExportTheme = {
  colors: {
    primary: '#000000',
    secondary: '#666666',
    text: '#333333',
    background: '#ffffff',
    border: '#eeeeee',
    accent: '#f5f5f5'
  },
  typography: {
    fontFamily: '"Helvetica Neue", Arial, sans-serif',
    headingFont: 'inherit',
    fontSize: {
      small: '0.875rem',
      base: '1rem',
      large: '1.125rem',
      heading1: '1.875rem',
      heading2: '1.5rem',
      heading3: '1.25rem'
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.7'
    }
  },
  spacing: {
    small: '0.5rem',
    medium: '1rem',
    large: '1.5rem',
    section: '2.5rem'
  },
  borderRadius: '0.125rem',
  boxShadow: 'none'
};

export const modernTheme: ExportTheme = {
  colors: {
    primary: '#6366f1',
    secondary: '#818cf8',
    text: '#1f2937',
    background: '#ffffff',
    border: '#e5e7eb',
    accent: '#f3f4f6'
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    headingFont: 'inherit',
    fontSize: {
      small: '0.875rem',
      base: '1rem',
      large: '1.125rem',
      heading1: '2.25rem',
      heading2: '1.75rem',
      heading3: '1.375rem'
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.6',
      relaxed: '1.8'
    }
  },
  spacing: {
    small: '0.75rem',
    medium: '1.25rem',
    large: '2rem',
    section: '3.5rem'
  },
  borderRadius: '0.5rem',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
};

export const defaultTheme: ExportTheme = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    text: '#333333',
    background: '#ffffff',
    border: '#e2e8f0',
    accent: '#f8f9fa'
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    headingFont: 'inherit',
    fontSize: {
      small: '0.875rem',
      base: '1rem',
      large: '1.125rem',
      heading1: '2rem',
      heading2: '1.5rem',
      heading3: '1.25rem'
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75'
    }
  },
  spacing: {
    small: '0.5rem',
    medium: '1rem',
    large: '2rem',
    section: '3rem'
  },
  borderRadius: '0.375rem',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
};

// Validate that a theme object contains all required properties
export const validateTheme = (theme: Partial<ExportTheme>): boolean => {
  const requiredColorProps = ['primary', 'secondary', 'text', 'background', 'border', 'accent'];
  const requiredFontSizeProps = ['small', 'base', 'large', 'heading1', 'heading2', 'heading3'];
  const requiredLineHeightProps = ['tight', 'normal', 'relaxed'];
  const requiredSpacingProps = ['small', 'medium', 'large', 'section'];

  // Check if all required properties exist
  const hasAllColorProps = theme.colors && requiredColorProps.every(prop => theme.colors?.[prop as keyof ExportThemeColors]);
  const hasAllTypographyProps = theme.typography && 
    theme.typography.fontFamily &&
    theme.typography.headingFont &&
    theme.typography.fontSize && requiredFontSizeProps.every(prop => theme.typography?.fontSize?.[prop as keyof ExportThemeTypography['fontSize']]) &&
    theme.typography.lineHeight && requiredLineHeightProps.every(prop => theme.typography?.lineHeight?.[prop as keyof ExportThemeTypography['lineHeight']]);
  const hasAllSpacingProps = theme.spacing && requiredSpacingProps.every(prop => theme.spacing?.[prop as keyof ExportThemeSpacing]);
  const hasBasicProps = theme.borderRadius !== undefined && theme.boxShadow !== undefined;

  return Boolean(hasAllColorProps && hasAllTypographyProps && hasAllSpacingProps && hasBasicProps);
};

// Merge custom theme overrides with a base theme
export const mergeTheme = (baseTheme: ExportTheme, overrides: Partial<ExportTheme>): ExportTheme => {
  return {
    colors: {
      ...baseTheme.colors,
      ...overrides.colors
    },
    typography: {
      ...baseTheme.typography,
      ...overrides.typography,
      fontSize: {
        ...baseTheme.typography.fontSize,
        ...overrides.typography?.fontSize
      },
      lineHeight: {
        ...baseTheme.typography.lineHeight,
        ...overrides.typography?.lineHeight
      }
    },
    spacing: {
      ...baseTheme.spacing,
      ...overrides.spacing
    },
    borderRadius: overrides.borderRadius ?? baseTheme.borderRadius,
    boxShadow: overrides.boxShadow ?? baseTheme.boxShadow
  };
};

export const generateThemeStyles = (theme: ExportTheme): string => `
  :root {
    --primary-color: ${theme.colors.primary};
    --secondary-color: ${theme.colors.secondary};
    --text-color: ${theme.colors.text};
    --background-color: ${theme.colors.background};
    --border-color: ${theme.colors.border};
    --accent-color: ${theme.colors.accent};
    
    --font-family: ${theme.typography.fontFamily};
    --heading-font: ${theme.typography.headingFont};
    
    --font-size-small: ${theme.typography.fontSize.small};
    --font-size-base: ${theme.typography.fontSize.base};
    --font-size-large: ${theme.typography.fontSize.large};
    --font-size-h1: ${theme.typography.fontSize.heading1};
    --font-size-h2: ${theme.typography.fontSize.heading2};
    --font-size-h3: ${theme.typography.fontSize.heading3};
    
    --line-height-tight: ${theme.typography.lineHeight.tight};
    --line-height-normal: ${theme.typography.lineHeight.normal};
    --line-height-relaxed: ${theme.typography.lineHeight.relaxed};
    
    --spacing-small: ${theme.spacing.small};
    --spacing-medium: ${theme.spacing.medium};
    --spacing-large: ${theme.spacing.large};
    --spacing-section: ${theme.spacing.section};
    
    --border-radius: ${theme.borderRadius};
    --box-shadow: ${theme.boxShadow};
  }

  body {
    font-family: var(--font-family);
    font-size: var(--font-size-base);
    line-height: var(--line-height-normal);
    color: var(--text-color);
    background-color: var(--background-color);
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--heading-font);
    margin-bottom: var(--spacing-medium);
  }

  h1 { font-size: var(--font-size-h1); }
  h2 { font-size: var(--font-size-h2); }
  h3 { font-size: var(--font-size-h3); }

  p { margin-bottom: var(--spacing-medium); }

  .section {
    margin-bottom: var(--spacing-section);
    padding: var(--spacing-large);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
  }

  .card {
    background-color: var(--background-color);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    padding: var(--spacing-medium);
    margin-bottom: var(--spacing-medium);
  }

  .text-small { font-size: var(--font-size-small); }
  .text-large { font-size: var(--font-size-large); }
`;

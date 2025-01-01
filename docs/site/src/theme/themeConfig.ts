export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
  };
  border: string;
  code: {
    background: string;
    text: string;
    comment: string;
    keyword: string;
    string: string;
    function: string;
  };
  sidebar: {
    background: string;
    activeItem: string;
    hoverItem: string;
    text: string;
  };
}

export interface Theme {
  name: string;
  colors: ThemeColors;
  fontSizes: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
  transitions: {
    fast: string;
    normal: string;
    slow: string;
  };
}

export const lightTheme: Theme = {
  name: 'light',
  colors: {
    primary: '#0066cc',
    secondary: '#4a5568',
    background: '#ffffff',
    surface: '#f7fafc',
    text: {
      primary: '#1a202c',
      secondary: '#4a5568',
    },
    border: '#e2e8f0',
    code: {
      background: '#f8f9fa',
      text: '#1a202c',
      comment: '#718096',
      keyword: '#805ad5',
      string: '#38a169',
      function: '#d53f8c',
    },
    sidebar: {
      background: '#f8f9fa',
      activeItem: '#e2e8f0',
      hoverItem: '#edf2f7',
      text: '#2d3748',
    },
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
  },
  borderRadius: {
    sm: '0.125rem',
    md: '0.25rem',
    lg: '0.5rem',
  },
  transitions: {
    fast: '100ms',
    normal: '200ms',
    slow: '300ms',
  },
};

export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    primary: '#60a5fa',
    secondary: '#9ca3af',
    background: '#1a202c',
    surface: '#2d3748',
    text: {
      primary: '#f7fafc',
      secondary: '#e2e8f0',
    },
    border: '#4a5568',
    code: {
      background: '#2d3748',
      text: '#f7fafc',
      comment: '#9ca3af',
      keyword: '#b794f4',
      string: '#68d391',
      function: '#f687b3',
    },
    sidebar: {
      background: '#2d3748',
      activeItem: '#4a5568',
      hoverItem: '#374151',
      text: '#e2e8f0',
    },
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
  },
  borderRadius: {
    sm: '0.125rem',
    md: '0.25rem',
    lg: '0.5rem',
  },
  transitions: {
    fast: '100ms',
    normal: '200ms',
    slow: '300ms',
  },
};

export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const;

export type ThemeName = keyof typeof themes;

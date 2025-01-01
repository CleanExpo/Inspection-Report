import type * as Monaco from 'monaco-editor';

// Define theme with error handling
export const defineTheme = (monaco: typeof Monaco, name: string, theme: EditorThemeConfig) => {
  try {
    monaco.editor.defineTheme(name, theme);
  } catch (error) {
    console.error(`Failed to define theme ${name}:`, error);
    throw error;
  }
};

export interface EditorThemeConfig {
  base: 'vs' | 'vs-dark' | 'hc-black';
  inherit: boolean;
  rules: Array<{
    token: string;
    foreground?: string;
    background?: string;
    fontStyle?: string;
  }>;
  colors: Record<string, string>;
}

// Light theme configuration
export const lightTheme: EditorThemeConfig = {
  base: 'vs',
  inherit: true,
  rules: [
    // Basic syntax
    { token: 'comment', foreground: '008000' },
    { token: 'string', foreground: 'a31515' },
    { token: 'keyword', foreground: '0000ff' },
    { token: 'number', foreground: '098658' },
    { token: 'type', foreground: '267f99' },
    { token: 'function', foreground: '795e26' },
    
    // TypeScript specifics
    { token: 'interface', foreground: '267f99' },
    { token: 'typeParameter', foreground: '267f99' },
    { token: 'enum', foreground: '267f99' },
    { token: 'decorator', foreground: '267f99' },
    
    // JSX/TSX
    { token: 'tag', foreground: '800000' },
    { token: 'tag.id', foreground: '267f99' },
    { token: 'tag.class', foreground: '267f99' },
    { token: 'tag.attribute', foreground: 'ff0000' },
    
    // Additional syntax
    { token: 'regexp', foreground: 'd16969' },
    { token: 'operator', foreground: '000000' },
    { token: 'delimiter', foreground: '000000' }
  ],
  colors: {
    'editor.background': '#ffffff',
    'editor.foreground': '#000000',
    'editor.lineHighlightBackground': '#f7f7f7',
    'editor.selectionBackground': '#add6ff',
    'editorCursor.foreground': '#000000',
    'editorWhitespace.foreground': '#d4d4d4'
  }
};

// Dark theme configuration
export const darkTheme: EditorThemeConfig = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    // Basic syntax
    { token: 'comment', foreground: '6a9955' },
    { token: 'string', foreground: 'ce9178' },
    { token: 'keyword', foreground: '569cd6' },
    { token: 'number', foreground: 'b5cea8' },
    { token: 'type', foreground: '4ec9b0' },
    { token: 'function', foreground: 'dcdcaa' },
    
    // TypeScript specifics
    { token: 'interface', foreground: '4ec9b0' },
    { token: 'typeParameter', foreground: '4ec9b0' },
    { token: 'enum', foreground: '4ec9b0' },
    { token: 'decorator', foreground: '4ec9b0' },
    
    // JSX/TSX
    { token: 'tag', foreground: '569cd6' },
    { token: 'tag.id', foreground: '4ec9b0' },
    { token: 'tag.class', foreground: '4ec9b0' },
    { token: 'tag.attribute', foreground: '9cdcfe' },
    
    // Additional syntax
    { token: 'regexp', foreground: 'd16969' },
    { token: 'operator', foreground: 'd4d4d4' },
    { token: 'delimiter', foreground: 'd4d4d4' }
  ],
  colors: {
    'editor.background': '#1e1e1e',
    'editor.foreground': '#d4d4d4',
    'editor.lineHighlightBackground': '#2d2d2d',
    'editor.selectionBackground': '#264f78',
    'editorCursor.foreground': '#ffffff',
    'editorWhitespace.foreground': '#3b3b3b'
  }
};

// Register themes with Monaco and error handling
export function registerEditorThemes(monaco: typeof Monaco) {
  try {
    defineTheme(monaco, 'custom-light', lightTheme);
    defineTheme(monaco, 'custom-dark', darkTheme);
  } catch (error) {
    console.error('Failed to register editor themes:', error);
    throw error;
  }
}

// Get theme name based on current theme
export function getEditorTheme(currentTheme: 'light' | 'dark'): string {
  return currentTheme === 'dark' ? 'custom-dark' : 'custom-light';
}

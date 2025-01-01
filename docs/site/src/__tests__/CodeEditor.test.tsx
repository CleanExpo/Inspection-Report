import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { CodeEditor } from '../components/CodeEditor';
import { ThemeProvider } from '../components/ThemeProvider';
import { supportedLanguages } from '../utils/languageConfig';
import { registerEditorThemes } from '../utils/editorThemes';

// Mock useAutoSave hook
jest.mock('../hooks/useAutoSave', () => ({
  useAutoSave: jest.fn().mockReturnValue({
    isSaving: false,
    lastSaved: null,
    error: null,
    saveNow: jest.fn()
  })
}));

// Mock the theme registration
jest.mock('../utils/editorThemes', () => ({
  ...jest.requireActual('../utils/editorThemes'),
  registerEditorThemes: jest.fn().mockResolvedValue(undefined),
  getEditorTheme: jest.fn().mockImplementation((theme) => 
    theme === 'dark' ? 'custom-dark' : 'custom-light'
  )
}));


// Mock Monaco editor with onChange support
jest.mock('@monaco-editor/react', () => ({
  default: function MockEditor({ 
    defaultValue, 
    defaultLanguage, 
    theme, 
    options, 
    onMount,
    onChange
  }: any) {
    // Simulate editor mount with Monaco instance
    if (onMount) {
      const mockEditor = {
        focus: jest.fn(),
        getValue: () => defaultValue
      };
      const mockMonaco = {
        editor: {
          defineTheme: jest.fn()
        }
      };
      onMount(mockEditor, mockMonaco);
    }

    // Simulate change event
    React.useEffect(() => {
      if (onChange) {
        onChange(defaultValue);
      }
    }, [defaultValue, onChange]);

    return (
      <div data-testid="mock-editor">
        <div>Monaco Editor Mock</div>
        <div>Language: {defaultLanguage}</div>
        <div>Theme: {theme}</div>
        <div>ReadOnly: {options.readOnly.toString()}</div>
        <pre>{defaultValue}</pre>
      </div>
    );
  }
}));

describe('CodeEditor', () => {
  const renderWithTheme = (component: React.ReactNode) => {
    return render(<ThemeProvider>{component}</ThemeProvider>);
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  // Mock auto-save hook for specific tests
  const mockUseAutoSave = jest.requireMock('../hooks/useAutoSave').useAutoSave;

  it('renders loading state initially', () => {
    renderWithTheme(<CodeEditor />);
    expect(screen.getByText('Loading editor...')).toBeInTheDocument();
  });

  it('renders editor after Monaco initialization', async () => {
    renderWithTheme(<CodeEditor />);
    
    const editor = screen.getByTestId('mock-editor');
    expect(editor).toBeInTheDocument();
    expect(screen.getByText('Language: javascript')).toBeInTheDocument();
    expect(screen.getByText('ReadOnly: false')).toBeInTheDocument();
  });

  it('renders with custom language when supported', () => {
    renderWithTheme(<CodeEditor language="typescript" />);
    expect(screen.getByText('Language: typescript')).toBeInTheDocument();
  });

  it('falls back to javascript for unsupported language', () => {
    renderWithTheme(<CodeEditor language="unsupported" />);
    expect(screen.getByText('Language: javascript')).toBeInTheDocument();
  });

  it('detects language from filename', () => {
    renderWithTheme(<CodeEditor filename="test.ts" />);
    expect(screen.getByText('Language: typescript')).toBeInTheDocument();
  });

  it('prioritizes explicit language over filename detection', () => {
    renderWithTheme(<CodeEditor language="javascript" filename="test.ts" />);
    expect(screen.getByText('Language: javascript')).toBeInTheDocument();
  });

  it('falls back to javascript when no language or filename provided', () => {
    renderWithTheme(<CodeEditor />);
    expect(screen.getByText('Language: javascript')).toBeInTheDocument();
  });

  it('renders with custom value', () => {
    const testCode = 'const test = "Hello World";';
    renderWithTheme(<CodeEditor value={testCode} />);
    expect(screen.getByText(testCode)).toBeInTheDocument();
  });

  it('renders in readonly mode', () => {
    renderWithTheme(<CodeEditor readOnly />);
    expect(screen.getByText('ReadOnly: true')).toBeInTheDocument();
  });

  it('applies correct theme based on context', () => {
    renderWithTheme(<CodeEditor />);
    expect(registerEditorThemes).toHaveBeenCalled();
    expect(screen.getByText('Theme: custom-light')).toBeInTheDocument();
  });

  it('handles theme registration errors gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    (registerEditorThemes as jest.Mock).mockImplementation(() => {
      throw new Error('Theme registration failed');
    });
    
    renderWithTheme(<CodeEditor />);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Theme registration failed'));
    consoleSpy.mockRestore();
  });

  it('enables auto-save by default', () => {
    renderWithTheme(<CodeEditor value="test" />);
    expect(mockUseAutoSave).toHaveBeenCalledWith(expect.objectContaining({
      enabled: true
    }));
  });

  it('disables auto-save when specified', () => {
    renderWithTheme(<CodeEditor value="test" autoSave={false} />);
    expect(mockUseAutoSave).toHaveBeenCalledWith(expect.objectContaining({
      enabled: false
    }));
  });

  it('disables auto-save in readonly mode', () => {
    renderWithTheme(<CodeEditor value="test" readOnly />);
    expect(mockUseAutoSave).toHaveBeenCalledWith(expect.objectContaining({
      enabled: false
    }));
  });

  it('shows save status indicator', async () => {
    mockUseAutoSave.mockReturnValueOnce({
      isSaving: true,
      lastSaved: null,
      error: null,
      saveNow: jest.fn()
    });

    renderWithTheme(<CodeEditor value="test" />);
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('shows error status when save fails', () => {
    const error = new Error('Save failed');
    mockUseAutoSave.mockReturnValueOnce({
      isSaving: false,
      lastSaved: null,
      error,
      saveNow: jest.fn()
    });

    renderWithTheme(<CodeEditor value="test" />);
    expect(screen.getByText('Save failed')).toBeInTheDocument();
  });

  it('shows last saved time when available', () => {
    const lastSaved = new Date();
    mockUseAutoSave.mockReturnValueOnce({
      isSaving: false,
      lastSaved,
      error: null,
      saveNow: jest.fn()
    });

    renderWithTheme(<CodeEditor value="test" />);
    expect(screen.getByText(`Saved ${lastSaved.toLocaleTimeString()}`)).toBeInTheDocument();
  });
});

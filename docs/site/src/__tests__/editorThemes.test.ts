import { lightTheme, darkTheme, defineTheme, registerEditorThemes, getEditorTheme } from '../utils/editorThemes';

// Mock Monaco editor
const mockDefineTheme = jest.fn();
const mockMonaco = {
  editor: {
    defineTheme: mockDefineTheme
  }
};

describe('Editor Themes', () => {
  beforeEach(() => {
    mockDefineTheme.mockClear();
  });

  describe('Theme Configurations', () => {
    it('should have valid light theme configuration', () => {
      expect(lightTheme.base).toBe('vs');
      expect(lightTheme.rules).toBeDefined();
      expect(lightTheme.colors).toBeDefined();
      expect(lightTheme.inherit).toBe(true);
    });

    it('should have valid dark theme configuration', () => {
      expect(darkTheme.base).toBe('vs-dark');
      expect(darkTheme.rules).toBeDefined();
      expect(darkTheme.colors).toBeDefined();
      expect(darkTheme.inherit).toBe(true);
    });
  });

  describe('Theme Registration', () => {
    it('should register both themes', () => {
      registerEditorThemes(mockMonaco as any);
      expect(mockDefineTheme).toHaveBeenCalledTimes(2);
      expect(mockDefineTheme).toHaveBeenCalledWith('custom-light', lightTheme);
      expect(mockDefineTheme).toHaveBeenCalledWith('custom-dark', darkTheme);
    });

    it('should handle theme registration errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockDefineTheme.mockImplementationOnce(() => {
        throw new Error('Theme registration failed');
      });

      expect(() => registerEditorThemes(mockMonaco as any)).toThrow();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Theme Selection', () => {
    it('should return correct theme name for light mode', () => {
      expect(getEditorTheme('light')).toBe('custom-light');
    });

    it('should return correct theme name for dark mode', () => {
      expect(getEditorTheme('dark')).toBe('custom-dark');
    });
  });

  describe('Theme Definition', () => {
    it('should define theme with Monaco editor', () => {
      defineTheme(mockMonaco as any, 'test-theme', lightTheme);
      expect(mockDefineTheme).toHaveBeenCalledWith('test-theme', lightTheme);
    });

    it('should handle theme definition errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockDefineTheme.mockImplementationOnce(() => {
        throw new Error('Theme definition failed');
      });

      expect(() => defineTheme(mockMonaco as any, 'test-theme', lightTheme)).toThrow();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});

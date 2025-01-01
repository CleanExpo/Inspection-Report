import {
  detectLanguage,
  getLanguageConfig,
  isLanguageSupported,
  getLanguageFromAlias,
  supportedLanguages,
  type SupportedLanguage
} from '../utils/languageConfig';

describe('languageConfig', () => {
  describe('detectLanguage', () => {
    it('detects language from file extension', () => {
      expect(detectLanguage('test.js')).toBe('javascript');
      expect(detectLanguage('test.ts')).toBe('typescript');
      expect(detectLanguage('test.css')).toBe('css');
      expect(detectLanguage('test.html')).toBe('html');
    });

    it('handles uppercase extensions', () => {
      expect(detectLanguage('test.JS')).toBe('javascript');
      expect(detectLanguage('test.TSX')).toBe('typescript');
    });

    it('returns undefined for unknown extensions', () => {
      expect(detectLanguage('test.unknown')).toBeUndefined();
    });

    it('returns undefined for files without extensions', () => {
      expect(detectLanguage('testfile')).toBeUndefined();
    });
  });

  describe('getLanguageConfig', () => {
    it('returns configuration for supported languages', () => {
      const jsConfig = getLanguageConfig('javascript');
      expect(jsConfig.id).toBe('javascript');
      expect(jsConfig.extensions).toContain('.js');
      expect(jsConfig.aliases).toContain('js');
    });
  });

  describe('isLanguageSupported', () => {
    it('returns true for supported languages', () => {
      expect(isLanguageSupported('javascript')).toBe(true);
      expect(isLanguageSupported('typescript')).toBe(true);
      expect(isLanguageSupported('html')).toBe(true);
    });

    it('returns false for unsupported languages', () => {
      expect(isLanguageSupported('invalid')).toBe(false);
      expect(isLanguageSupported('')).toBe(false);
    });
  });

  describe('getLanguageFromAlias', () => {
    it('returns language for valid aliases', () => {
      expect(getLanguageFromAlias('js')).toBe('javascript');
      expect(getLanguageFromAlias('ts')).toBe('typescript');
      expect(getLanguageFromAlias('md')).toBe('markdown');
    });

    it('handles uppercase aliases', () => {
      expect(getLanguageFromAlias('JS')).toBe('javascript');
      expect(getLanguageFromAlias('TSX')).toBe('typescript');
    });

    it('returns undefined for unknown aliases', () => {
      expect(getLanguageFromAlias('unknown')).toBeUndefined();
    });
  });
});

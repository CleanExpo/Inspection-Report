import prettier from 'prettier';
import type { Options } from 'prettier';

interface FormatOptions extends Partial<Options> {
  language?: string;
}

const DEFAULT_OPTIONS: Options = {
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  trailingComma: 'es5',
  bracketSpacing: true,
  arrowParens: 'avoid',
  endOfLine: 'lf'
};

/**
 * Get the Prettier parser based on language
 */
const getParser = (language: string): string => {
  switch (language.toLowerCase()) {
    case 'javascript':
    case 'js':
      return 'babel';
    case 'typescript':
    case 'ts':
      return 'typescript';
    case 'css':
      return 'css';
    case 'html':
      return 'html';
    case 'json':
      return 'json';
    case 'markdown':
    case 'md':
      return 'markdown';
    default:
      return 'babel'; // Default to babel parser
  }
};

/**
 * Format code using Prettier with configurable options
 */
export const formatCode = async (
  code: string,
  options: FormatOptions = {}
): Promise<string> => {
  try {
    const parser = options.language ? getParser(options.language) : 'babel';
    const formatOptions: Options = {
      ...DEFAULT_OPTIONS,
      ...options,
      parser
    };

    return prettier.format(code, formatOptions);
  } catch (error) {
    console.error('Formatting error:', error);
    return code; // Return original code if formatting fails
  }
};

/**
 * Check if code needs formatting
 */
export const needsFormatting = async (
  code: string,
  options: FormatOptions = {}
): Promise<boolean> => {
  try {
    const parser = options.language ? getParser(options.language) : 'babel';
    const formatOptions: Options = {
      ...DEFAULT_OPTIONS,
      ...options,
      parser
    };

    return !prettier.check(code, formatOptions);
  } catch (error) {
    console.error('Format check error:', error);
    return false;
  }
};

/**
 * Get default format options for a language
 */
export const getFormatOptions = (language: string): Options => {
  const baseOptions = { ...DEFAULT_OPTIONS };

  switch (language.toLowerCase()) {
    case 'html':
      return {
        ...baseOptions,
        printWidth: 100,
        htmlWhitespaceSensitivity: 'css'
      };
    case 'css':
      return {
        ...baseOptions,
        singleQuote: false
      };
    case 'json':
      return {
        ...baseOptions,
        parser: 'json',
        trailingComma: 'none'
      };
    default:
      return baseOptions;
  }
};

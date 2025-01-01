interface LanguageConfig {
  id: string;
  extensions: readonly string[];
  aliases: readonly string[];
  mimeTypes: readonly string[];
}

// Supported languages with their configurations
export const supportedLanguages: Record<string, LanguageConfig> = {
  javascript: {
    id: 'javascript',
    extensions: ['.js', '.jsx'],
    aliases: ['js', 'jsx'],
    mimeTypes: ['application/javascript'],
  },
  typescript: {
    id: 'typescript',
    extensions: ['.ts', '.tsx'],
    aliases: ['ts', 'tsx'],
    mimeTypes: ['application/typescript'],
  },
  html: {
    id: 'html',
    extensions: ['.html', '.htm'],
    aliases: ['html', 'htm'],
    mimeTypes: ['text/html'],
  },
  css: {
    id: 'css',
    extensions: ['.css'],
    aliases: ['css'],
    mimeTypes: ['text/css'],
  },
  json: {
    id: 'json',
    extensions: ['.json'],
    aliases: ['json'],
    mimeTypes: ['application/json'],
  },
  markdown: {
    id: 'markdown',
    extensions: ['.md', '.markdown'],
    aliases: ['md', 'markdown'],
    mimeTypes: ['text/markdown'],
  },
  yaml: {
    id: 'yaml',
    extensions: ['.yml', '.yaml'],
    aliases: ['yml', 'yaml'],
    mimeTypes: ['application/x-yaml'],
  },
} as const;

export type SupportedLanguage = keyof typeof supportedLanguages;

// Detect language from file extension
export function detectLanguage(filename: string): SupportedLanguage | undefined {
  const extension = filename.toLowerCase().match(/\.[^.]*$/)?.[0];
  
  if (!extension) return undefined;

  for (const [language, config] of Object.entries(supportedLanguages) as [SupportedLanguage, typeof supportedLanguages[SupportedLanguage]][]) {
    if (config.extensions.includes(extension)) {
      return language as SupportedLanguage;
    }
  }

  return undefined;
}

// Get language configuration
export function getLanguageConfig(language: SupportedLanguage) {
  return supportedLanguages[language];
}

// Check if a language is supported
export function isLanguageSupported(language: string): language is SupportedLanguage {
  return language in supportedLanguages;
}

// Get language from alias
export function getLanguageFromAlias(alias: string): SupportedLanguage | undefined {
  const normalizedAlias = alias.toLowerCase();
  
  for (const [language, config] of Object.entries(supportedLanguages) as [SupportedLanguage, typeof supportedLanguages[SupportedLanguage]][]) {
    if (config.aliases.includes(normalizedAlias)) {
      return language as SupportedLanguage;
    }
  }

  return undefined;
}

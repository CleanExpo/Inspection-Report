import { loader } from '@monaco-editor/react';

// Configure Monaco loader with CDN URL
loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.36.1/min/vs'
  }
});

// Initialize Monaco loader
export const initMonaco = async () => {
  try {
    const monaco = await loader.init();
    return monaco;
  } catch (error) {
    console.error('Failed to initialize Monaco editor:', error);
    throw error;
  }
};

// Export loader for testing
export { loader };

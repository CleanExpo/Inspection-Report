/**
 * Utility functions for handling code editor storage and auto-save functionality
 */

const STORAGE_KEY_PREFIX = 'editor_content_';
const LAST_MODIFIED_PREFIX = 'editor_modified_';

interface StorageData {
  content: string;
  timestamp: number;
  version: number;
}

/**
 * Save editor content to localStorage with versioning
 */
export const saveEditorContent = (id: string, content: string): boolean => {
  try {
    const storageData: StorageData = {
      content,
      timestamp: Date.now(),
      version: getLatestVersion(id) + 1
    };
    
    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}${id}`,
      JSON.stringify(storageData)
    );
    return true;
  } catch (error) {
    console.error('Failed to save editor content:', error);
    return false;
  }
};

/**
 * Load editor content from localStorage
 */
export const loadEditorContent = (id: string): string | null => {
  try {
    const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}${id}`);
    if (!data) return null;
    
    const storageData: StorageData = JSON.parse(data);
    return storageData.content;
  } catch (error) {
    console.error('Failed to load editor content:', error);
    return null;
  }
};

/**
 * Get the latest version number for the given editor ID
 */
const getLatestVersion = (id: string): number => {
  try {
    const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}${id}`);
    if (!data) return 0;
    
    const storageData: StorageData = JSON.parse(data);
    return storageData.version;
  } catch {
    return 0;
  }
};

/**
 * Clear stored content for a specific editor
 */
export const clearStoredContent = (id: string): boolean => {
  try {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${id}`);
    return true;
  } catch (error) {
    console.error('Failed to clear editor content:', error);
    return false;
  }
};

/**
 * Check if there is stored content for the given editor ID
 */
export const hasStoredContent = (id: string): boolean => {
  return !!localStorage.getItem(`${STORAGE_KEY_PREFIX}${id}`);
};

/**
 * Get the last modified timestamp for stored content
 */
export const getLastModified = (id: string): number | null => {
  try {
    const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}${id}`);
    if (!data) return null;
    
    const storageData: StorageData = JSON.parse(data);
    return storageData.timestamp;
  } catch {
    return null;
  }
};

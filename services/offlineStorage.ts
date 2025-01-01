import { get, set, del } from 'idb-keyval';

export const saveOffline = async (key: string, value: any): Promise<void> => {
  try {
    await set(key, value);
  } catch (error) {
    console.error('Error saving to IndexedDB:', error);
    throw new Error(`Failed to save data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const loadOffline = async <T>(key: string): Promise<T | null> => {
  try {
    const value = await get(key);
    return value as T;
  } catch (error) {
    console.error('Error loading from IndexedDB:', error);
    throw new Error(`Failed to load data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const removeOffline = async (key: string): Promise<void> => {
  try {
    await del(key);
  } catch (error) {
    console.error('Error removing from IndexedDB:', error);
    throw new Error(`Failed to remove data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Helper to check if IndexedDB is available
export const checkStorageAvailability = async (): Promise<boolean> => {
  try {
    const testKey = '__storage_test__';
    await saveOffline(testKey, true);
    await removeOffline(testKey);
    return true;
  } catch {
    return false;
  }
};

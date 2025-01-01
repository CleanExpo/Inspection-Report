import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing state in sessionStorage
 * @template T The type of the stored value
 * @param {string} key The key under which to store the value in sessionStorage
 * @param {T} initialValue The initial value to use if no value is stored
 * @returns {[T, (value: T | ((prevValue: T) => T)) => void, () => void]} A tuple containing the current value, a setter function, and a remove function
 */
export function useSessionStorage<T>(key: string, initialValue: T): [
  T,
  (value: T | ((prevValue: T) => T)) => void,
  () => void
] {
  // Get from session storage or use initial value
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that persists the new value to sessionStorage
  const setValue = useCallback((value: T | ((prevValue: T) => T)) => {
    if (typeof window === 'undefined') {
      console.warn(`Tried setting sessionStorage key "${key}" even though environment is not a client`);
    }

    try {
      // Allow value to be a function so we have the same API as useState
      const newValue = value instanceof Function ? value(storedValue) : value;

      // Save to session storage
      window.sessionStorage.setItem(key, JSON.stringify(newValue));

      // Save state
      setStoredValue(newValue);
    } catch (error) {
      console.warn(`Error setting sessionStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Remove from sessionStorage
  const remove = useCallback(() => {
    if (typeof window === 'undefined') {
      console.warn(`Tried removing sessionStorage key "${key}" even though environment is not a client`);
    }

    try {
      window.sessionStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Error removing sessionStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for changes to storage in other windows/tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.storageArea === sessionStorage && e.key === key) {
        if (e.newValue) {
          setStoredValue(JSON.parse(e.newValue));
        } else {
          setStoredValue(initialValue);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, remove];
}

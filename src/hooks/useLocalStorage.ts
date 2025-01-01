import { useState, useCallback, useEffect, useRef } from 'react';

export interface UseLocalStorageOptions<T> {
  /**
   * Default value if key doesn't exist
   */
  defaultValue?: T | (() => T);

  /**
   * Whether to enable storage synchronization across tabs/windows
   */
  sync?: boolean;

  /**
   * Custom serializer
   */
  serialize?: (value: T) => string;

  /**
   * Custom deserializer
   */
  deserialize?: (value: string) => T;

  /**
   * Error handler
   */
  onError?: (error: Error) => void;
}

/**
 * Hook for managing state in localStorage
 */
export function useLocalStorage<T>(
  key: string,
  options: UseLocalStorageOptions<T> = {}
) {
  const {
    defaultValue,
    sync = true,
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    onError = console.error,
  } = options;

  // Initialize state from localStorage or default value
  const [state, setState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        return deserialize(item);
      }
      return typeof defaultValue === 'function'
        ? (defaultValue as () => T)()
        : defaultValue;
    } catch (error) {
      onError(error as Error);
      return typeof defaultValue === 'function'
        ? (defaultValue as () => T)()
        : defaultValue;
    }
  });

  // Keep track of current key for storage event handling
  const keyRef = useRef(key);
  useEffect(() => {
    keyRef.current = key;
  }, [key]);

  // Update localStorage when state changes
  useEffect(() => {
    try {
      if (state === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, serialize(state));
      }
    } catch (error) {
      onError(error as Error);
    }
  }, [key, state, serialize, onError]);

  // Sync state across tabs/windows
  useEffect(() => {
    if (!sync) return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== keyRef.current) return;

      try {
        const newValue = event.newValue
          ? deserialize(event.newValue)
          : undefined;

        setState(newValue);
      } catch (error) {
        onError(error as Error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [sync, deserialize, onError]);

  // Update state with error handling
  const updateState = useCallback((
    newValue: T | ((prev: T) => T)
  ) => {
    try {
      setState(prev => {
        const value = typeof newValue === 'function'
          ? (newValue as (prev: T) => T)(prev)
          : newValue;

        return value;
      });
    } catch (error) {
      onError(error as Error);
    }
  }, [onError]);

  // Remove item from localStorage
  const removeItem = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setState(undefined as unknown as T);
    } catch (error) {
      onError(error as Error);
    }
  }, [key, onError]);

  return [state, updateState, removeItem] as const;
}

/**
 * useLocalStorage Hook Usage Guide:
 * 
 * 1. Basic usage:
 *    function App() {
 *      const [count, setCount] = useLocalStorage('count', {
 *        defaultValue: 0,
 *      });
 * 
 *      return (
 *        <button onClick={() => setCount(c => c + 1)}>
 *          Count: {count}
 *        </button>
 *      );
 *    }
 * 
 * 2. With complex objects:
 *    function UserPreferences() {
 *      const [preferences, setPreferences] = useLocalStorage('prefs', {
 *        defaultValue: {
 *          theme: 'light',
 *          notifications: true,
 *        },
 *      });
 * 
 *      return (
 *        <div>
 *          <select
 *            value={preferences.theme}
 *            onChange={e => setPreferences(p => ({
 *              ...p,
 *              theme: e.target.value,
 *            }))}
 *          >
 *            <option value="light">Light</option>
 *            <option value="dark">Dark</option>
 *          </select>
 *        </div>
 *      );
 *    }
 * 
 * 3. With custom serialization:
 *    function DatePicker() {
 *      const [date, setDate] = useLocalStorage('date', {
 *        defaultValue: new Date(),
 *        serialize: date => date.toISOString(),
 *        deserialize: str => new Date(str),
 *      });
 * 
 *      return (
 *        <input
 *          type="date"
 *          value={date.toISOString().split('T')[0]}
 *          onChange={e => setDate(new Date(e.target.value))}
 *        />
 *      );
 *    }
 * 
 * 4. With error handling:
 *    function SafeStorage() {
 *      const [data, setData] = useLocalStorage('data', {
 *        onError: (error) => {
 *          // Log to error reporting service
 *          reportError(error);
 *          // Show user friendly message
 *          toast.error('Failed to save data');
 *        },
 *      });
 * 
 *      return <div>Protected storage</div>;
 *    }
 * 
 * 5. With sync across tabs:
 *    function SyncedTabs() {
 *      const [shared, setShared] = useLocalStorage('shared', {
 *        defaultValue: '',
 *        sync: true,
 *      });
 * 
 *      return (
 *        <input
 *          value={shared}
 *          onChange={e => setShared(e.target.value)}
 *          placeholder="Syncs across tabs"
 *        />
 *      );
 *    }
 * 
 * 6. With removal:
 *    function ClearableStorage() {
 *      const [value, setValue, removeValue] = useLocalStorage('temp', {
 *        defaultValue: 'Clear me',
 *      });
 * 
 *      return (
 *        <div>
 *          <input
 *            value={value}
 *            onChange={e => setValue(e.target.value)}
 *          />
 *          <button onClick={removeValue}>
 *            Clear
 *          </button>
 *        </div>
 *      );
 *    }
 * 
 * Notes:
 * - Type-safe storage
 * - Automatic serialization
 * - Cross-tab synchronization
 * - Custom serializers
 * - Error handling
 * - SSR friendly
 * - Supports removal
 * - Function updates
 */

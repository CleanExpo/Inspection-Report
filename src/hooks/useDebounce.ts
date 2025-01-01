import { useEffect, useRef, useState } from 'react';

export interface UseDebounceOptions {
  /**
   * Delay in milliseconds
   */
  delay?: number;

  /**
   * Whether to use leading edge trigger
   */
  leading?: boolean;

  /**
   * Whether to use trailing edge trigger
   */
  trailing?: boolean;

  /**
   * Maximum wait time in milliseconds
   */
  maxWait?: number;
}

/**
 * Hook for debouncing values
 */
export function useDebounce<T>(
  value: T,
  options: UseDebounceOptions = {}
): T {
  const {
    delay = 500,
    leading = false,
    trailing = true,
    maxWait,
  } = options;

  const [debouncedValue, setDebouncedValue] = useState(value);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const maxWaitTimeoutRef = useRef<NodeJS.Timeout>();
  const leadingRef = useRef(true);
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;

    const shouldExecuteLeading = leading && leadingRef.current;
    if (shouldExecuteLeading) {
      setDebouncedValue(value);
      leadingRef.current = false;
    }

    const clearTimeouts = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (maxWaitTimeoutRef.current) {
        clearTimeout(maxWaitTimeoutRef.current);
      }
    };

    clearTimeouts();

    if (maxWait) {
      maxWaitTimeoutRef.current = setTimeout(() => {
        if (trailing) {
          setDebouncedValue(valueRef.current);
        }
        leadingRef.current = true;
      }, maxWait);
    }

    if (trailing && !shouldExecuteLeading) {
      timeoutRef.current = setTimeout(() => {
        setDebouncedValue(valueRef.current);
        leadingRef.current = true;
      }, delay);
    }

    return clearTimeouts;
  }, [value, delay, maxWait, leading, trailing]);

  return debouncedValue;
}

/**
 * Hook for debouncing functions
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  options: UseDebounceOptions = {}
): (...args: Parameters<T>) => void {
  const {
    delay = 500,
    leading = false,
    trailing = true,
    maxWait,
  } = options;

  const timeoutRef = useRef<NodeJS.Timeout>();
  const maxWaitTimeoutRef = useRef<NodeJS.Timeout>();
  const leadingRef = useRef(true);
  const argsRef = useRef<Parameters<T>>();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return (...args: Parameters<T>) => {
    argsRef.current = args;

    const shouldExecuteLeading = leading && leadingRef.current;
    if (shouldExecuteLeading) {
      callbackRef.current(...args);
      leadingRef.current = false;
    }

    const clearTimeouts = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (maxWaitTimeoutRef.current) {
        clearTimeout(maxWaitTimeoutRef.current);
      }
    };

    clearTimeouts();

    if (maxWait) {
      maxWaitTimeoutRef.current = setTimeout(() => {
        if (trailing && argsRef.current) {
          callbackRef.current(...argsRef.current);
        }
        leadingRef.current = true;
      }, maxWait);
    }

    if (trailing && !shouldExecuteLeading) {
      timeoutRef.current = setTimeout(() => {
        if (argsRef.current) {
          callbackRef.current(...argsRef.current);
        }
        leadingRef.current = true;
      }, delay);
    }
  };
}

/**
 * useDebounce Hook Usage Guide:
 * 
 * 1. Debounce value:
 *    const [search, setSearch] = useState('');
 *    const debouncedSearch = useDebounce(search, {
 *      delay: 500,
 *    });
 * 
 * 2. Debounce callback:
 *    const handleSearch = useDebouncedCallback(
 *      (value: string) => {
 *        // API call
 *      },
 *      { delay: 500 }
 *    );
 * 
 * 3. With leading edge:
 *    const debouncedValue = useDebounce(value, {
 *      delay: 500,
 *      leading: true,
 *      trailing: false,
 *    });
 * 
 * 4. With maximum wait:
 *    const debouncedFn = useDebouncedCallback(
 *      () => console.log('Called'),
 *      {
 *        delay: 1000,
 *        maxWait: 2000,
 *      }
 *    );
 * 
 * 5. In a search component:
 *    function SearchInput() {
 *      const [query, setQuery] = useState('');
 *      const debouncedQuery = useDebounce(query, {
 *        delay: 500,
 *      });
 * 
 *      useEffect(() => {
 *        if (debouncedQuery) {
 *          searchAPI(debouncedQuery);
 *        }
 *      }, [debouncedQuery]);
 * 
 *      return (
 *        <input
 *          value={query}
 *          onChange={(e) => setQuery(e.target.value)}
 *        />
 *      );
 *    }
 * 
 * 6. In a form:
 *    function Form() {
 *      const validateField = useDebouncedCallback(
 *        (value: string) => {
 *          // Validate field
 *        },
 *        { delay: 300 }
 *      );
 * 
 *      return (
 *        <input
 *          onChange={(e) => validateField(e.target.value)}
 *        />
 *      );
 *    }
 * 
 * Notes:
 * - Supports both values and callbacks
 * - Configurable delay
 * - Leading/trailing edge options
 * - Maximum wait time
 * - Cleans up timeouts
 * - Type-safe
 */

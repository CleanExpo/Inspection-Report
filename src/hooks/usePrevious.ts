import { useRef, useEffect } from 'react';

/**
 * Hook for tracking previous values
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/**
 * usePrevious Hook Usage Guide:
 * 
 * 1. Basic usage:
 *    const [count, setCount] = useState(0);
 *    const prevCount = usePrevious(count);
 *    // prevCount will be undefined initially,
 *    // then will contain the previous value of count
 * 
 * 2. With objects:
 *    const [user, setUser] = useState({ name: 'John' });
 *    const prevUser = usePrevious(user);
 *    // Track previous user object
 * 
 * 3. For animations:
 *    function Counter() {
 *      const [count, setCount] = useState(0);
 *      const prevCount = usePrevious(count);
 *      const direction = count > (prevCount ?? 0) ? 'up' : 'down';
 * 
 *      return (
 *        <div className={`counter ${direction}`}>
 *          {count}
 *        </div>
 *      );
 *    }
 * 
 * 4. For comparisons:
 *    function UserProfile({ user }) {
 *      const prevUser = usePrevious(user);
 * 
 *      useEffect(() => {
 *        if (prevUser?.id !== user.id) {
 *          // User has changed, fetch new data
 *          fetchUserData(user.id);
 *        }
 *      }, [user, prevUser]);
 * 
 *      return <div>{user.name}</div>;
 *    }
 * 
 * 5. With multiple values:
 *    function Form({ values }) {
 *      const prevValues = usePrevious(values);
 * 
 *      useEffect(() => {
 *        const changedFields = Object.keys(values).filter(
 *          key => values[key] !== prevValues?.[key]
 *        );
 *        console.log('Changed fields:', changedFields);
 *      }, [values, prevValues]);
 * 
 *      return <form>...</form>;
 *    }
 * 
 * 6. For optimizations:
 *    function ExpensiveComponent({ data }) {
 *      const prevData = usePrevious(data);
 * 
 *      // Only recompute if data has changed
 *      const processedData = useMemo(() => {
 *        if (data === prevData) {
 *          return prevProcessedData.current;
 *        }
 *        return expensiveComputation(data);
 *      }, [data, prevData]);
 * 
 *      return <div>{processedData}</div>;
 *    }
 * 
 * Notes:
 * - Returns undefined on first render
 * - Updates after render phase
 * - Preserves value between renders
 * - Type-safe
 * - Works with any value type
 * - Useful for animations and comparisons
 */

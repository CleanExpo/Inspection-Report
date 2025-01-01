import { useEffect, useRef, useState } from 'react';

export interface UseThrottleOptions {
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
}

/**
 * Hook for throttling values
 */
export function useThrottle<T>(
  value: T,
  options: UseThrottleOptions = {}
): T {
  const {
    delay = 200,
    leading = true,
    trailing = true,
  } = options;

  const [throttledValue, setThrottledValue] = useState(value);
  const lastRan = useRef(Date.now());
  const timeout = useRef<NodeJS.Timeout>();
  const leadingCalled = useRef(false);

  useEffect(() => {
    if (!leadingCalled.current && leading) {
      setThrottledValue(value);
      lastRan.current = Date.now();
      leadingCalled.current = true;
      return;
    }

    const handler = () => {
      if (trailing) {
        setThrottledValue(value);
      }
      lastRan.current = Date.now();
      leadingCalled.current = false;
    };

    const now = Date.now();
    const remaining = delay - (now - lastRan.current);

    if (timeout.current) {
      clearTimeout(timeout.current);
    }

    if (remaining <= 0) {
      handler();
    } else if (trailing) {
      timeout.current = setTimeout(handler, remaining);
    }

    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, [value, delay, leading, trailing]);

  return throttledValue;
}

/**
 * Hook for throttling functions
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  options: UseThrottleOptions = {}
): (...args: Parameters<T>) => void {
  const {
    delay = 200,
    leading = true,
    trailing = true,
  } = options;

  const lastRan = useRef(Date.now());
  const timeout = useRef<NodeJS.Timeout>();
  const leadingCalled = useRef(false);
  const callbackRef = useRef(callback);
  const argsRef = useRef<Parameters<T>>();

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return (...args: Parameters<T>) => {
    argsRef.current = args;

    if (!leadingCalled.current && leading) {
      callbackRef.current(...args);
      lastRan.current = Date.now();
      leadingCalled.current = true;
      return;
    }

    const handler = () => {
      if (trailing && argsRef.current) {
        callbackRef.current(...argsRef.current);
      }
      lastRan.current = Date.now();
      leadingCalled.current = false;
    };

    const now = Date.now();
    const remaining = delay - (now - lastRan.current);

    if (timeout.current) {
      clearTimeout(timeout.current);
    }

    if (remaining <= 0) {
      handler();
    } else if (trailing) {
      timeout.current = setTimeout(handler, remaining);
    }
  };
}

/**
 * useThrottle Hook Usage Guide:
 * 
 * 1. Throttle value:
 *    const [scroll, setScroll] = useState(0);
 *    const throttledScroll = useThrottle(scroll, {
 *      delay: 200,
 *    });
 * 
 * 2. Throttle callback:
 *    const handleScroll = useThrottledCallback(
 *      () => {
 *        console.log(window.scrollY);
 *      },
 *      { delay: 200 }
 *    );
 * 
 * 3. With leading edge only:
 *    const throttledValue = useThrottle(value, {
 *      delay: 200,
 *      leading: true,
 *      trailing: false,
 *    });
 * 
 * 4. With trailing edge only:
 *    const throttledFn = useThrottledCallback(
 *      () => console.log('Called'),
 *      {
 *        delay: 200,
 *        leading: false,
 *        trailing: true,
 *      }
 *    );
 * 
 * 5. In a scroll handler:
 *    function ScrollTracker() {
 *      const [position, setPosition] = useState(0);
 *      const handleScroll = useThrottledCallback(
 *        () => {
 *          setPosition(window.scrollY);
 *        },
 *        { delay: 100 }
 *      );
 * 
 *      useEffect(() => {
 *        window.addEventListener('scroll', handleScroll);
 *        return () => window.removeEventListener('scroll', handleScroll);
 *      }, [handleScroll]);
 * 
 *      return <div>Scroll position: {position}</div>;
 *    }
 * 
 * 6. In a resize handler:
 *    function WindowSize() {
 *      const [size, setSize] = useState({
 *        width: window.innerWidth,
 *        height: window.innerHeight,
 *      });
 * 
 *      const handleResize = useThrottledCallback(
 *        () => {
 *          setSize({
 *            width: window.innerWidth,
 *            height: window.innerHeight,
 *          });
 *        },
 *        { delay: 200 }
 *      );
 * 
 *      useEffect(() => {
 *        window.addEventListener('resize', handleResize);
 *        return () => window.removeEventListener('resize', handleResize);
 *      }, [handleResize]);
 * 
 *      return (
 *        <div>
 *          {size.width} x {size.height}
 *        </div>
 *      );
 *    }
 * 
 * Notes:
 * - Supports both values and callbacks
 * - Configurable delay
 * - Leading/trailing edge options
 * - Cleans up timeouts
 * - Type-safe
 * - Useful for high-frequency events
 */

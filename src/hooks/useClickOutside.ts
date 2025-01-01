import { RefObject, useEffect } from 'react';

export interface UseClickOutsideOptions {
  /**
   * Whether the click outside detection is enabled
   */
  enabled?: boolean;

  /**
   * Additional elements to ignore clicks on
   */
  excludeRefs?: RefObject<HTMLElement>[];

  /**
   * Whether to ignore scrollbar clicks
   */
  ignoreScrollbar?: boolean;
}

/**
 * Hook for detecting clicks outside of a component
 */
export function useClickOutside(
  ref: RefObject<HTMLElement>,
  handler: (event: MouseEvent | TouchEvent) => void,
  options: UseClickOutsideOptions = {}
) {
  const {
    enabled = true,
    excludeRefs = [],
    ignoreScrollbar = true,
  } = options;

  useEffect(() => {
    if (!enabled) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }

      // Do nothing if clicking excluded elements
      if (excludeRefs.some(excludeRef => 
        excludeRef.current?.contains(event.target as Node)
      )) {
        return;
      }

      // Ignore clicks on scrollbar if specified
      if (ignoreScrollbar && event instanceof MouseEvent) {
        const html = document.documentElement;
        const viewport = {
          width: html.clientWidth,
          height: html.clientHeight,
        };
        if (event.clientX >= viewport.width || event.clientY >= viewport.height) {
          return;
        }
      }

      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, enabled, excludeRefs, ignoreScrollbar]);
}

export default useClickOutside;

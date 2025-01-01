import { useEffect, useRef } from 'react';

type EventMap = WindowEventMap & DocumentEventMap & HTMLElementEventMap & {
  'change': MediaQueryListEvent;
};

type ElementType = Window | Document | HTMLElement | MediaQueryList | null;

export interface UseEventListenerOptions {
  /**
   * Whether the event listener is enabled
   */
  enabled?: boolean;

  /**
   * Target element to attach the listener to (defaults to window)
   */
  target?: ElementType;

  /**
   * Event options to pass to addEventListener
   */
  options?: boolean | AddEventListenerOptions;
}

/**
 * Hook for managing event listeners
 */
export function useEventListener<K extends keyof EventMap>(
  eventName: K,
  handler: (event: EventMap[K]) => void,
  options: UseEventListenerOptions = {}
) {
  const {
    enabled = true,
    target = window,
    options: eventOptions,
  } = options;

  // Create a ref that stores the handler
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!enabled || !target) return;

    // Create event listener that calls handler function stored in ref
    const eventListener = (event: Event) => {
      savedHandler.current(event as EventMap[K]);
    };

    target.addEventListener(eventName, eventListener, eventOptions);

    return () => {
      target.removeEventListener(eventName, eventListener, eventOptions);
    };
  }, [eventName, target, enabled, eventOptions]);
}

/**
 * useEventListener Hook Usage Guide:
 * 
 * 1. Basic window event:
 *    useEventListener('resize', () => {
 *      console.log('Window resized');
 *    });
 * 
 * 2. Document event:
 *    useEventListener('visibilitychange', () => {
 *      console.log('Visibility changed');
 *    }, {
 *      target: document,
 *    });
 * 
 * 3. Element event:
 *    const buttonRef = useRef(null);
 *    useEventListener('click', () => {
 *      console.log('Button clicked');
 *    }, {
 *      target: buttonRef.current,
 *    });
 * 
 * 4. MediaQuery event:
 *    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
 *    useEventListener('change', (event: MediaQueryListEvent) => {
 *      console.log('Color scheme changed:', event.matches);
 *    }, {
 *      target: mediaQuery,
 *    });
 * 
 * 5. With event options:
 *    useEventListener('scroll', () => {
 *      console.log('Scrolled');
 *    }, {
 *      options: { passive: true },
 *    });
 * 
 * 6. Enable/disable:
 *    useEventListener('mousemove', () => {
 *      console.log('Mouse moved');
 *    }, {
 *      enabled: isEnabled,
 *    });
 * 
 * Notes:
 * - Type-safe event names and handlers
 * - Supports window, document, element, and MediaQueryList events
 * - Handles cleanup automatically
 * - Supports event options
 * - Can be enabled/disabled
 * - Preserves handler reference
 */

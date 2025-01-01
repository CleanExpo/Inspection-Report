import { useEffect, useCallback, useRef } from 'react';

type KeyHandler = (event: KeyboardEvent) => void;

interface KeyMap {
  [key: string]: KeyHandler;
}

export interface UseKeyboardOptions {
  /**
   * Whether the keyboard handlers are enabled
   */
  enabled?: boolean;

  /**
   * Target element to attach listeners to (defaults to document)
   */
  target?: HTMLElement | null;

  /**
   * Whether to prevent default browser behavior
   */
  preventDefault?: boolean;

  /**
   * Whether to stop event propagation
   */
  stopPropagation?: boolean;

  /**
   * Whether to handle repeat key events
   */
  repeat?: boolean;
}

/**
 * Predefined key combinations
 */
export const Keys = {
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  SPACE: ' ',
  TAB: 'Tab',
  BACKSPACE: 'Backspace',
  DELETE: 'Delete',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
} as const;

/**
 * Hook for handling keyboard interactions
 */
export function useKeyboard(
  keyMap: KeyMap | KeyHandler,
  options: UseKeyboardOptions = {}
) {
  const {
    enabled = true,
    target = null,
    preventDefault = true,
    stopPropagation = true,
    repeat = false,
  } = options;

  // Store handlers in a ref to avoid recreating the event listener
  const handlersRef = useRef<KeyMap | KeyHandler>(keyMap);
  handlersRef.current = keyMap;

  const handleKeyDown = useCallback((event: Event) => {
    const keyboardEvent = event as KeyboardEvent;
    
    if (!enabled || (!repeat && keyboardEvent.repeat)) return;

    const handler = typeof handlersRef.current === 'function'
      ? handlersRef.current
      : handlersRef.current[keyboardEvent.key];

    if (handler) {
      if (preventDefault) keyboardEvent.preventDefault();
      if (stopPropagation) keyboardEvent.stopPropagation();
      handler(keyboardEvent);
    }
  }, [enabled, preventDefault, stopPropagation, repeat]);

  useEffect(() => {
    const element = target || document;

    element.addEventListener('keydown', handleKeyDown);
    return () => element.removeEventListener('keydown', handleKeyDown);
  }, [target, handleKeyDown]);
}

export default useKeyboard;

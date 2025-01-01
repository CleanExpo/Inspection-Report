import { useState, useCallback } from 'react';

export interface UseDisclosureOptions {
  /**
   * Initial open state
   */
  defaultIsOpen?: boolean;

  /**
   * Callback when state changes
   */
  onStateChange?: (isOpen: boolean) => void;

  /**
   * Callback when opening
   */
  onOpen?: () => void;

  /**
   * Callback when closing
   */
  onClose?: () => void;
}

export interface UseDisclosureReturn {
  /**
   * Current open state
   */
  isOpen: boolean;

  /**
   * Function to open
   */
  open: () => void;

  /**
   * Function to close
   */
  close: () => void;

  /**
   * Function to toggle
   */
  toggle: () => void;
}

/**
 * Hook for managing disclosure state (open/close)
 */
export function useDisclosure(options: UseDisclosureOptions = {}): UseDisclosureReturn {
  const {
    defaultIsOpen = false,
    onStateChange,
    onOpen,
    onClose,
  } = options;

  const [isOpen, setIsOpen] = useState(defaultIsOpen);

  const open = useCallback(() => {
    setIsOpen(true);
    onStateChange?.(true);
    onOpen?.();
  }, [onStateChange, onOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
    onStateChange?.(false);
    onClose?.();
  }, [onStateChange, onClose]);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}

export default useDisclosure;

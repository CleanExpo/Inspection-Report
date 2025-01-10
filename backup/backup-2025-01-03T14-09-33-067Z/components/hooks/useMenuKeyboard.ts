import { useCallback, useEffect, useRef } from 'react';

interface UseMenuKeyboardProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (direction: 'next' | 'prev') => void;
  onSelect: () => void;
}

export function useMenuKeyboard({
  isOpen,
  onClose,
  onNavigate,
  onSelect,
}: UseMenuKeyboardProps) {
  const lastFocusedElement = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
      case 'ArrowDown':
        e.preventDefault();
        onNavigate('next');
        break;
      case 'ArrowUp':
        e.preventDefault();
        onNavigate('prev');
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onSelect();
        break;
      case 'Tab':
        // Prevent tabbing out of the menu
        e.preventDefault();
        onNavigate(e.shiftKey ? 'prev' : 'next');
        break;
    }
  }, [isOpen, onClose, onNavigate, onSelect]);

  // Save last focused element when menu opens
  useEffect(() => {
    if (isOpen) {
      lastFocusedElement.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // Restore focus when menu closes
  useEffect(() => {
    if (!isOpen && lastFocusedElement.current) {
      lastFocusedElement.current.focus();
      lastFocusedElement.current = null;
    }
  }, [isOpen]);

  // Add/remove keyboard event listeners
  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  // Focus trap
  const createFocusTrap = useCallback((containerRef: HTMLElement) => {
    const focusableElements = containerRef.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }
  }, []);

  return {
    createFocusTrap,
  };
}

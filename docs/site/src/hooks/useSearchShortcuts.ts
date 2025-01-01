import { useEffect, useRef } from 'react';

interface UseSearchShortcutsProps {
  onOpen: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

export function useSearchShortcuts({ onOpen, inputRef }: UseSearchShortcutsProps) {
  const lastKeyRef = useRef<string>('');
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Forward slash (/) to focus search
      if (e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        onOpen();
        inputRef.current?.focus();
      }

      lastKeyRef.current = e.key;
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onOpen, inputRef]);

  return {
    searchShortcut: navigator.platform.includes('Mac') ? '⌘K' : 'Ctrl+K',
    alternativeShortcut: '/'
  };
}

import { useState, useEffect, useCallback } from 'react';
import type { NavAnimationState } from '../types/navigation';

const ANIMATION_DURATION = 300; // Match the CSS duration

export function useMobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [animationState, setAnimationState] = useState<NavAnimationState>({
    isEntering: false,
    isLeaving: false,
  });

  // Handle animation states
  useEffect(() => {
    let animationTimeout: NodeJS.Timeout;

    if (isOpen) {
      setAnimationState({ isEntering: true, isLeaving: false });
      animationTimeout = setTimeout(() => {
        setAnimationState({ isEntering: false, isLeaving: false });
      }, ANIMATION_DURATION);
    } else {
      setAnimationState({ isEntering: false, isLeaving: true });
      animationTimeout = setTimeout(() => {
        setAnimationState({ isEntering: false, isLeaving: false });
      }, ANIMATION_DURATION);
    }

    return () => clearTimeout(animationTimeout);
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    animationState,
    toggle,
    close,
  };
}

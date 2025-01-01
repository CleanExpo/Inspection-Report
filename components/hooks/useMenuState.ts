import { useState, useEffect, useCallback } from 'react';

interface MenuState {
  lastOpenPath: string;
  scrollPositions: Record<string, number>;
  recentPaths: string[];
  lastInteractionTime: number;
}

const STORAGE_KEY = 'mobile-menu-state';
const MAX_RECENT_PATHS = 5;

export function useMenuState() {
  const [state, setState] = useState<MenuState>(() => {
    if (typeof window === 'undefined') return getInitialState();
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : getInitialState();
    } catch {
      return getInitialState();
    }
  });

  // Persist state changes
  useEffect(() => {
    if (state !== getInitialState()) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const updateLastOpenPath = useCallback((path: string) => {
    setState(prev => ({
      ...prev,
      lastOpenPath: path,
      lastInteractionTime: Date.now(),
      recentPaths: [
        path,
        ...prev.recentPaths.filter(p => p !== path)
      ].slice(0, MAX_RECENT_PATHS),
    }));
  }, []);

  const saveScrollPosition = useCallback((path: string, position: number) => {
    setState(prev => ({
      ...prev,
      scrollPositions: {
        ...prev.scrollPositions,
        [path]: position,
      },
    }));
  }, []);

  const getScrollPosition = useCallback((path: string) => {
    return state.scrollPositions[path] || 0;
  }, [state.scrollPositions]);

  const getRecentPaths = useCallback(() => {
    // Only return paths from last 24 hours
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return state.lastInteractionTime > oneDayAgo ? state.recentPaths : [];
  }, [state.recentPaths, state.lastInteractionTime]);

  return {
    lastOpenPath: state.lastOpenPath,
    recentPaths: getRecentPaths(),
    updateLastOpenPath,
    saveScrollPosition,
    getScrollPosition,
  };
}

function getInitialState(): MenuState {
  return {
    lastOpenPath: '',
    scrollPositions: {},
    recentPaths: [],
    lastInteractionTime: 0,
  };
}

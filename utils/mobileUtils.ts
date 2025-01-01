import { useEffect, useState, useCallback, TouchEvent } from 'react';

// Breakpoints for responsive design
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
};

// Hook to detect screen size
export function useScreenSize() {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const width = window.innerWidth;
      setScreenSize({
        width: width,
        height: window.innerHeight,
        isMobile: width < breakpoints.sm,
        isTablet: width >= breakpoints.sm && width < breakpoints.md,
        isDesktop: width >= breakpoints.md,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
}

// Hook for pull-to-refresh functionality
export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const pullThreshold = 100; // pixels
  let startY = 0;

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const scrollTop = document.documentElement.scrollTop;
    if (scrollTop === 0) {
      startY = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY;
    
    if (distance > 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance * 0.5, pullThreshold));
    }
  }, [isPulling, startY]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;

    if (pullDistance >= pullThreshold) {
      await onRefresh();
    }

    setIsPulling(false);
    setPullDistance(0);
  }, [isPulling, pullDistance, onRefresh]);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    pullDistance,
    isPulling,
  };
}

// Hook for swipe gestures
interface SwipeConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
}

export function useSwipeGesture(config: SwipeConfig) {
  const threshold = config.threshold || 50;
  let startX = 0;
  let startY = 0;
  let startTime = 0;

  const handleTouchStart = useCallback((e: TouchEvent) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    startTime = Date.now();
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - startX;
    const deltaY = e.changedTouches[0].clientY - startY;
    const deltaTime = Date.now() - startTime;

    // Only trigger if the swipe was fast enough (less than 300ms)
    if (deltaTime > 300) return;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0 && config.onSwipeRight) {
          config.onSwipeRight();
        } else if (deltaX < 0 && config.onSwipeLeft) {
          config.onSwipeLeft();
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > threshold) {
        if (deltaY > 0 && config.onSwipeDown) {
          config.onSwipeDown();
        } else if (deltaY < 0 && config.onSwipeUp) {
          config.onSwipeUp();
        }
      }
    }
  }, [config, threshold]);

  return {
    handleTouchStart,
    handleTouchEnd,
  };
}

// Image optimization utilities
export const getOptimizedImageUrl = (url: string, width: number): string => {
  // Add query parameters for image optimization service
  // This is a placeholder - replace with your actual image optimization service
  return `${url}?w=${width}&q=75&auto=format`;
};

// Lazy loading utilities
export function useLazyLoading<T>(
  items: T[],
  pageSize: number = 10
): [T[], () => void, boolean] {
  const [displayedItems, setDisplayedItems] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const hasMore = displayedItems.length < items.length;

  useEffect(() => {
    setDisplayedItems(items.slice(0, pageSize));
  }, [items, pageSize]);

  const loadMore = useCallback(() => {
    const nextPage = currentPage + 1;
    setDisplayedItems(items.slice(0, nextPage * pageSize));
    setCurrentPage(nextPage);
  }, [currentPage, items, pageSize]);

  return [displayedItems, loadMore, hasMore];
}

// Mobile navigation state management
interface NavigationState {
  isDrawerOpen: boolean;
  activeRoute: string;
}

export class MobileNavigationManager {
  private static instance: MobileNavigationManager;
  private state: NavigationState = {
    isDrawerOpen: false,
    activeRoute: '/',
  };
  private listeners: Set<(state: NavigationState) => void> = new Set();

  private constructor() {}

  public static getInstance(): MobileNavigationManager {
    if (!MobileNavigationManager.instance) {
      MobileNavigationManager.instance = new MobileNavigationManager();
    }
    return MobileNavigationManager.instance;
  }

  public toggleDrawer(): void {
    this.updateState({
      ...this.state,
      isDrawerOpen: !this.state.isDrawerOpen,
    });
  }

  public setRoute(route: string): void {
    this.updateState({
      ...this.state,
      activeRoute: route,
      isDrawerOpen: false,
    });
  }

  public subscribe(listener: (state: NavigationState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private updateState(newState: NavigationState): void {
    this.state = newState;
    this.listeners.forEach(listener => listener(this.state));
  }

  public getState(): NavigationState {
    return { ...this.state };
  }
}

export const mobileNavigation = MobileNavigationManager.getInstance();

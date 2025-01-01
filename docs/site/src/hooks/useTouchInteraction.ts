import { useEffect, useRef, useState, useCallback } from 'react';

interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
  initialDistance: number;
}

interface TouchOptions {
  swipeThreshold?: number;
  tapTimeout?: number;
  doubleTapTimeout?: number;
  minSwipeDistance?: number;
  preventScroll?: boolean;
}

export function useTouchInteraction(
  element: React.RefObject<HTMLElement>,
  {
    swipeThreshold = 50,
    tapTimeout = 300,
    doubleTapTimeout = 300,
    minSwipeDistance = 30,
    preventScroll = false,
  }: TouchOptions = {}
) {
  const touchState = useRef<TouchState | null>(null);
  const lastTap = useRef<number>(0);
  const [scale, setScale] = useState(1);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (preventScroll) {
        e.preventDefault();
      }

      if (e.touches.length === 2) {
        // Handle pinch start
        const distance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );

        touchState.current = {
          startX: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          startY: (e.touches[0].clientY + e.touches[1].clientY) / 2,
          startTime: Date.now(),
          initialDistance: distance,
        };
      } else {
        touchState.current = {
          startX: e.touches[0].clientX,
          startY: e.touches[0].clientY,
          startTime: Date.now(),
          initialDistance: 0,
        };
      }
    },
    [preventScroll]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!touchState.current) return;

      if (e.touches.length === 2 && touchState.current.initialDistance > 0) {
        // Handle pinch zoom
        const distance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const newScale = (distance / touchState.current.initialDistance) * scale;
        setScale(Math.min(Math.max(0.5, newScale), 3)); // Limit scale between 0.5 and 3
      }
    },
    [scale]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!touchState.current) return;

      const deltaX = e.changedTouches[0].clientX - touchState.current.startX;
      const deltaY = e.changedTouches[0].clientY - touchState.current.startY;
      const deltaTime = Date.now() - touchState.current.startTime;

      // Detect tap
      if (
        Math.abs(deltaX) < minSwipeDistance &&
        Math.abs(deltaY) < minSwipeDistance &&
        deltaTime < tapTimeout
      ) {
        const now = Date.now();
        if (now - lastTap.current < doubleTapTimeout) {
          // Double tap detected
          element.current?.dispatchEvent(new CustomEvent('doubletap'));
          lastTap.current = 0;
        } else {
          lastTap.current = now;
          element.current?.dispatchEvent(new CustomEvent('tap'));
        }
      }

      // Detect swipe
      if (deltaTime < swipeThreshold) {
        if (Math.abs(deltaX) > minSwipeDistance) {
          const direction = deltaX > 0 ? 'right' : 'left';
          element.current?.dispatchEvent(
            new CustomEvent('swipe', { detail: { direction } })
          );
        } else if (Math.abs(deltaY) > minSwipeDistance) {
          const direction = deltaY > 0 ? 'down' : 'up';
          element.current?.dispatchEvent(
            new CustomEvent('swipe', { detail: { direction } })
          );
        }
      }

      touchState.current = null;
    },
    [doubleTapTimeout, minSwipeDistance, swipeThreshold, tapTimeout]
  );

  useEffect(() => {
    const el = element.current;
    if (!el) return;

    el.addEventListener('touchstart', handleTouchStart, { passive: !preventScroll });
    el.addEventListener('touchmove', handleTouchMove);
    el.addEventListener('touchend', handleTouchEnd);

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [element, handleTouchEnd, handleTouchMove, handleTouchStart, preventScroll]);

  return {
    scale,
    resetScale: () => setScale(1),
  };
}

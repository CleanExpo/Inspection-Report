import { useState, useRef, useCallback } from 'react';

interface TouchPosition {
  x: number;
  y: number;
  timestamp: number;
}

interface GestureState {
  startPosition: TouchPosition | null;
  currentPosition: TouchPosition | null;
  velocity: number;
  direction: 'left' | 'right' | 'up' | 'down' | null;
}

interface GestureOptions {
  minSwipeDistance?: number;
  minVelocity?: number;
  lockAxis?: 'x' | 'y';
}

export function useGesture(options: GestureOptions = {}) {
  const {
    minSwipeDistance = 50,
    minVelocity = 0.5, // pixels per millisecond
    lockAxis
  } = options;

  const [state, setState] = useState<GestureState>({
    startPosition: null,
    currentPosition: null,
    velocity: 0,
    direction: null,
  });

  const frameRef = useRef<number>();

  const calculateVelocity = useCallback((start: TouchPosition, end: TouchPosition) => {
    const distance = Math.sqrt(
      Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
    );
    const time = end.timestamp - start.timestamp;
    return distance / time; // pixels per millisecond
  }, []);

  const calculateDirection = useCallback((start: TouchPosition, end: TouchPosition) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (lockAxis === 'x' || (!lockAxis && absDx > absDy)) {
      return dx > 0 ? 'right' : 'left';
    } else if (lockAxis === 'y' || (!lockAxis && absDy > absDx)) {
      return dy > 0 ? 'down' : 'up';
    }
    return null;
  }, [lockAxis]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

    const position = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      timestamp: Date.now(),
    };

    setState({
      startPosition: position,
      currentPosition: position,
      velocity: 0,
      direction: null,
    });

    // Trigger haptic feedback if supported
    if ('vibrate' in navigator) {
      navigator.vibrate(1);
    }
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!state.startPosition) return;

    const position = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      timestamp: Date.now(),
    };

    frameRef.current = requestAnimationFrame(() => {
      const velocity = calculateVelocity(state.startPosition!, position);
      const direction = calculateDirection(state.startPosition!, position);

      setState(prev => ({
        ...prev,
        currentPosition: position,
        velocity,
        direction,
      }));
    });
  }, [state.startPosition, calculateVelocity, calculateDirection]);

  const onTouchEnd = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

    if (!state.startPosition || !state.currentPosition) {
      return false;
    }

    const dx = state.currentPosition.x - state.startPosition.x;
    const dy = state.currentPosition.y - state.startPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const isValidSwipe = distance >= minSwipeDistance && state.velocity >= minVelocity;

    setState({
      startPosition: null,
      currentPosition: null,
      velocity: 0,
      direction: null,
    });

    return isValidSwipe ? state.direction : null;
  }, [state, minSwipeDistance, minVelocity]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    state,
  };
}

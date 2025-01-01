import { useRef, useCallback } from 'react';

interface SpringConfig {
  stiffness?: number;
  damping?: number;
  mass?: number;
  precision?: number;
}

interface AnimationState {
  position: number;
  velocity: number;
}

const defaultConfig: Required<SpringConfig> = {
  stiffness: 170,
  damping: 26,
  mass: 1,
  precision: 0.01,
};

export function useSpringAnimation(config: SpringConfig = {}) {
  const {
    stiffness,
    damping,
    mass,
    precision,
  } = { ...defaultConfig, ...config };

  const frameRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const stateRef = useRef<AnimationState>({ position: 0, velocity: 0 });

  const animate = useCallback((
    from: number,
    to: number,
    onUpdate: (value: number) => void,
    onComplete?: () => void
  ) => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

    stateRef.current = {
      position: from,
      velocity: 0,
    };

    const step = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const deltaTime = Math.min((timestamp - startTimeRef.current) / 1000, 0.064); // Cap at 64ms
      startTimeRef.current = timestamp;

      // Spring physics calculation
      const springForce = stiffness * (to - stateRef.current.position);
      const dampingForce = damping * stateRef.current.velocity;
      const force = springForce - dampingForce;
      const acceleration = force / mass;

      stateRef.current.velocity += acceleration * deltaTime;
      stateRef.current.position += stateRef.current.velocity * deltaTime;

      // Check if we've reached the target within precision
      const isComplete = 
        Math.abs(to - stateRef.current.position) < precision &&
        Math.abs(stateRef.current.velocity) < precision;

      if (isComplete) {
        onUpdate(to);
        onComplete?.();
        return;
      }

      onUpdate(stateRef.current.position);
      frameRef.current = requestAnimationFrame(step);
    };

    frameRef.current = requestAnimationFrame(step);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [stiffness, damping, mass, precision]);

  const cancel = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
  }, []);

  return {
    animate,
    cancel,
  };
}

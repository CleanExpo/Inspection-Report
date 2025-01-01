import React, { useState, useCallback } from 'react';
import { usePullToRefresh } from '../../utils/mobileUtils';

interface TouchFriendlyButtonProps {
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  className?: string;
  activeClassName?: string;
  children: React.ReactNode;
  longPressDelay?: number;
}

export const TouchFriendlyButton: React.FC<TouchFriendlyButtonProps> = ({
  onPress,
  onLongPress,
  disabled = false,
  className = '',
  activeClassName = '',
  children,
  longPressDelay = 500,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  const handleTouchStart = useCallback(() => {
    if (disabled) return;
    
    setIsPressed(true);
    
    if (onLongPress) {
      const timer = setTimeout(() => {
        onLongPress();
        setIsPressed(false);
      }, longPressDelay);
      
      setLongPressTimer(timer);
    }
  }, [disabled, onLongPress, longPressDelay]);

  const handleTouchEnd = useCallback(() => {
    if (disabled) return;
    
    setIsPressed(false);
    
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    
    onPress?.();
  }, [disabled, longPressTimer, onPress]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();

    // Check if touch point is outside the button
    if (
      touch.clientX < rect.left ||
      touch.clientX > rect.right ||
      touch.clientY < rect.top ||
      touch.clientY > rect.bottom
    ) {
      setIsPressed(false);
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }
    }
  }, [longPressTimer]);

  return (
    <button
      className={`${className} ${isPressed ? activeClassName : ''} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } touch-manipulation`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

interface PullToRefreshContainerProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
}

export const PullToRefreshContainer: React.FC<PullToRefreshContainerProps> = ({
  onRefresh,
  children,
  className = '',
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    pullDistance,
    isPulling,
  } = usePullToRefresh(handleRefresh);

  return (
    <div
      className={`relative ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      {(isPulling || isRefreshing) && (
        <div
          className="absolute left-0 right-0 flex justify-center items-center transition-transform"
          style={{
            transform: `translateY(${pullDistance}px)`,
          }}
        >
          <div className="bg-gray-100 rounded-full p-2">
            {isRefreshing ? (
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div
        className="transition-transform"
        style={{
          transform: `translateY(${pullDistance}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

interface TouchRippleProps {
  color?: string;
  duration?: number;
}

export const TouchRipple: React.FC<TouchRippleProps> = ({
  color = 'rgba(0, 0, 0, 0.1)',
  duration = 600,
}) => {
  const [ripples, setRipples] = useState<Array<{
    id: number;
    x: number;
    y: number;
  }>>([]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    setRipples(prev => [...prev, { id: Date.now(), x, y }]);

    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== Date.now()));
    }, duration);
  }, [duration]);

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      onTouchStart={handleTouchStart}
    >
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          className="absolute rounded-full animate-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            backgroundColor: color,
            animationDuration: `${duration}ms`,
          }}
        />
      ))}
    </div>
  );
};

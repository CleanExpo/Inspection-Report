import React from 'react';
import { useScroll } from '../hooks/useScroll';
import './ScrollProgress.css';

interface ScrollProgressProps {
  offset?: number;
  className?: string;
}

export function ScrollProgress({ offset = 64, className = '' }: ScrollProgressProps) {
  const { progress } = useScroll({ offset });
  const { percentComplete, isAtTop } = progress;

  return (
    <div 
      className={`scroll-progress ${isAtTop ? 'hidden' : ''} ${className}`.trim()}
      role="progressbar"
      aria-valuenow={percentComplete}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div 
        className="scroll-progress-bar"
        style={{ width: `${percentComplete}%` }}
      />
    </div>
  );
}

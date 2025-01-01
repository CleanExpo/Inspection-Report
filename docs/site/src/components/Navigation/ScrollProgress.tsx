import React, { useEffect, useState } from 'react';
import styles from './ScrollProgress.module.css';

export interface ScrollProgressProps {
  containerId?: string; // ID of the container to track (defaults to document)
  color?: string; // Optional custom color
}

export const ScrollProgress: React.FC<ScrollProgressProps> = ({ 
  containerId,
  color = 'var(--primary)'
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const container = containerId 
      ? document.getElementById(containerId)
      : document.documentElement;

    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop || document.documentElement.scrollTop;
      const scrollHeight = container.scrollHeight || document.documentElement.scrollHeight;
      const clientHeight = container.clientHeight || document.documentElement.clientHeight;
      const windowHeight = window.innerHeight;
      
      const scrollDistance = scrollHeight - clientHeight;
      const currentProgress = (scrollTop / scrollDistance) * 100;
      
      setProgress(Math.min(100, Math.max(0, currentProgress)));
    };

    // Initial calculation
    handleScroll();

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Handle resize for responsive layouts
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [containerId]);

  return (
    <div className={styles.progressContainer}>
      <div 
        className={styles.progressBar}
        style={{ 
          width: `${progress}%`,
          backgroundColor: color
        }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
};

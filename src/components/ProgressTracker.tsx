import React, { useEffect, useState } from 'react';

interface ProgressTrackerProps {
  startTime: Date;
  endTime: Date;
  currentProgress?: number;
  showVisual?: boolean;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  startTime,
  endTime,
  currentProgress,
  showVisual = true,
}) => {
  const [progress, setProgress] = useState(currentProgress || 0);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const calculateProgress = () => {
      const now = new Date();
      const total = endTime.getTime() - startTime.getTime();
      const current = now.getTime() - startTime.getTime();
      const percentage = Math.min(Math.max((current / total) * 100, 0), 100);
      return Math.round(percentage);
    };

    const updateProgress = () => {
      const now = new Date();
      // Only update on the hour
      if (now.getMinutes() === 0 || !lastUpdate) {
        const newProgress = calculateProgress();
        setProgress(newProgress);
        setLastUpdate(now);
        
        // Log progress update
        console.log(`Progress Update [${now.toLocaleTimeString()}]:`);
        console.log(`${newProgress}% Complete`);
        if (showVisual) {
          const barLength = 50;
          const filledLength = Math.round((newProgress / 100) * barLength);
          const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
          console.log(`[${bar}] ${newProgress}%`);
        }
      }
    };

    // Initial update
    updateProgress();

    // Check every minute for hourly updates
    const interval = setInterval(updateProgress, 60000);

    return () => clearInterval(interval);
  }, [startTime, endTime, lastUpdate, showVisual]);

  // Visual progress bar component
  const ProgressBar = () => {
    const width = `${progress}%`;
    
    return (
      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-500"
          style={{ width }}
        >
          <div className="h-full bg-blue-600 animate-pulse" />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-lg font-semibold">Progress: {progress}%</span>
        <span className="text-sm text-gray-500">
          Last Updated: {lastUpdate.toLocaleTimeString()}
        </span>
      </div>
      {showVisual && <ProgressBar />}
      <div className="flex justify-between text-sm text-gray-500">
        <span>Start: {startTime.toLocaleDateString()}</span>
        <span>End: {endTime.toLocaleDateString()}</span>
      </div>
    </div>
  );
};

// CLI Progress Bar for non-React environments
export const createCliProgressBar = (
  startTime: Date,
  endTime: Date,
  updateCallback?: (progress: number) => void
) => {
  let lastUpdate: Date | null = null;

  const updateProgress = () => {
    const now = new Date();
    
    // Only update on the hour
    if (now.getMinutes() === 0 || !lastUpdate) {
      const total = endTime.getTime() - startTime.getTime();
      const current = now.getTime() - startTime.getTime();
      const progress = Math.min(Math.max((current / total) * 100, 0), 100);
      const percentage = Math.round(progress);

      // Create visual bar
      const barLength = 50;
      const filledLength = Math.round((percentage / 100) * barLength);
      const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);

      // Log progress
      console.log(`\nProgress Update [${now.toLocaleTimeString()}]:`);
      console.log(`[${bar}] ${percentage}%`);

      lastUpdate = now;
      updateCallback?.(percentage);
    }
  };

  // Initial update
  updateProgress();

  // Set up hourly updates
  const interval = setInterval(updateProgress, 60000);

  // Return cleanup function
  return () => clearInterval(interval);
};

export default ProgressTracker;

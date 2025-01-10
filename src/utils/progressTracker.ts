interface ProgressTrackerOptions {
  startTime: Date;
  endTime: Date;
  updateCallback?: (progress: number) => void;
  barLength?: number;
}

class ProgressTracker {
  private startTime: Date;
  private endTime: Date;
  private lastUpdate: Date | null = null;
  private interval: ReturnType<typeof setInterval> | null = null;
  private updateCallback?: (progress: number) => void;
  private barLength: number;

  constructor(options: ProgressTrackerOptions) {
    this.startTime = options.startTime;
    this.endTime = options.endTime;
    this.updateCallback = options.updateCallback;
    this.barLength = options.barLength || 50;
  }

  private calculateProgress(): number {
    const now = new Date();
    const total = this.endTime.getTime() - this.startTime.getTime();
    const current = now.getTime() - this.startTime.getTime();
    const progress = Math.min(Math.max((current / total) * 100, 0), 100);
    return Math.round(progress);
  }

  private createProgressBar(percentage: number): string {
    const filledLength = Math.round((percentage / 100) * this.barLength);
    return '█'.repeat(filledLength) + '░'.repeat(this.barLength - filledLength);
  }

  private formatTime(date: Date): string {
    return date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      month: 'short',
      day: 'numeric',
    });
  }

  private update(): void {
    const now = new Date();
    
    // Only update on the hour or if it's the first update
    if (now.getMinutes() === 0 || !this.lastUpdate) {
      const percentage = this.calculateProgress();
      const bar = this.createProgressBar(percentage);
      
      // Clear previous line if it exists
      if (this.lastUpdate) {
        process.stdout.write('\x1b[1A\x1b[2K');
      }

      // Print progress update
      console.log('\nProgress Update [' + this.formatTime(now) + ']');
      console.log(`[${bar}] ${percentage}%`);
      console.log(`Start: ${this.formatTime(this.startTime)}`);
      console.log(`End:   ${this.formatTime(this.endTime)}\n`);

      this.lastUpdate = now;
      this.updateCallback?.(percentage);

      // If we've reached or passed the end time, stop tracking
      if (percentage >= 100) {
        this.stop();
      }
    }
  }

  start(): void {
    // Initial update
    this.update();

    // Check every minute for hourly updates
    this.interval = setInterval(() => this.update(), 60000);

    // Ensure we clean up on process exit
    const cleanup = () => {
      this.stop();
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  // Force an immediate update regardless of the hour
  forceUpdate(): void {
    this.lastUpdate = null;
    this.update();
  }
}

// Helper function to create and start a progress tracker
export function trackProgress(options: ProgressTrackerOptions): ProgressTracker {
  const tracker = new ProgressTracker(options);
  tracker.start();
  return tracker;
}

// Example usage:
/*
const startTime = new Date();
const endTime = new Date(startTime.getTime() + (24 * 60 * 60 * 1000)); // 24 hours from now

const tracker = trackProgress({
  startTime,
  endTime,
  updateCallback: (progress) => {
    // Optional callback for progress updates
    console.log(`Progress callback: ${progress}%`);
  }
});

// To stop tracking:
// tracker.stop();

// To force an immediate update:
// tracker.forceUpdate();
*/

export default ProgressTracker;

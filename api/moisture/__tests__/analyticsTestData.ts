import { AnalyticsMoistureReading } from '../analytics/types';

// Basic readings for trend analysis
type TrendType = 'increasing' | 'decreasing' | 'stable';

export const generateTrendReadings = (trend: TrendType = 'increasing', count: number = 3): AnalyticsMoistureReading[] => {
  return Array(count).fill(null).map((_, i) => {
    const baseValue = 20;
    const value = trend === 'increasing' ? baseValue + (i * 2) :
                 trend === 'decreasing' ? baseValue - (i * 2) :
                 baseValue + (Math.random() * 0.2 - 0.1); // Stable with tiny variations
    
    const timestamp = new Date(`2024-01-01T${10 + i}:00:00Z`);
    
    return {
      value,
      timestamp,
      location: 'Room1'
    };
  });
};

export const basicReadings = generateTrendReadings();

// Time-based readings for aggregation
export const generateTimeBasedReadings = generateTrendReadings;
export const generatePeriodReadings = generateTrendReadings;

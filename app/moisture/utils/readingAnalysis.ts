import { MoistureUnit } from '@prisma/client';

// Extended types to match Prisma schema
interface ReadingDataPoint {
  id: string;
  readingId: string;
  value: number;
  unit: MoistureUnit;
  timestamp: string;
  depth?: number;
}

interface MoistureReading {
  id: string;
  jobId: string;
  locationX: number;
  locationY: number;
  room: string;
  floor: number;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  equipmentId: string;
  temperature?: number | null;
  humidity?: number | null;
  pressure?: number | null;
  dataPoints: ReadingDataPoint[];
}

interface AnalysisResult {
  average: number;
  median: number;
  min: number;
  max: number;
  standardDeviation: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  changeRate: number;
}

interface ReadingTrend {
  timestamp: string;
  value: number;
  unit: MoistureUnit;
}

interface ExportFormat {
  csv: string;
  json: string;
}

// Calculate statistical analysis for a set of readings
export function analyzeReadings(readings: MoistureReading[]): AnalysisResult {
  const values = readings.flatMap(reading => 
    reading.dataPoints.map(point => point.value)
  );

  if (values.length === 0) {
    throw new Error('No readings available for analysis');
  }

  // Calculate basic statistics
  const average = calculateAverage(values);
  const median = calculateMedian(values);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const standardDeviation = calculateStandardDeviation(values, average);

  // Calculate trend
  const trends = readings
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .flatMap(reading => 
      reading.dataPoints.map(point => ({
        timestamp: point.timestamp,
        value: point.value,
        unit: point.unit
      }))
    );

  const { trend, changeRate } = calculateTrend(trends);

  return {
    average,
    median,
    min,
    max,
    standardDeviation,
    trend,
    changeRate
  };
}

// Helper function to calculate average
function calculateAverage(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

// Helper function to calculate median
function calculateMedian(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  return sorted[middle];
}

// Helper function to calculate standard deviation
function calculateStandardDeviation(values: number[], average: number): number {
  const squareDiffs = values.map(value => {
    const diff = value - average;
    return diff * diff;
  });

  const avgSquareDiff = calculateAverage(squareDiffs);
  return Math.sqrt(avgSquareDiff);
}

// Helper function to calculate trend
function calculateTrend(readings: ReadingTrend[]): { trend: 'increasing' | 'decreasing' | 'stable', changeRate: number } {
  if (readings.length < 2) {
    return { trend: 'stable', changeRate: 0 };
  }

  // Calculate linear regression
  const xValues = readings.map(r => new Date(r.timestamp).getTime());
  const yValues = readings.map(r => r.value);
  
  const xAvg = calculateAverage(xValues);
  const yAvg = calculateAverage(yValues);
  
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < readings.length; i++) {
    const xDiff = xValues[i] - xAvg;
    const yDiff = yValues[i] - yAvg;
    numerator += xDiff * yDiff;
    denominator += xDiff * xDiff;
  }
  
  const slope = numerator / denominator;
  const changeRate = slope * (24 * 60 * 60 * 1000); // Convert to change per day

  // Determine trend based on slope and threshold
  const TREND_THRESHOLD = 0.1; // 10% change per day threshold
  if (Math.abs(changeRate) < TREND_THRESHOLD) {
    return { trend: 'stable', changeRate };
  }
  return {
    trend: changeRate > 0 ? 'increasing' : 'decreasing',
    changeRate
  };
}

// Export readings to different formats
export function exportReadings(readings: MoistureReading[]): ExportFormat {
  // Create CSV format
  const csvRows = [
    // CSV Header
    [
      'Reading ID',
      'Job ID',
      'Location X',
      'Location Y',
      'Room',
      'Floor',
      'Timestamp',
      'Value',
      'Unit',
      'Depth',
      'Temperature',
      'Humidity',
      'Pressure',
      'Equipment ID',
      'Notes'
    ].join(',')
  ];

  readings.forEach(reading => {
    reading.dataPoints.forEach(point => {
      csvRows.push([
        reading.id,
        reading.jobId,
        reading.locationX,
        reading.locationY,
        reading.room,
        reading.floor,
        point.timestamp,
        point.value,
        point.unit,
        point.depth || '',
        reading.temperature || '',
        reading.humidity || '',
        reading.pressure || '',
        reading.equipmentId,
        reading.notes?.replace(/,/g, ';') || ''
      ].join(','));
    });
  });

  // Create JSON format (already structured)
  const jsonData = readings.map(reading => ({
    ...reading,
    dataPoints: reading.dataPoints.map(point => ({
      ...point,
      timestamp: new Date(point.timestamp).toISOString()
    }))
  }));

  return {
    csv: csvRows.join('\n'),
    json: JSON.stringify(jsonData, null, 2)
  };
}

// Calculate historical statistics for a specific location
export function analyzeLocationHistory(
  readings: MoistureReading[],
  locationX: number,
  locationY: number,
  room: string,
  floor: number
): AnalysisResult {
  const locationReadings = readings.filter(reading =>
    reading.locationX === locationX &&
    reading.locationY === locationY &&
    reading.room === room &&
    reading.floor === floor
  );

  return analyzeReadings(locationReadings);
}

// Generate time-series data for trending
export function generateTimeSeries(readings: MoistureReading[]): ReadingTrend[] {
  return readings
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .flatMap(reading =>
      reading.dataPoints.map(point => ({
        timestamp: point.timestamp,
        value: point.value,
        unit: point.unit
      }))
    );
}

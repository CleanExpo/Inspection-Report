import { 
  MeasurementPoint, 
  MeasurementTemplate, 
  MeasurementComparison,
  MeasurementHistory,
  MeasurementSession
} from './types';
import { MoistureReading } from '../FloorPlanViewer/types';

/**
 * Finds the nearest reading to a measurement point
 */
export const findNearestReading = (
  point: MeasurementPoint,
  readings: MoistureReading[],
  maxDistance: number = 0.5 // Maximum distance in coordinate units
): MoistureReading | undefined => {
  let nearest: MoistureReading | undefined;
  let minDistance = maxDistance;

  readings.forEach(reading => {
    const distance = Math.sqrt(
      Math.pow(reading.locationX - point.x, 2) +
      Math.pow(reading.locationY - point.y, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearest = reading;
    }
  });

  return nearest;
};

/**
 * Calculates deviation between expected and actual values
 */
export const calculateDeviation = (
  expected: number,
  actual: number,
  tolerance: number
): { deviation: number; withinTolerance: boolean } => {
  const deviation = actual - expected;
  const withinTolerance = Math.abs(deviation) <= tolerance;

  return { deviation, withinTolerance };
};

/**
 * Generates comparisons for all points in a template
 */
export const generateComparisons = (
  template: MeasurementTemplate,
  readings: MoistureReading[]
): MeasurementComparison[] => {
  return template.points.map(point => {
    const nearestReading = findNearestReading(point, readings);
    const expectedValue = point.expectedValue ?? template.referenceValues.dry;
    const tolerance = point.tolerance ?? (template.referenceValues.warning - template.referenceValues.dry) / 2;

    if (!nearestReading) {
      return {
        point,
        expectedValue,
        actualValue: 0,
        deviation: -expectedValue,
        withinTolerance: false
      };
    }

    const { deviation, withinTolerance } = calculateDeviation(
      expectedValue,
      nearestReading.value,
      tolerance
    );

    return {
      point,
      expectedValue,
      actualValue: nearestReading.value,
      deviation,
      withinTolerance
    };
  });
};

/**
 * Calculates summary statistics for a set of comparisons
 */
export const calculateSummary = (
  comparisons: MeasurementComparison[]
) => {
  const deviations = comparisons.map(c => Math.abs(c.deviation));
  const outOfTolerance = comparisons.filter(c => !c.withinTolerance);

  return {
    averageDeviation: deviations.reduce((a, b) => a + b, 0) / deviations.length,
    maxDeviation: Math.max(...deviations),
    pointsOutOfTolerance: outOfTolerance.length
  };
};

/**
 * Creates a measurement history entry
 */
export const createHistoryEntry = (
  session: MeasurementSession,
  template: MeasurementTemplate
): MeasurementHistory => {
  const comparisons = generateComparisons(template, session.readings);
  const summary = calculateSummary(comparisons);

  return {
    sessionId: session.id,
    templateId: template.id,
    timestamp: new Date(),
    readings: session.readings,
    comparisons,
    summary
  };
};

/**
 * Formats measurement data for export
 */
export const formatForExport = (
  history: MeasurementHistory,
  format: 'csv' | 'json'
): string => {
  if (format === 'json') {
    return JSON.stringify(history, null, 2);
  }

  // CSV format
  const headers = [
    'Point Label',
    'X',
    'Y',
    'Expected Value',
    'Actual Value',
    'Deviation',
    'Within Tolerance'
  ].join(',');

  const rows = history.comparisons.map(comparison => [
    comparison.point.label,
    comparison.point.x,
    comparison.point.y,
    comparison.expectedValue,
    comparison.actualValue,
    comparison.deviation,
    comparison.withinTolerance
  ].join(','));

  const summary = [
    'Summary',
    '',
    '',
    `Average Deviation,${history.summary.averageDeviation}`,
    `Max Deviation,${history.summary.maxDeviation}`,
    `Points Out of Tolerance,${history.summary.pointsOutOfTolerance}`
  ].join('\n');

  return [headers, ...rows, '', summary].join('\n');
};

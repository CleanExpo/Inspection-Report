import {
  findNearestReading,
  calculateDeviation,
  generateComparisons,
  calculateSummary,
  createHistoryEntry,
  formatForExport
} from '../measurementUtils';
import { 
  MeasurementPoint,
  MeasurementTemplate,
  MeasurementSession
} from '../types';
import { MoistureReading } from '../../FloorPlanViewer/types';

describe('measurementUtils', () => {
  const mockPoint: MeasurementPoint = {
    id: 'point1',
    label: 'P1',
    x: 0,
    y: 0,
    expectedValue: 20,
    tolerance: 5
  };

  const mockReadings: MoistureReading[] = [
    {
      id: '1',
      jobId: 'job1',
      locationX: 0.1,
      locationY: 0.1,
      value: 25,
      room: 'Room1',
      floor: 'Floor1',
      temperature: 20,
      humidity: 45,
      pressure: 1013,
      createdAt: new Date(),
      updatedAt: new Date(),
      notes: null,
      equipmentId: 'equip1',
      floorPlanId: 'plan1'
    },
    {
      id: '2',
      jobId: 'job1',
      locationX: 2,
      locationY: 2,
      value: 30,
      room: 'Room1',
      floor: 'Floor1',
      temperature: 20,
      humidity: 45,
      pressure: 1013,
      createdAt: new Date(),
      updatedAt: new Date(),
      notes: null,
      equipmentId: 'equip1',
      floorPlanId: 'plan1'
    }
  ];

  const mockTemplate: MeasurementTemplate = {
    id: 'template1',
    name: 'Test Template',
    description: 'Test Description',
    points: [mockPoint],
    gridSpacing: 1,
    referenceValues: {
      dry: 15,
      warning: 25,
      critical: 35
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  describe('findNearestReading', () => {
    it('finds the closest reading within maxDistance', () => {
      const nearest = findNearestReading(mockPoint, mockReadings);
      expect(nearest).toBe(mockReadings[0]);
    });

    it('returns undefined when no readings are within maxDistance', () => {
      const farPoint: MeasurementPoint = { ...mockPoint, x: 10, y: 10 };
      const nearest = findNearestReading(farPoint, mockReadings, 0.1);
      expect(nearest).toBeUndefined();
    });
  });

  describe('calculateDeviation', () => {
    it('calculates positive deviation', () => {
      const result = calculateDeviation(20, 25, 5);
      expect(result.deviation).toBe(5);
      expect(result.withinTolerance).toBe(true);
    });

    it('calculates negative deviation', () => {
      const result = calculateDeviation(20, 14, 5);
      expect(result.deviation).toBe(-6);
      expect(result.withinTolerance).toBe(false);
    });
  });

  describe('generateComparisons', () => {
    it('generates comparisons for all template points', () => {
      const comparisons = generateComparisons(mockTemplate, mockReadings);
      expect(comparisons).toHaveLength(mockTemplate.points.length);
      expect(comparisons[0].actualValue).toBe(mockReadings[0].value);
    });

    it('handles missing readings', () => {
      const farPoint: MeasurementPoint = { ...mockPoint, x: 10, y: 10 };
      const template: MeasurementTemplate = { ...mockTemplate, points: [farPoint] };
      const comparisons = generateComparisons(template, mockReadings);
      expect(comparisons[0].actualValue).toBe(0);
      expect(comparisons[0].withinTolerance).toBe(false);
    });
  });

  describe('calculateSummary', () => {
    it('calculates summary statistics', () => {
      const comparisons = generateComparisons(mockTemplate, mockReadings);
      const summary = calculateSummary(comparisons);
      expect(summary.averageDeviation).toBeDefined();
      expect(summary.maxDeviation).toBeDefined();
      expect(summary.pointsOutOfTolerance).toBeDefined();
    });
  });

  describe('createHistoryEntry', () => {
    it('creates a complete history entry', () => {
      const session: MeasurementSession = {
        id: 'session1',
        templateId: mockTemplate.id,
        jobId: 'job1',
        readings: mockReadings,
        startTime: new Date(),
        status: 'completed'
      };

      const history = createHistoryEntry(session, mockTemplate);
      expect(history.sessionId).toBe(session.id);
      expect(history.comparisons).toHaveLength(mockTemplate.points.length);
      expect(history.summary).toBeDefined();
    });
  });

  describe('formatForExport', () => {
    it('formats data as JSON', () => {
      const session: MeasurementSession = {
        id: 'session1',
        templateId: mockTemplate.id,
        jobId: 'job1',
        readings: mockReadings,
        startTime: new Date(),
        status: 'completed'
      };

      const history = createHistoryEntry(session, mockTemplate);
      const json = formatForExport(history, 'json');
      expect(() => JSON.parse(json)).not.toThrow();
    });

    it('formats data as CSV', () => {
      const session: MeasurementSession = {
        id: 'session1',
        templateId: mockTemplate.id,
        jobId: 'job1',
        readings: mockReadings,
        startTime: new Date(),
        status: 'completed'
      };

      const history = createHistoryEntry(session, mockTemplate);
      const csv = formatForExport(history, 'csv');
      expect(csv).toContain('Point Label,X,Y');
      expect(csv).toContain('Summary');
    });
  });
});

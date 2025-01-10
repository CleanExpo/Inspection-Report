import {
  createHistoryEntry,
  createVersionInfo,
  analyzeTrends,
  compareReadings,
  generateReport,
  validateRollback,
  createAuditLogEntry,
  HistoryTrackingError
} from '../../app/utils/historyTracking';
import {
  EntityType,
  ChangeType,
  ReadingHistory,
  TrendAnalysis
} from '../../app/types/history';
import { MaterialType } from '../../app/types/moisture';
import { EquipmentType } from '../../app/types/equipment';

describe('History Tracking Tests', () => {
  describe('createHistoryEntry', () => {
    it('should create a valid history entry', () => {
      const entry = createHistoryEntry(
        'reading-1',
        EntityType.READING,
        ChangeType.CREATE,
        'user-1',
        null,
        { value: 50 }
      );

      expect(entry.id).toBeDefined();
      expect(entry.entityId).toBe('reading-1');
      expect(entry.entityType).toBe(EntityType.READING);
      expect(entry.changeType).toBe(ChangeType.CREATE);
      expect(entry.userId).toBe('user-1');
      expect(entry.previousVersion).toBeUndefined();
      expect(JSON.parse(entry.newVersion)).toEqual({ value: 50 });
    });

    it('should include previous version when provided', () => {
      const entry = createHistoryEntry(
        'reading-1',
        EntityType.READING,
        ChangeType.UPDATE,
        'user-1',
        { value: 50 },
        { value: 60 }
      );

      expect(JSON.parse(entry.previousVersion!)).toEqual({ value: 50 });
      expect(JSON.parse(entry.newVersion)).toEqual({ value: 60 });
    });
  });

  describe('createVersionInfo', () => {
    it('should create valid version info', () => {
      const version = createVersionInfo(
        'reading-1',
        EntityType.READING,
        { value: 50 },
        'parent-1',
        'main',
        ['stable']
      );

      expect(version.versionId).toBeDefined();
      expect(version.hash).toBeDefined();
      expect(version.entityId).toBe('reading-1');
      expect(version.parentVersion).toBe('parent-1');
      expect(version.branchName).toBe('main');
      expect(version.tags).toEqual(['stable']);
      expect(JSON.parse(version.state)).toEqual({ value: 50 });
    });

    it('should generate consistent hashes for same content', () => {
      const state = { value: 50 };
      const version1 = createVersionInfo('reading-1', EntityType.READING, state);
      const version2 = createVersionInfo('reading-1', EntityType.READING, state);

      expect(version1.hash).toBe(version2.hash);
    });
  });

  describe('analyzeTrends', () => {
    const mockHistory: ReadingHistory = {
      readingId: 'reading-1',
      materialType: MaterialType.DRYWALL,
      equipmentType: EquipmentType.MOISTURE_METER,
      values: [
        {
          timestamp: new Date('2024-01-01'),
          value: 50,
          confidence: 0.9,
          environmentalConditions: {
            temperature: 20,
            humidity: 50
          }
        },
        {
          timestamp: new Date('2024-01-02'),
          value: 55,
          confidence: 0.9,
          environmentalConditions: {
            temperature: 21,
            humidity: 51
          }
        },
        {
          timestamp: new Date('2024-01-03'),
          value: 60,
          confidence: 0.9,
          environmentalConditions: {
            temperature: 22,
            humidity: 52
          }
        }
      ]
    };

    it('should detect increasing trend', () => {
      const analysis = analyzeTrends(mockHistory, {
        minDataPoints: 3,
        confidenceThreshold: 0.8,
        anomalyThreshold: 2
      });

      expect(analysis.trend).toBe('INCREASING');
      expect(analysis.confidence).toBeGreaterThanOrEqual(0.8);
      expect(analysis.statistics.average).toBe(55);
      expect(analysis.anomalies).toHaveLength(0);
    });

    it('should reject insufficient data points', () => {
      const insufficientHistory = {
        ...mockHistory,
        values: mockHistory.values.slice(0, 1)
      };

      expect(() => analyzeTrends(insufficientHistory, {
        minDataPoints: 3,
        confidenceThreshold: 0.8,
        anomalyThreshold: 2
      })).toThrow(HistoryTrackingError);
    });

    it('should detect anomalies', () => {
      const historyWithAnomaly = {
        ...mockHistory,
        values: [
          ...mockHistory.values,
          {
            timestamp: new Date('2024-01-04'),
            value: 100, // Anomalous value
            confidence: 0.9,
            environmentalConditions: {
              temperature: 23,
              humidity: 53
            }
          }
        ]
      };

      const analysis = analyzeTrends(historyWithAnomaly, {
        minDataPoints: 3,
        confidenceThreshold: 0.8,
        anomalyThreshold: 2
      });

      expect(analysis.anomalies).toHaveLength(1);
      expect(analysis.anomalies[0].value).toBe(100);
    });
  });

  describe('compareReadings', () => {
    const mockHistories: ReadingHistory[] = [
      {
        readingId: 'reading-1',
        materialType: MaterialType.DRYWALL,
        equipmentType: EquipmentType.MOISTURE_METER,
        values: [
          {
            timestamp: new Date('2024-01-01'),
            value: 50,
            confidence: 0.9,
            environmentalConditions: {
              temperature: 20,
              humidity: 50
            }
          }
        ]
      },
      {
        readingId: 'reading-2',
        materialType: MaterialType.DRYWALL,
        equipmentType: EquipmentType.MOISTURE_METER,
        values: [
          {
            timestamp: new Date('2024-01-01'),
            value: 52,
            confidence: 0.9,
            environmentalConditions: {
              temperature: 20,
              humidity: 50
            }
          }
        ]
      }
    ];

    it('should compare similar readings', () => {
      const comparison = compareReadings(mockHistories, {
        method: 'VALUE',
        tolerance: 5,
        normalizeData: true
      });

      expect(comparison.readingIds).toEqual(['reading-1', 'reading-2']);
      expect(comparison.correlation).toBeGreaterThanOrEqual(0);
      expect(comparison.similarityScore).toBeGreaterThanOrEqual(0);
    });

    it('should reject single reading comparison', () => {
      expect(() => compareReadings([mockHistories[0]], {
        method: 'VALUE',
        tolerance: 5
      })).toThrow(HistoryTrackingError);
    });
  });

  describe('generateReport', () => {
    const mockEntries = [
      createHistoryEntry(
        'reading-1',
        EntityType.READING,
        ChangeType.CREATE,
        'user-1',
        null,
        { value: 50 }
      ),
      createHistoryEntry(
        'reading-1',
        EntityType.READING,
        ChangeType.UPDATE,
        'user-1',
        { value: 50 },
        { value: 60 }
      )
    ];

    it('should generate valid report', () => {
      const report = generateReport(mockEntries);

      expect(report.id).toBeDefined();
      expect(report.entityId).toBe('reading-1');
      expect(report.changes.total).toBe(2);
      expect(report.changes.byType[ChangeType.CREATE]).toBe(1);
      expect(report.changes.byType[ChangeType.UPDATE]).toBe(1);
    });

    it('should reject empty entries', () => {
      expect(() => generateReport([])).toThrow(HistoryTrackingError);
    });
  });

  describe('validateRollback', () => {
    it('should validate rollback with valid previous version', () => {
      const entry = createHistoryEntry(
        'reading-1',
        EntityType.READING,
        ChangeType.UPDATE,
        'user-1',
        { value: 50 },
        { value: 60 }
      );

      expect(() => validateRollback(entry, {
        cascadeChanges: false,
        updateReferences: false,
        preserveAuditTrail: true
      })).not.toThrow();
    });

    it('should reject rollback without previous version', () => {
      const entry = createHistoryEntry(
        'reading-1',
        EntityType.READING,
        ChangeType.CREATE,
        'user-1',
        null,
        { value: 50 }
      );

      expect(() => validateRollback(entry, {
        cascadeChanges: false,
        updateReferences: false,
        preserveAuditTrail: true
      })).toThrow(HistoryTrackingError);
    });
  });

  describe('createAuditLogEntry', () => {
    it('should create audit log with additional info', () => {
      const entry = createHistoryEntry(
        'reading-1',
        EntityType.READING,
        ChangeType.UPDATE,
        'user-1',
        { value: 50 },
        { value: 60 }
      );

      const auditLog = createAuditLogEntry(
        entry,
        '127.0.0.1',
        'Mozilla/5.0',
        { x: 100, y: 200, floor: 1 },
        { isValid: true, errors: [] }
      );

      expect(auditLog.ipAddress).toBe('127.0.0.1');
      expect(auditLog.userAgent).toBe('Mozilla/5.0');
      expect(auditLog.location).toEqual({ x: 100, y: 200, floor: 1 });
      expect(auditLog.validationResults).toEqual({ isValid: true, errors: [] });
    });
  });
});

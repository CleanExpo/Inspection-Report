import { performanceMonitoringService, PerformanceMonitoringError } from '../../app/services/performanceMonitoringService';
import { prisma } from '../../app/lib/prisma';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import {
  MetricType,
  AnomalyType,
  RiskLevel
} from '../../app/types/performance';
import { EquipmentType, EquipmentStatus } from '../../app/types/equipment';
import { MaterialType } from '../../app/types/moisture';

// Mock Prisma
jest.mock('../../app/lib/prisma', () => ({
  prisma: mockDeep<PrismaClient>()
}));

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe('Performance Monitoring Service', () => {
  beforeEach(() => {
    mockReset(prismaMock);
  });

  const mockEquipment = {
    id: 'equip-1',
    type: EquipmentType.MOISTURE_METER,
    status: EquipmentStatus.ACTIVE,
    materialType: MaterialType.DRYWALL
  };

  describe('trackUsage', () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-31');

    it('should track equipment usage', async () => {
      prismaMock.moistureReading.findMany.mockResolvedValue([
        {
          id: 'reading-1',
          equipmentId: 'equip-1',
          value: 50,
          timestamp: new Date('2024-01-15'),
          user: {
            id: 'user-1',
            name: 'John Doe'
          }
        }
      ]);

      const result = await performanceMonitoringService.trackUsage(
        'equip-1',
        startDate,
        endDate
      );

      expect(result.equipmentId).toBe('equip-1');
      expect(result.period.start).toEqual(startDate);
      expect(result.period.end).toEqual(endDate);
      expect(result.readings).toBeGreaterThan(0);
      expect(result.uniqueUsers).toBeGreaterThan(0);
    });

    it('should handle period with no readings', async () => {
      prismaMock.moistureReading.findMany.mockResolvedValue([]);

      const result = await performanceMonitoringService.trackUsage(
        'equip-1',
        startDate,
        endDate
      );

      expect(result.readings).toBe(0);
      expect(result.uniqueUsers).toBe(0);
    });
  });

  describe('analyzeEfficiency', () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-31');

    it('should analyze equipment efficiency', async () => {
      prismaMock.equipment.findUnique.mockResolvedValue(mockEquipment);
      prismaMock.moistureReading.findMany.mockResolvedValue([
        {
          id: 'reading-1',
          equipmentId: 'equip-1',
          value: 50,
          timestamp: new Date('2024-01-15')
        }
      ]);
      prismaMock.maintenanceRecord.findMany.mockResolvedValue([
        {
          id: 'maintenance-1',
          equipmentId: 'equip-1',
          type: 'ROUTINE',
          startTime: new Date('2024-01-10'),
          endTime: new Date('2024-01-10'),
          cost: {
            parts: 100,
            labor: 200,
            total: 300
          }
        }
      ]);

      const result = await performanceMonitoringService.analyzeEfficiency(
        'equip-1',
        startDate,
        endDate
      );

      expect(result.equipmentId).toBe('equip-1');
      expect(result.utilization).toBeDefined();
      expect(result.resourceUsage).toBeDefined();
      expect(result.costMetrics).toBeDefined();
    });

    it('should reject analysis for non-existent equipment', async () => {
      prismaMock.equipment.findUnique.mockResolvedValue(null);

      await expect(performanceMonitoringService.analyzeEfficiency(
        'non-existent',
        startDate,
        endDate
      )).rejects.toThrow(PerformanceMonitoringError);
    });
  });

  describe('detectAnomalies', () => {
    it('should detect performance anomalies', async () => {
      prismaMock.equipment.findUnique.mockResolvedValue(mockEquipment);
      prismaMock.usageMetrics.findMany.mockResolvedValue([
        {
          id: 'metrics-1',
          equipmentId: 'equip-1',
          readings: 100,
          operationTime: 480,
          timestamp: new Date('2024-01-15')
        }
      ]);

      const anomalies = await performanceMonitoringService.detectAnomalies(
        'equip-1',
        MetricType.UTILIZATION
      );

      expect(Array.isArray(anomalies)).toBe(true);
      if (anomalies.length > 0) {
        expect(anomalies[0].equipmentId).toBe('equip-1');
        expect(anomalies[0].type).toBeDefined();
        expect(anomalies[0].confidence).toBeGreaterThan(0);
      }
    });

    it('should reject detection for non-existent equipment', async () => {
      prismaMock.equipment.findUnique.mockResolvedValue(null);

      await expect(performanceMonitoringService.detectAnomalies(
        'non-existent',
        MetricType.UTILIZATION
      )).rejects.toThrow(PerformanceMonitoringError);
    });
  });

  describe('assessRisks', () => {
    it('should assess equipment risks', async () => {
      prismaMock.equipment.findUnique.mockResolvedValue(mockEquipment);
      prismaMock.usageMetrics.findMany.mockResolvedValue([
        {
          id: 'metrics-1',
          equipmentId: 'equip-1',
          readings: 100,
          operationTime: 480,
          timestamp: new Date('2024-01-15')
        }
      ]);
      prismaMock.maintenanceRecord.findMany.mockResolvedValue([
        {
          id: 'maintenance-1',
          equipmentId: 'equip-1',
          type: 'ROUTINE',
          startTime: new Date('2024-01-10'),
          endTime: new Date('2024-01-10')
        }
      ]);
      prismaMock.anomalyDetection.findMany.mockResolvedValue([
        {
          id: 'anomaly-1',
          equipmentId: 'equip-1',
          type: AnomalyType.PERFORMANCE_DROP,
          confidence: 0.8,
          timestamp: new Date('2024-01-15')
        }
      ]);

      const assessment = await performanceMonitoringService.assessRisks('equip-1');

      expect(assessment.equipmentId).toBe('equip-1');
      expect(assessment.level).toBeDefined();
      expect(assessment.factors).toBeDefined();
      expect(assessment.impacts).toBeDefined();
      expect(assessment.mitigations).toBeDefined();
    });

    it('should reject assessment for non-existent equipment', async () => {
      prismaMock.equipment.findUnique.mockResolvedValue(null);

      await expect(performanceMonitoringService.assessRisks('non-existent'))
        .rejects
        .toThrow(PerformanceMonitoringError);
    });
  });

  describe('generateReport', () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-31');

    it('should generate performance report', async () => {
      prismaMock.equipment.findUnique.mockResolvedValue(mockEquipment);
      prismaMock.usageMetrics.findMany.mockResolvedValue([
        {
          id: 'metrics-1',
          equipmentId: 'equip-1',
          readings: 100,
          operationTime: 480,
          timestamp: new Date('2024-01-15')
        }
      ]);
      prismaMock.anomalyDetection.findMany.mockResolvedValue([
        {
          id: 'anomaly-1',
          equipmentId: 'equip-1',
          type: AnomalyType.PERFORMANCE_DROP,
          confidence: 0.8,
          timestamp: new Date('2024-01-15')
        }
      ]);
      prismaMock.riskAssessment.findMany.mockResolvedValue([
        {
          id: 'risk-1',
          equipmentId: 'equip-1',
          level: RiskLevel.MEDIUM,
          timestamp: new Date('2024-01-15')
        }
      ]);

      const report = await performanceMonitoringService.generateReport(
        'equip-1',
        MetricType.UTILIZATION,
        startDate,
        endDate
      );

      expect(report.id).toBeDefined();
      expect(report.equipmentId).toBe('equip-1');
      expect(report.type).toBe(MetricType.UTILIZATION);
      expect(report.period.start).toEqual(startDate);
      expect(report.period.end).toEqual(endDate);
      expect(report.summary).toBeDefined();
      expect(report.metrics).toBeDefined();
      expect(report.analysis).toBeDefined();
      expect(report.recommendations).toBeDefined();
    });

    it('should reject report generation for non-existent equipment', async () => {
      prismaMock.equipment.findUnique.mockResolvedValue(null);

      await expect(performanceMonitoringService.generateReport(
        'non-existent',
        MetricType.UTILIZATION,
        startDate,
        endDate
      )).rejects.toThrow(PerformanceMonitoringError);
    });
  });
});

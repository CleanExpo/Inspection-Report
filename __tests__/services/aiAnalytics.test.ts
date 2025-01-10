import { aiAnalyticsService, AIAnalyticsError } from '../../app/services/aiAnalyticsService';
import { prisma } from '../../app/lib/prisma';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import {
  AnalysisType,
  MaintenanceRisk,
  ReportFormat,
  AnalyticsPeriod,
  Pattern,
  Anomaly,
  RiskAssessment,
  MaintenancePrediction,
  AutomatedReport,
  AnalyticsDashboard
} from '../../app/types/analytics';
import { EquipmentType } from '../../app/types/equipment';

// Mock Prisma
jest.mock('../../app/lib/prisma', () => ({
  prisma: mockDeep<PrismaClient>()
}));

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe('AI Analytics Service', () => {
  beforeEach(() => {
    mockReset(prismaMock);
  });

  describe('trainModel', () => {
    it('should train and deploy model', async () => {
      const parameters = {
        learningRate: 0.01,
        epochs: 100,
        batchSize: 32
      };

      const model = await aiAnalyticsService.trainModel(AnalysisType.PATTERN, parameters);

      expect(model.id).toBeDefined();
      expect(model.type).toBe(AnalysisType.PATTERN);
      expect(model.parameters).toEqual(parameters);
      expect(model.deployment.status).toBe('TRAINING');
    });

    it('should enforce model limit', async () => {
      // Train maximum number of models
      const maxModels = 5;
      for (let i = 0; i < maxModels; i++) {
        await aiAnalyticsService.trainModel(AnalysisType.PATTERN, {});
      }

      // Attempt to train one more
      await expect(aiAnalyticsService.trainModel(AnalysisType.PATTERN, {}))
        .rejects.toThrow(AIAnalyticsError);
    });
  });

  describe('detectPatterns', () => {
    it('should detect patterns in data', async () => {
      const data = [1, 2, 3, 2, 1, 2, 3, 2, 1];
      const metadata = {
        source: 'sensor-1',
        unit: 'celsius'
      };

      const patterns = await aiAnalyticsService.detectPatterns(data, metadata);

      expect(patterns).toHaveLength(1);
      expect(patterns[0].confidence).toBeGreaterThan(0);
      expect(patterns[0].points).toHaveLength(data.length);
    });
  });

  describe('detectAnomalies', () => {
    it('should detect anomalies in data', async () => {
      const data = [1, 1, 1, 1, 5, 1, 1, 1];
      const threshold = 2;

      const anomalies = await aiAnalyticsService.detectAnomalies(data, threshold);

      expect(anomalies).toHaveLength(1);
      expect(anomalies[0].value).toBe(5);
      expect(anomalies[0].severity).toBe('HIGH');
    });
  });

  describe('assessRisks', () => {
    it('should assess maintenance risks', async () => {
      const assessment = await aiAnalyticsService.assessRisks('equipment-1');

      expect(assessment.id).toBeDefined();
      expect(assessment.factors).toHaveLength(1);
      expect(assessment.mitigations).toHaveLength(1);
      expect(assessment.confidence).toBeGreaterThan(0);
    });
  });

  describe('predictMaintenance', () => {
    const mockEquipment = {
      id: 'equip-1',
      type: EquipmentType.MOISTURE_METER
    };

    it('should predict maintenance needs', async () => {
      prismaMock.equipment.findUnique.mockResolvedValue(mockEquipment as any);

      const prediction = await aiAnalyticsService.predictMaintenance('equip-1');

      expect(prediction.id).toBeDefined();
      expect(prediction.equipmentId).toBe('equip-1');
      expect(prediction.prediction.failureProbability).toBeGreaterThanOrEqual(0);
      expect(prediction.prediction.estimatedTimeToFailure).toBeGreaterThan(0);
    });

    it('should reject prediction for non-existent equipment', async () => {
      prismaMock.equipment.findUnique.mockResolvedValue(null);

      await expect(aiAnalyticsService.predictMaintenance('non-existent'))
        .rejects.toThrow(AIAnalyticsError);
    });
  });

  describe('generateReport', () => {
    it('should generate automated report', async () => {
      const reportConfig = {
        title: 'Test Report',
        type: 'MAINTENANCE',
        format: ReportFormat.PDF,
        content: {
          sections: [
            {
              title: 'Overview',
              type: 'TEXT' as const,
              data: 'Test content'
            }
          ]
        }
      };

      const report = await aiAnalyticsService.generateReport(reportConfig);

      expect(report.id).toBeDefined();
      expect(report.title).toBe('Test Report');
      expect(report.generation.status).toBe('COMPLETED');
    });
  });

  describe('createDashboard', () => {
    it('should create analytics dashboard', async () => {
      const dashboardConfig = {
        name: 'Test Dashboard',
        layout: {
          type: 'GRID' as const,
          columns: 3,
          widgets: [
            {
              id: 'widget-1',
              type: 'CHART',
              position: {
                x: 0,
                y: 0,
                width: 1,
                height: 1
              },
              config: {},
              data: {}
            }
          ]
        },
        filters: {
          timeRange: {
            start: new Date(),
            end: new Date()
          }
        },
        refresh: {
          automatic: true,
          interval: 300000
        }
      };

      const dashboard = await aiAnalyticsService.createDashboard(dashboardConfig);

      expect(dashboard.id).toBeDefined();
      expect(dashboard.name).toBe('Test Dashboard');
      expect(dashboard.layout.widgets).toHaveLength(1);
    });
  });

  describe('generateInsights', () => {
    it('should generate analytics insights', async () => {
      const data = {
        metrics: {
          efficiency: [0.8, 0.82, 0.85],
          temperature: [25, 26, 27]
        }
      };

      const context = {
        equipment: 'pump-1',
        timeRange: {
          start: new Date(),
          end: new Date()
        }
      };

      const insights = await aiAnalyticsService.generateInsights(data, context);

      expect(insights).toHaveLength(1);
      expect(insights[0].priority).toBe('HIGH');
      expect(insights[0].metrics).toHaveLength(1);
      expect(insights[0].actions).toHaveLength(1);
    });
  });

  describe('cleanup', () => {
    it('should dispose resources', () => {
      aiAnalyticsService.dispose();

      // Create dashboard to verify state is reset
      const dashboardConfig = {
        name: 'Test Dashboard',
        layout: {
          type: 'GRID' as const,
          columns: 2,
          widgets: []
        },
        filters: {
          timeRange: {
            start: new Date(),
            end: new Date()
          }
        },
        refresh: {
          automatic: false
        }
      };

      return expect(aiAnalyticsService.createDashboard(dashboardConfig))
        .resolves.toHaveProperty('id');
    });
  });
});

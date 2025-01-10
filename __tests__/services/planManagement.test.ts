import { planManagementService, PlanManagementError } from '../../app/services/planManagementService';
import { prisma } from '../../app/lib/prisma';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import {
  PlanFileType,
  PlanStatus,
  PlanLevel,
  FloorPlan,
  PlanVersion,
  PlanMetadata
} from '../../app/types/plan';

// Mock Prisma
jest.mock('../../app/lib/prisma', () => ({
  prisma: mockDeep<PrismaClient>()
}));

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe('Plan Management Service', () => {
  beforeEach(() => {
    mockReset(prismaMock);
  });

  const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
  const mockMetadata: Partial<PlanMetadata> = {
    title: 'Test Plan',
    units: 'METRIC',
    originalFormat: PlanFileType.PDF,
    dimensions: {
      width: 1000,
      height: 800,
      unit: 'px'
    }
  };

  describe('uploadPlan', () => {
    it('should upload and process a new plan', async () => {
      const mockPlan: Partial<FloorPlan> = {
        id: 'plan-1',
        jobId: 'job-1',
        level: PlanLevel.GROUND,
        status: PlanStatus.UPLOADING,
        currentVersion: 1,
        metadata: mockMetadata as PlanMetadata
      };

      prismaMock.floorPlan.create.mockResolvedValue(mockPlan as any);

      const result = await planManagementService.uploadPlan(
        mockFile,
        'job-1',
        PlanLevel.GROUND,
        mockMetadata
      );

      expect(result.success).toBe(true);
      expect(result.planId).toBe('plan-1');
      expect(result.version).toBe(1);
      expect(result.metadata).toBeDefined();
    });

    it('should reject invalid file types', async () => {
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });

      await expect(planManagementService.uploadPlan(
        invalidFile,
        'job-1',
        PlanLevel.GROUND,
        mockMetadata
      )).rejects.toThrow(PlanManagementError);
    });

    it('should handle processing errors', async () => {
      prismaMock.floorPlan.create.mockRejectedValue(new Error('Processing failed'));

      await expect(planManagementService.uploadPlan(
        mockFile,
        'job-1',
        PlanLevel.GROUND,
        mockMetadata
      )).rejects.toThrow(PlanManagementError);
    });
  });

  describe('updatePlan', () => {
    const mockExistingPlan: Partial<FloorPlan> = {
      id: 'plan-1',
      jobId: 'job-1',
      level: PlanLevel.GROUND,
      status: PlanStatus.ACTIVE,
      currentVersion: 1,
      metadata: mockMetadata as PlanMetadata
    };

    it('should update existing plan with new version', async () => {
      prismaMock.floorPlan.findUnique.mockResolvedValue(mockExistingPlan as any);
      prismaMock.floorPlan.update.mockResolvedValue({
        ...mockExistingPlan,
        currentVersion: 2
      } as any);

      const result = await planManagementService.updatePlan(
        'plan-1',
        mockFile,
        {
          title: 'Updated Plan'
        }
      );

      expect(result.success).toBe(true);
      expect(result.version).toBe(2);
      expect(result.metadata?.title).toBe('Updated Plan');
    });

    it('should reject update for non-existent plan', async () => {
      prismaMock.floorPlan.findUnique.mockResolvedValue(null);

      await expect(planManagementService.updatePlan(
        'non-existent',
        mockFile
      )).rejects.toThrow(PlanManagementError);
    });
  });

  describe('getPlanVersion', () => {
    const mockVersion: Partial<PlanVersion> = {
      id: 'version-1',
      planId: 'plan-1',
      version: 1,
      status: PlanStatus.ACTIVE,
      metadata: mockMetadata as PlanMetadata,
      file: {
        url: 'test-url',
        size: 1000,
        hash: 'test-hash'
      }
    };

    it('should retrieve specific plan version', async () => {
      prismaMock.floorPlan.findUnique.mockResolvedValue({
        id: 'plan-1',
        currentVersion: 1
      } as any);
      prismaMock.planVersion.findUnique.mockResolvedValue(mockVersion as any);

      const version = await planManagementService.getPlanVersion('plan-1', 1);

      expect(version.id).toBe('version-1');
      expect(version.version).toBe(1);
      expect(version.file.url).toBe('test-url');
    });

    it('should retrieve current version when no version specified', async () => {
      prismaMock.floorPlan.findUnique.mockResolvedValue({
        id: 'plan-1',
        currentVersion: 1
      } as any);
      prismaMock.planVersion.findUnique.mockResolvedValue(mockVersion as any);

      const version = await planManagementService.getPlanVersion('plan-1');

      expect(version.version).toBe(1);
    });

    it('should reject request for non-existent version', async () => {
      prismaMock.floorPlan.findUnique.mockResolvedValue({
        id: 'plan-1',
        currentVersion: 1
      } as any);
      prismaMock.planVersion.findUnique.mockResolvedValue(null);

      await expect(planManagementService.getPlanVersion('plan-1', 2))
        .rejects.toThrow(PlanManagementError);
    });
  });

  describe('searchPlans', () => {
    const mockPlans = [
      {
        id: 'plan-1',
        jobId: 'job-1',
        level: PlanLevel.GROUND,
        status: PlanStatus.ACTIVE
      },
      {
        id: 'plan-2',
        jobId: 'job-1',
        level: PlanLevel.FLOOR,
        status: PlanStatus.ACTIVE
      }
    ];

    it('should search plans by criteria', async () => {
      prismaMock.floorPlan.findMany.mockResolvedValue(mockPlans as any);

      const results = await planManagementService.searchPlans({
        jobId: 'job-1',
        status: PlanStatus.ACTIVE
      });

      expect(results).toHaveLength(2);
      expect(results[0].jobId).toBe('job-1');
      expect(results[0].status).toBe(PlanStatus.ACTIVE);
    });

    it('should handle empty search results', async () => {
      prismaMock.floorPlan.findMany.mockResolvedValue([]);

      const results = await planManagementService.searchPlans({
        jobId: 'non-existent'
      });

      expect(results).toHaveLength(0);
    });
  });

  describe('getStats', () => {
    it('should return plan statistics', async () => {
      prismaMock.floorPlan.count.mockResolvedValue(10);

      const stats = await planManagementService.getStats();

      expect(stats.totalCount).toBe(10);
      expect(stats.byStatus).toBeDefined();
      expect(stats.byType).toBeDefined();
      expect(stats.byLevel).toBeDefined();
      expect(stats.storage).toBeDefined();
      expect(stats.versions).toBeDefined();
      expect(stats.usage).toBeDefined();
    });
  });
});

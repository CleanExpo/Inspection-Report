import {
  PlanFileType,
  PlanStatus,
  PlanLevel,
  FloorPlan,
  PlanVersion,
  PlanMetadata,
  PlanUploadConfig,
  PlanProcessingResult,
  PlanStorageConfig,
  PlanSearchCriteria,
  PlanValidationRule,
  PlanConversionOptions,
  PlanStats,
  PlanPermissions
} from '../types/plan';
import { prisma } from '../lib/prisma';
import { createHistoryEntry } from '../utils/historyTracking';
import { EntityType, ChangeType } from '../types/history';

export class PlanManagementError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PlanManagementError';
  }
}

export class PlanManagementService {
  private config: {
    upload: PlanUploadConfig;
    storage: PlanStorageConfig;
  };

  constructor(config: {
    upload: Partial<PlanUploadConfig>;
    storage: Partial<PlanStorageConfig>;
  }) {
    this.config = {
      upload: {
        allowedTypes: [PlanFileType.PDF, PlanFileType.IMAGE],
        maxFileSize: 50 * 1024 * 1024, // 50MB
        autoProcess: true,
        extractMetadata: true,
        generateThumbnails: true,
        validateDimensions: true,
        compressionOptions: {
          enabled: true,
          quality: 0.8,
          maxDimension: 4096
        },
        ...config.upload
      },
      storage: {
        provider: 'LOCAL',
        basePath: './uploads/plans',
        versioning: true,
        backup: {
          enabled: true,
          frequency: '0 0 * * *', // Daily at midnight
          retention: 30 // Days
        },
        cache: {
          enabled: true,
          duration: 24 * 60 * 60, // 24 hours
          maxSize: 1024 * 1024 * 1024 // 1GB
        },
        compression: {
          enabled: true,
          algorithm: 'gzip',
          level: 6
        },
        ...config.storage
      }
    };
  }

  /**
   * Uploads a new floor plan
   */
  async uploadPlan(
    file: File,
    jobId: string,
    level: PlanLevel,
    metadata: Partial<PlanMetadata>
  ): Promise<PlanProcessingResult> {
    try {
      // Validate file
      await this.validateFile(file);

      // Create initial plan record
      const plan = await prisma.floorPlan.create({
        data: {
          jobId,
          level,
          status: PlanStatus.UPLOADING,
          currentVersion: 1,
          metadata: {
            title: metadata.title || file.name,
            originalFormat: this.detectFileType(file),
            units: metadata.units || 'METRIC',
            dimensions: metadata.dimensions || { width: 0, height: 0, unit: 'px' },
            ...metadata
          }
        }
      });

      // Upload file to storage
      const fileUrl = await this.uploadFile(file, plan.id, 1);

      // Process plan
      const result = await this.processPlan(plan.id, fileUrl);

      // Create history entry
      await createHistoryEntry(
        plan.id,
        EntityType.PLAN,
        ChangeType.CREATE,
        'system',
        null,
        result
      );

      return result;
    } catch (error) {
      throw new PlanManagementError(`Failed to upload plan: ${error.message}`);
    }
  }

  /**
   * Updates an existing plan version
   */
  async updatePlan(
    planId: string,
    file: File,
    metadata?: Partial<PlanMetadata>
  ): Promise<PlanProcessingResult> {
    try {
      // Get current plan
      const plan = await prisma.floorPlan.findUnique({
        where: { id: planId }
      });

      if (!plan) {
        throw new PlanManagementError('Plan not found');
      }

      // Create new version
      const newVersion = plan.currentVersion + 1;
      const fileUrl = await this.uploadFile(file, planId, newVersion);

      // Process new version
      const result = await this.processPlan(planId, fileUrl, metadata);

      // Update plan record
      await prisma.floorPlan.update({
        where: { id: planId },
        data: {
          currentVersion: newVersion,
          metadata: metadata ? { ...plan.metadata, ...metadata } : undefined
        }
      });

      // Create history entry
      await createHistoryEntry(
        planId,
        EntityType.PLAN,
        ChangeType.UPDATE,
        'system',
        plan,
        result
      );

      return result;
    } catch (error) {
      throw new PlanManagementError(`Failed to update plan: ${error.message}`);
    }
  }

  /**
   * Retrieves a plan version
   */
  async getPlanVersion(
    planId: string,
    version?: number
  ): Promise<PlanVersion> {
    try {
      const plan = await prisma.floorPlan.findUnique({
        where: { id: planId }
      });

      if (!plan) {
        throw new PlanManagementError('Plan not found');
      }

      const targetVersion = version || plan.currentVersion;
      const planVersion = await prisma.planVersion.findUnique({
        where: {
          planId_version: {
            planId,
            version: targetVersion
          }
        }
      });

      if (!planVersion) {
        throw new PlanManagementError('Plan version not found');
      }

      return planVersion as PlanVersion;
    } catch (error) {
      throw new PlanManagementError(`Failed to get plan version: ${error.message}`);
    }
  }

  /**
   * Searches for plans
   */
  async searchPlans(criteria: PlanSearchCriteria): Promise<FloorPlan[]> {
    try {
      const plans = await prisma.floorPlan.findMany({
        where: {
          jobId: criteria.jobId,
          level: criteria.level,
          status: criteria.status,
          createdAt: criteria.dateRange ? {
            gte: criteria.dateRange.start,
            lte: criteria.dateRange.end
          } : undefined,
          metadata: criteria.metadata ? {
            path: criteria.metadata.map(m => m.field),
            equals: criteria.metadata.map(m => m.value)
          } : undefined
        },
        include: {
          versions: criteria.version === 'all'
        }
      });

      return plans as FloorPlan[];
    } catch (error) {
      throw new PlanManagementError(`Failed to search plans: ${error.message}`);
    }
  }

  /**
   * Gets plan statistics
   */
  async getStats(): Promise<PlanStats> {
    try {
      const [
        totalCount,
        statusCounts,
        typeCounts,
        levelCounts,
        storageCounts,
        versionStats,
        usageStats
      ] = await Promise.all([
        prisma.floorPlan.count(),
        this.getStatusCounts(),
        this.getTypeCounts(),
        this.getLevelCounts(),
        this.getStorageCounts(),
        this.getVersionStats(),
        this.getUsageStats()
      ]);

      return {
        totalCount,
        byStatus: statusCounts,
        byType: typeCounts,
        byLevel: levelCounts,
        storage: storageCounts,
        versions: versionStats,
        usage: usageStats
      };
    } catch (error) {
      throw new PlanManagementError(`Failed to get stats: ${error.message}`);
    }
  }

  // Private helper methods

  private async validateFile(file: File): Promise<void> {
    // Implementation would validate file against rules
  }

  private detectFileType(file: File): PlanFileType {
    // Implementation would detect file type
    return PlanFileType.PDF;
  }

  private async uploadFile(
    file: File,
    planId: string,
    version: number
  ): Promise<string> {
    // Implementation would handle file upload to storage
    return '';
  }

  private async processPlan(
    planId: string,
    fileUrl: string,
    metadata?: Partial<PlanMetadata>
  ): Promise<PlanProcessingResult> {
    // Implementation would process plan file
    return {} as PlanProcessingResult;
  }

  private async getStatusCounts(): Promise<Record<PlanStatus, number>> {
    // Implementation would get status counts
    return {} as Record<PlanStatus, number>;
  }

  private async getTypeCounts(): Promise<Record<PlanFileType, number>> {
    // Implementation would get type counts
    return {} as Record<PlanFileType, number>;
  }

  private async getLevelCounts(): Promise<Record<PlanLevel, number>> {
    // Implementation would get level counts
    return {} as Record<PlanLevel, number>;
  }

  private async getStorageCounts(): Promise<{
    total: number;
    byType: Record<PlanFileType, number>;
  }> {
    // Implementation would get storage counts
    return { total: 0, byType: {} as Record<PlanFileType, number> };
  }

  private async getVersionStats(): Promise<{
    average: number;
    max: number;
  }> {
    // Implementation would get version stats
    return { average: 0, max: 0 };
  }

  private async getUsageStats(): Promise<{
    views: number;
    downloads: number;
    prints: number;
  }> {
    // Implementation would get usage stats
    return { views: 0, downloads: 0, prints: 0 };
  }
}

export const planManagementService = new PlanManagementService({
  upload: {},
  storage: {}
});

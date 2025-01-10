import {
  ExternalSystemType,
  SyncStrategy,
  ConflictResolution,
  NotificationType,
  ExternalSystem,
  MobileConfig,
  OfflineOperation,
  SyncSession,
  DataConflict,
  PushNotification,
  DeviceInfo,
  EnhancementStats,
  EnhancementConfig
} from '../types/enhancement';
import { createHistoryEntry } from '../utils/historyTracking';
import { EntityType, ChangeType } from '../types/history';
import { prisma } from '../lib/prisma';

export class IntegrationEnhancementError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IntegrationEnhancementError';
  }
}

export class IntegrationEnhancementService {
  private config: EnhancementConfig;
  private externalSystems: Map<string, ExternalSystem>;
  private mobileDevices: Map<string, DeviceInfo>;
  private offlineQueue: Map<string, OfflineOperation>;
  private activeSyncSessions: Map<string, SyncSession>;

  constructor(config?: Partial<EnhancementConfig>) {
    this.config = this.createDefaultConfig(config);
    this.externalSystems = new Map();
    this.mobileDevices = new Map();
    this.offlineQueue = new Map();
    this.activeSyncSessions = new Map();
  }

  /**
   * Registers an external system
   */
  async registerExternalSystem(system: Omit<ExternalSystem, 'id'>): Promise<ExternalSystem> {
    try {
      if (this.externalSystems.size >= this.config.external.maxSystems) {
        throw new IntegrationEnhancementError('Maximum number of external systems reached');
      }

      const newSystem: ExternalSystem = {
        id: `sys-${Date.now()}`,
        ...system,
        status: {
          connected: false
        }
      };

      this.externalSystems.set(newSystem.id, newSystem);

      // Create history entry
      await createHistoryEntry(
        newSystem.id,
        EntityType.EXTERNAL_SYSTEM,
        ChangeType.CREATE,
        'system',
        null,
        newSystem
      );

      return newSystem;
    } catch (error) {
      throw new IntegrationEnhancementError(`Failed to register external system: ${error.message}`);
    }
  }

  /**
   * Configures mobile device settings
   */
  async configureMobileDevice(config: Omit<MobileConfig, 'id'>): Promise<MobileConfig> {
    try {
      const deviceConfig: MobileConfig = {
        id: `mobile-${Date.now()}`,
        ...config
      };

      // Create history entry
      await createHistoryEntry(
        deviceConfig.id,
        EntityType.MOBILE_CONFIG,
        ChangeType.CREATE,
        'system',
        null,
        deviceConfig
      );

      return deviceConfig;
    } catch (error) {
      throw new IntegrationEnhancementError(`Failed to configure mobile device: ${error.message}`);
    }
  }

  /**
   * Registers a device for offline operations
   */
  async registerDevice(info: Omit<DeviceInfo, 'id'>): Promise<DeviceInfo> {
    try {
      const device: DeviceInfo = {
        id: `device-${Date.now()}`,
        ...info
      };

      this.mobileDevices.set(device.id, device);

      // Create history entry
      await createHistoryEntry(
        device.id,
        EntityType.DEVICE_INFO,
        ChangeType.CREATE,
        'system',
        null,
        device
      );

      return device;
    } catch (error) {
      throw new IntegrationEnhancementError(`Failed to register device: ${error.message}`);
    }
  }

  /**
   * Queues an offline operation
   */
  async queueOfflineOperation(operation: Omit<OfflineOperation, 'id' | 'status' | 'retryCount'>): Promise<OfflineOperation> {
    try {
      if (this.offlineQueue.size >= this.config.offline.maxOperations) {
        throw new IntegrationEnhancementError('Offline operation queue is full');
      }

      const newOperation: OfflineOperation = {
        id: `op-${Date.now()}`,
        ...operation,
        status: 'PENDING',
        retryCount: 0
      };

      this.offlineQueue.set(newOperation.id, newOperation);

      // Create history entry
      await createHistoryEntry(
        newOperation.id,
        EntityType.OFFLINE_OPERATION,
        ChangeType.CREATE,
        'system',
        null,
        newOperation
      );

      return newOperation;
    } catch (error) {
      throw new IntegrationEnhancementError(`Failed to queue offline operation: ${error.message}`);
    }
  }

  /**
   * Starts a sync session
   */
  async startSync(deviceId: string): Promise<SyncSession> {
    try {
      const device = this.mobileDevices.get(deviceId);
      if (!device) {
        throw new IntegrationEnhancementError('Device not found');
      }

      const session: SyncSession = {
        id: `sync-${Date.now()}`,
        startTime: new Date(),
        status: 'ACTIVE',
        operations: {
          total: this.offlineQueue.size,
          completed: 0,
          failed: 0
        },
        conflicts: {
          total: 0,
          resolved: 0,
          pending: 0
        },
        stats: {
          uploadSize: 0,
          downloadSize: 0,
          duration: 0,
          networkSpeed: 0
        }
      };

      this.activeSyncSessions.set(session.id, session);

      // Create history entry
      await createHistoryEntry(
        session.id,
        EntityType.SYNC_SESSION,
        ChangeType.CREATE,
        'system',
        null,
        session
      );

      return session;
    } catch (error) {
      throw new IntegrationEnhancementError(`Failed to start sync: ${error.message}`);
    }
  }

  /**
   * Resolves a data conflict
   */
  async resolveConflict(conflict: DataConflict, resolution: ConflictResolution): Promise<void> {
    try {
      const resolvedData = await this.applyResolutionStrategy(conflict, resolution);

      // Update conflict with resolution
      conflict.resolution = {
        strategy: resolution,
        resolvedData,
        resolvedBy: 'system',
        timestamp: Date.now()
      };

      // Create history entry
      await createHistoryEntry(
        conflict.id,
        EntityType.DATA_CONFLICT,
        ChangeType.UPDATE,
        'system',
        null,
        conflict
      );
    } catch (error) {
      throw new IntegrationEnhancementError(`Failed to resolve conflict: ${error.message}`);
    }
  }

  /**
   * Sends a push notification
   */
  async sendPushNotification(notification: Omit<PushNotification, 'id' | 'timestamp' | 'read'>): Promise<PushNotification> {
    try {
      const newNotification: PushNotification = {
        id: `notif-${Date.now()}`,
        ...notification,
        timestamp: new Date(),
        read: false
      };

      // Create history entry
      await createHistoryEntry(
        newNotification.id,
        EntityType.PUSH_NOTIFICATION,
        ChangeType.CREATE,
        'system',
        null,
        newNotification
      );

      return newNotification;
    } catch (error) {
      throw new IntegrationEnhancementError(`Failed to send notification: ${error.message}`);
    }
  }

  /**
   * Gets enhancement statistics
   */
  getStats(): EnhancementStats {
    return {
      external: {
        systems: this.externalSystems.size,
        activeConnections: Array.from(this.externalSystems.values()).filter(s => s.status.connected).length,
        syncSuccess: 0,
        syncErrors: 0
      },
      mobile: {
        activeDevices: this.mobileDevices.size,
        offlineOperations: this.offlineQueue.size,
        storageUsage: 0,
        pushDelivery: 0
      },
      offline: {
        pendingOperations: Array.from(this.offlineQueue.values()).filter(o => o.status === 'PENDING').length,
        conflicts: 0,
        syncFrequency: 0,
        dataSize: 0
      },
      sync: {
        averageDuration: 0,
        failureRate: 0,
        dataTransferred: 0
      }
    };
  }

  // Private helper methods

  private createDefaultConfig(override?: Partial<EnhancementConfig>): EnhancementConfig {
    return {
      external: {
        maxSystems: 10,
        rateLimits: {
          [ExternalSystemType.CRM]: 100,
          [ExternalSystemType.ERP]: 50,
          [ExternalSystemType.ACCOUNTING]: 30,
          [ExternalSystemType.CALENDAR]: 200,
          [ExternalSystemType.MESSAGING]: 500,
          [ExternalSystemType.CUSTOM]: 100
        },
        timeout: 30000,
        retryPolicy: {
          attempts: 3,
          backoff: 1000
        }
      },
      mobile: {
        maxOfflineSize: 100 * 1024 * 1024, // 100MB
        syncInterval: 300000, // 5 minutes
        pushEnabled: true,
        locationTracking: true
      },
      offline: {
        maxOperations: 1000,
        maxRetries: 5,
        conflictStrategy: ConflictResolution.LAST_WRITE_WINS,
        purgeAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      },
      sync: {
        batchSize: 100,
        concurrency: 3,
        lockTimeout: 60000,
        validateData: true
      },
      ...override
    };
  }

  private async applyResolutionStrategy(conflict: DataConflict, strategy: ConflictResolution): Promise<any> {
    switch (strategy) {
      case ConflictResolution.SERVER_WINS:
        return conflict.serverVersion.data;
      case ConflictResolution.CLIENT_WINS:
        return conflict.clientVersion.data;
      case ConflictResolution.LAST_WRITE_WINS:
        return conflict.clientVersion.timestamp > conflict.serverVersion.timestamp
          ? conflict.clientVersion.data
          : conflict.serverVersion.data;
      case ConflictResolution.MANUAL_RESOLVE:
        // Implementation would handle manual resolution
        return conflict.serverVersion.data;
      default:
        throw new IntegrationEnhancementError(`Unknown resolution strategy: ${strategy}`);
    }
  }

  dispose(): void {
    // Clean up resources
    this.externalSystems.clear();
    this.mobileDevices.clear();
    this.offlineQueue.clear();
    this.activeSyncSessions.clear();
  }
}

export const integrationEnhancementService = new IntegrationEnhancementService();

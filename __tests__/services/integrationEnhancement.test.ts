import { integrationEnhancementService, IntegrationEnhancementError } from '../../app/services/integrationEnhancementService';
import {
  ExternalSystemType,
  SyncStrategy,
  ConflictResolution,
  NotificationType,
  ExternalSystem,
  MobileConfig,
  DeviceInfo,
  OfflineOperation,
  DataConflict
} from '../../app/types/enhancement';

describe('Integration Enhancement Service', () => {
  describe('registerExternalSystem', () => {
    it('should register external system', async () => {
      const systemData: Omit<ExternalSystem, 'id'> = {
        type: ExternalSystemType.CRM,
        name: 'Test CRM',
        baseUrl: 'https://api.test-crm.com',
        auth: {
          type: 'API_KEY',
          credentials: {
            apiKey: 'test-key'
          }
        },
        endpoints: {
          getCustomers: {
            path: '/customers',
            method: 'GET'
          }
        },
        mapping: {
          customer: [
            {
              sourceField: 'id',
              targetField: 'customerId'
            }
          ]
        },
        status: {
          connected: false
        }
      };

      const system = await integrationEnhancementService.registerExternalSystem(systemData);

      expect(system.id).toBeDefined();
      expect(system.type).toBe(ExternalSystemType.CRM);
      expect(system.status.connected).toBe(false);
    });

    it('should enforce system limit', async () => {
      // Register maximum number of systems
      const maxSystems = 10;
      for (let i = 0; i < maxSystems; i++) {
        await integrationEnhancementService.registerExternalSystem({
          type: ExternalSystemType.CRM,
          name: `System ${i}`,
          baseUrl: `https://api${i}.test.com`,
          auth: {
            type: 'API_KEY',
            credentials: { key: 'test' }
          },
          endpoints: {},
          mapping: {},
          status: { connected: false }
        });
      }

      // Attempt to register one more
      await expect(integrationEnhancementService.registerExternalSystem({
        type: ExternalSystemType.CRM,
        name: 'Extra System',
        baseUrl: 'https://extra.test.com',
        auth: {
          type: 'API_KEY',
          credentials: { key: 'test' }
        },
        endpoints: {},
        mapping: {},
        status: { connected: false }
      })).rejects.toThrow(IntegrationEnhancementError);
    });
  });

  describe('configureMobileDevice', () => {
    it('should configure mobile device', async () => {
      const configData: Omit<MobileConfig, 'id'> = {
        platform: 'IOS',
        version: '1.0.0',
        features: {
          offlineMode: true,
          pushNotifications: true,
          locationServices: true,
          cameraAccess: true,
          biometricAuth: true
        },
        storage: {
          maxSize: 100 * 1024 * 1024,
          purgeStrategy: 'LRU',
          purgeThreshold: 0.9
        },
        sync: {
          strategy: SyncStrategy.BATCH,
          interval: 300000,
          retryAttempts: 3,
          batchSize: 100
        },
        ui: {
          theme: 'SYSTEM',
          fontSize: 16,
          touchTargetSize: 44,
          animations: true
        }
      };

      const config = await integrationEnhancementService.configureMobileDevice(configData);

      expect(config.id).toBeDefined();
      expect(config.platform).toBe('IOS');
      expect(config.features.offlineMode).toBe(true);
    });
  });

  describe('registerDevice', () => {
    it('should register device', async () => {
      const deviceInfo: Omit<DeviceInfo, 'id'> = {
        platform: 'iOS',
        osVersion: '15.0',
        appVersion: '1.0.0',
        lastActive: new Date(),
        storageUsage: {
          total: 1000000,
          used: 500000
        }
      };

      const device = await integrationEnhancementService.registerDevice(deviceInfo);

      expect(device.id).toBeDefined();
      expect(device.platform).toBe('iOS');
      expect(device.storageUsage.used).toBe(500000);
    });
  });

  describe('queueOfflineOperation', () => {
    it('should queue offline operation', async () => {
      const operation: Omit<OfflineOperation, 'id' | 'status' | 'retryCount'> = {
        type: 'CREATE',
        entity: 'customer',
        data: { name: 'Test Customer' },
        timestamp: Date.now(),
        deviceId: 'device-1',
        userId: 'user-1'
      };

      const queuedOp = await integrationEnhancementService.queueOfflineOperation(operation);

      expect(queuedOp.id).toBeDefined();
      expect(queuedOp.status).toBe('PENDING');
      expect(queuedOp.retryCount).toBe(0);
    });

    it('should enforce queue size limit', async () => {
      // Fill queue to maximum
      const maxOperations = 1000;
      for (let i = 0; i < maxOperations; i++) {
        await integrationEnhancementService.queueOfflineOperation({
          type: 'CREATE',
          entity: 'test',
          data: { id: i },
          timestamp: Date.now(),
          deviceId: 'device-1',
          userId: 'user-1'
        });
      }

      // Attempt to queue one more
      await expect(integrationEnhancementService.queueOfflineOperation({
        type: 'CREATE',
        entity: 'test',
        data: { id: maxOperations },
        timestamp: Date.now(),
        deviceId: 'device-1',
        userId: 'user-1'
      })).rejects.toThrow(IntegrationEnhancementError);
    });
  });

  describe('startSync', () => {
    it('should start sync session for registered device', async () => {
      // First register a device
      const device = await integrationEnhancementService.registerDevice({
        platform: 'iOS',
        osVersion: '15.0',
        appVersion: '1.0.0',
        lastActive: new Date(),
        storageUsage: {
          total: 1000000,
          used: 500000
        }
      });

      const session = await integrationEnhancementService.startSync(device.id);

      expect(session.id).toBeDefined();
      expect(session.status).toBe('ACTIVE');
      expect(session.startTime).toBeDefined();
    });

    it('should reject sync for unknown device', async () => {
      await expect(integrationEnhancementService.startSync('unknown-device'))
        .rejects.toThrow(IntegrationEnhancementError);
    });
  });

  describe('resolveConflict', () => {
    it('should resolve conflict with server wins strategy', async () => {
      const conflict: DataConflict = {
        id: 'conflict-1',
        entityType: 'customer',
        entityId: 'cust-1',
        clientVersion: {
          data: { name: 'Client Name' },
          timestamp: Date.now() - 1000,
          deviceId: 'device-1'
        },
        serverVersion: {
          data: { name: 'Server Name' },
          timestamp: Date.now(),
          userId: 'user-1'
        }
      };

      await integrationEnhancementService.resolveConflict(
        conflict,
        ConflictResolution.SERVER_WINS
      );

      expect(conflict.resolution).toBeDefined();
      expect(conflict.resolution!.strategy).toBe(ConflictResolution.SERVER_WINS);
      expect(conflict.resolution!.resolvedData).toEqual({ name: 'Server Name' });
    });
  });

  describe('sendPushNotification', () => {
    it('should create push notification', async () => {
      const notification = await integrationEnhancementService.sendPushNotification({
        type: NotificationType.SYNC_COMPLETE,
        title: 'Sync Complete',
        message: 'All data has been synchronized',
        priority: 'NORMAL'
      });

      expect(notification.id).toBeDefined();
      expect(notification.timestamp).toBeDefined();
      expect(notification.read).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should return enhancement statistics', () => {
      const stats = integrationEnhancementService.getStats();

      expect(stats.external).toBeDefined();
      expect(stats.mobile).toBeDefined();
      expect(stats.offline).toBeDefined();
      expect(stats.sync).toBeDefined();
    });
  });

  describe('cleanup', () => {
    it('should dispose resources', () => {
      integrationEnhancementService.dispose();

      const stats = integrationEnhancementService.getStats();
      expect(stats.external.systems).toBe(0);
      expect(stats.mobile.activeDevices).toBe(0);
      expect(stats.offline.pendingOperations).toBe(0);
    });
  });
});

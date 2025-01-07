import syncManager, { SyncQueueItem } from '../../../app/lib/sync/SyncManager';
import CacheManager from '../../../app/lib/cache/CacheManager';

describe('SyncManager', () => {
  let mockOnline = true;

  beforeEach(() => {
    // Configure sync manager
    syncManager.configure({
      syncInterval: 1000, // 1 second for testing
      maxRetries: 2,
      batchSize: 5,
      conflictStrategy: 'last-write-wins'
    });

    // Mock window online status
    Object.defineProperty(window, 'navigator', {
      value: {
        onLine: mockOnline
      },
      configurable: true
    });

    // Clear any existing sync queue
    void CacheManager.flush();
  });

  afterEach(() => {
    syncManager.stopSync();
    mockOnline = true;
  });

  describe('Configuration', () => {
    it('should update configuration and restart sync if interval changes', async () => {
      // Start sync with initial config
      await syncManager.startSync();
      
      // Update configuration with new interval
      syncManager.configure({
        syncInterval: 500 // 500ms
      });

      // Add a test item
      const item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount' | 'status'> = {
        modelType: 'Job',
        operation: 'create',
        data: { id: '1' }
      };

      const id = await syncManager.addToSyncQueue(item);

      // Wait for sync with new interval
      await new Promise(resolve => setTimeout(resolve, 600));

      const queueItem = await CacheManager.get<SyncQueueItem>(`sync:queue:${id}`);
      expect(queueItem?.status).toBe('completed');
    });

    it('should update retry configuration', async () => {
      let attempts = 0;

      // Configure with lower retry count
      syncManager.configure({
        maxRetries: 1
      });

      const item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount' | 'status'> = {
        modelType: 'Job',
        operation: 'create',
        data: { id: '1' }
      };

      const id = await syncManager.addToSyncQueue(item);

      // Mock sync events to always fail
      syncManager.onEvent('sync:error', () => {
        attempts++;
      });

      await syncManager.startSync();
      await new Promise(resolve => setTimeout(resolve, 2000));

      const queueItem = await CacheManager.get<SyncQueueItem>(`sync:queue:${id}`);
      expect(attempts).toBe(1); // Should only retry once
      expect(queueItem?.status).toBe('failed');
    });
  });

  describe('Queue Management', () => {
    it('should add items to sync queue', async () => {
      const item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount' | 'status'> = {
        modelType: 'Job',
        operation: 'create',
        data: { id: '1', title: 'Test Job' }
      };

      const id = await syncManager.addToSyncQueue(item);
      expect(id).toBeDefined();

      const queueItem = await CacheManager.get<SyncQueueItem>(`sync:queue:${id}`);
      expect(queueItem).toBeDefined();
      expect(queueItem?.modelType).toBe('Job');
      expect(queueItem?.status).toBe('pending');
    });

    it('should process queue items in order', async () => {
      const processedItems: string[] = [];
      
      // Mock sync completion event
      syncManager.onEvent('sync:item-completed', (item: SyncQueueItem) => {
        processedItems.push(item.id);
      });

      // Add items with different timestamps
      const item1: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount' | 'status'> = {
        modelType: 'Job',
        operation: 'create',
        data: { id: '1' }
      };

      const item2: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount' | 'status'> = {
        modelType: 'Job',
        operation: 'create',
        data: { id: '2' }
      };

      const id1 = await syncManager.addToSyncQueue(item1);
      await new Promise(resolve => setTimeout(resolve, 10));
      const id2 = await syncManager.addToSyncQueue(item2);

      // Start sync and wait for completion
      await syncManager.startSync();
      await new Promise(resolve => setTimeout(resolve, 1500));

      expect(processedItems[0]).toBe(id1);
      expect(processedItems[1]).toBe(id2);
    });
  });

  describe('Network Handling', () => {
    it('should pause sync when offline', async () => {
      const item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount' | 'status'> = {
        modelType: 'Job',
        operation: 'create',
        data: { id: '1' }
      };

      await syncManager.addToSyncQueue(item);

      // Set offline
      mockOnline = false;
      window.dispatchEvent(new Event('offline'));

      // Wait for potential sync attempts
      await new Promise(resolve => setTimeout(resolve, 1500));

      const queueItems = await CacheManager.keys('sync:queue:*');
      const queueItem = await CacheManager.get<SyncQueueItem>(queueItems[0]);
      expect(queueItem?.status).toBe('pending');
    });

    it('should resume sync when back online', async () => {
      const item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount' | 'status'> = {
        modelType: 'Job',
        operation: 'create',
        data: { id: '1' }
      };

      const id = await syncManager.addToSyncQueue(item);

      // Set offline then online
      mockOnline = false;
      window.dispatchEvent(new Event('offline'));
      await new Promise(resolve => setTimeout(resolve, 500));

      mockOnline = true;
      window.dispatchEvent(new Event('online'));
      await new Promise(resolve => setTimeout(resolve, 1500));

      const queueItem = await CacheManager.get<SyncQueueItem>(`sync:queue:${id}`);
      expect(queueItem?.status).toBe('completed');
    });
  });

  describe('Conflict Resolution', () => {
    it('should resolve conflicts based on timestamp', async () => {
      const serverTimestamp = Date.now() - 1000; // 1 second ago
      const clientTimestamp = Date.now();

      const serverData = {
        id: '1',
        title: 'Server Version',
        timestamp: serverTimestamp
      };

      const clientData = {
        id: '1',
        title: 'Client Version',
        timestamp: clientTimestamp
      };

      const item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount' | 'status'> = {
        modelType: 'Job',
        operation: 'update',
        data: clientData
      };

      let resolvedData: unknown;

      // Mock conflict resolution
      syncManager.onEvent('sync:conflict-resolved', (data: unknown) => {
        resolvedData = data;
      });

      await syncManager.addToSyncQueue(item);
      await syncManager.startSync();
      await new Promise(resolve => setTimeout(resolve, 1500));

      // With last-write-wins strategy, client data should win
      expect((resolvedData as any)?.title).toBe('Client Version');
    });
  });

  describe('Batch Processing', () => {
    it('should process items in batches', async () => {
      const batchSize = 5;
      const totalItems = 12;
      const processedBatches: number[] = [];

      // Create test items
      const items = Array.from({ length: totalItems }, (_, i) => ({
        modelType: 'Job',
        operation: 'create' as const,
        data: { id: `${i}` }
      } satisfies Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount' | 'status'>));

      // Add all items to queue
      await Promise.all(items.map(item => syncManager.addToSyncQueue(item)));

      // Track batch processing
      syncManager.onEvent('sync:batch-processed', (size: number) => {
        processedBatches.push(size);
      });

      await syncManager.startSync();
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Should have processed in 3 batches: 5, 5, 2
      expect(processedBatches).toEqual([5, 5, 2]);
    });
  });
});

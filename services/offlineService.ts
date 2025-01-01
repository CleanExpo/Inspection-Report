import { performanceMonitor } from '../utils/performance';

interface OfflineItem {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string;
  timestamp: number;
}

interface OfflineStatus {
  isOnline: boolean;
  hasPendingSync: boolean;
  lastSyncAttempt: Date | null;
}

interface SyncManager {
  register(tag: string): Promise<void>;
}

interface ServiceWorkerRegistrationWithSync extends ServiceWorkerRegistration {
  sync?: SyncManager;
}

class OfflineService {
  private status: OfflineStatus = {
    isOnline: true,
    hasPendingSync: false,
    lastSyncAttempt: null,
  };
  private statusListeners: Set<(status: OfflineStatus) => void> = new Set();
  private initialized = false;

  constructor() {
    // Only initialize if we're in the browser
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  private initialize() {
    if (this.initialized) return;
    this.initialized = true;
    
    this.initializeServiceWorker();
    this.setupNetworkListeners();
    
    // Set initial online status
    this.updateStatus({
      ...this.status,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true
    });
  }

  private async initializeServiceWorker() {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
          scope: '/',
        });

        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.notifyUpdateAvailable();
              }
            });
          }
        });

        // Handle controller change
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          this.updateStatus({ ...this.status });
        });
      }
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  }

  private setupNetworkListeners() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.updateStatus({ ...this.status, isOnline: true });
      this.syncOfflineData();
    });

    window.addEventListener('offline', () => {
      this.updateStatus({ ...this.status, isOnline: false });
    });
  }

  private updateStatus(newStatus: OfflineStatus) {
    this.status = newStatus;
    this.notifyStatusListeners();
  }

  private notifyStatusListeners() {
    this.statusListeners.forEach(listener => listener(this.status));
  }

  private notifyUpdateAvailable() {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('swUpdateAvailable'));
  }

  async storeOfflineData(item: Omit<OfflineItem, 'id' | 'timestamp'>) {
    return performanceMonitor.measureAsync('store_offline_data', async () => {
      const db = await this.openDB();
      const offlineItem: OfflineItem = {
        ...item,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };

      await db
        .transaction('offlineStore', 'readwrite')
        .objectStore('offlineStore')
        .add(offlineItem);

      this.updateStatus({ ...this.status, hasPendingSync: true });
      return offlineItem.id;
    });
  }

  async syncOfflineData() {
    if (!navigator.onLine) return;

    return performanceMonitor.measureAsync('sync_offline_data', async () => {
      try {
        const registration = await navigator.serviceWorker.ready as ServiceWorkerRegistrationWithSync;
        if (registration.sync) {
          await registration.sync.register('offlineQueue');
        } else {
          // Fallback for browsers that don't support background sync
          const db = await this.openDB();
          const store = db.transaction('offlineStore', 'readwrite').objectStore('offlineStore');
          const request = store.getAll();
          
          const items: OfflineItem[] = await new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          });

          for (const item of items) {
            try {
              await fetch(item.url, {
                method: item.method,
                headers: item.headers,
                body: item.body,
              });
              await new Promise<void>((resolve, reject) => {
                const deleteRequest = store.delete(item.id);
                deleteRequest.onsuccess = () => resolve();
                deleteRequest.onerror = () => reject(deleteRequest.error);
              });
            } catch (error) {
              console.error('Failed to sync item:', error);
            }
          }
        }

        this.updateStatus({
          ...this.status,
          hasPendingSync: false,
          lastSyncAttempt: new Date(),
        });
      } catch (error) {
        console.error('Failed to sync offline data:', error);
        throw error;
      }
    });
  }

  subscribeToStatus(listener: (status: OfflineStatus) => void) {
    this.statusListeners.add(listener);
    listener(this.status); // Initial status
    return () => this.statusListeners.delete(listener);
  }

  async checkForUpdates() {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
    }
  }

  async skipWaiting() {
    const registration = await navigator.serviceWorker.ready;
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('OfflineDB', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = request.result;
        if (!db.objectStoreNames.contains('offlineStore')) {
          db.createObjectStore('offlineStore', { keyPath: 'id' });
        }
      };
    });
  }
}

export const offlineService = new OfflineService();

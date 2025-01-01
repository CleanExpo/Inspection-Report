import { useState, useEffect, useCallback, useRef } from 'react';
import { MoistureReading } from '../types/moisture';

export function useOfflineStorage() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isPending, setIsPending] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const lastSyncTime = useRef<number>(0);
  const syncInProgress = useRef(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const openDB = useCallback(async () => {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('MoistureMappingDB', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('pendingReadings')) {
          db.createObjectStore('pendingReadings', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('readings')) {
          db.createObjectStore('readings', { keyPath: 'id' });
        }
      };
    });
  }, []);

  const saveReading = useCallback(async (reading: MoistureReading): Promise<boolean> => {
    if (isOnline) {
      try {
        const response = await fetch('/api/moisture', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reading),
        });

        if (!response.ok) {
          throw new Error('Failed to save reading');
        }

        return true;
      } catch (error) {
        console.error('Error saving reading:', error);
        return saveReadingOffline(reading);
      }
    } else {
      return saveReadingOffline(reading);
    }
  }, [isOnline]);

  const saveReadingOffline = useCallback(async (reading: MoistureReading): Promise<boolean> => {
    try {
      const db = await openDB();
      const transaction = db.transaction(['pendingReadings'], 'readwrite');
      const store = transaction.objectStore('pendingReadings');
      
      await new Promise((resolve, reject) => {
        const request = store.add(reading);
        request.onsuccess = () => resolve(undefined);
        request.onerror = () => reject(request.error);
      });

      setPendingCount(prev => prev + 1);
      setIsPending(true);
      return true;
    } catch (error) {
      console.error('Error saving reading offline:', error);
      return false;
    }
  }, [openDB]);

  const syncPendingReadings = useCallback(async () => {
    if (!isOnline || syncInProgress.current) return;
    
    syncInProgress.current = true;
    try {
      const db = await openDB();
      const transaction = db.transaction(['pendingReadings'], 'readwrite');
      const store = transaction.objectStore('pendingReadings');
      
      const pendingReadings = await new Promise<MoistureReading[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      let successCount = 0;
      for (const reading of pendingReadings) {
        try {
          const response = await fetch('/api/moisture', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(reading),
          });

          if (response.ok) {
            await new Promise((resolve, reject) => {
              const request = store.delete(reading.id);
              request.onsuccess = () => resolve(undefined);
              request.onerror = () => reject(request.error);
            });
            successCount++;
          }
        } catch (error) {
          console.error('Error syncing reading:', error);
        }
      }

      setPendingCount(prev => Math.max(0, prev - successCount));
      setIsPending(pendingCount > successCount);
      lastSyncTime.current = Date.now();
    } catch (error) {
      console.error('Error in syncPendingReadings:', error);
    } finally {
      syncInProgress.current = false;
    }
  }, [isOnline, openDB, pendingCount]);

  const getAllReadings = useCallback(async (): Promise<MoistureReading[]> => {
    try {
      // Only fetch from API if we haven't synced in the last minute
      const shouldFetchFromAPI = isOnline && Date.now() - lastSyncTime.current > 60000;
      
      let readings: MoistureReading[] = [];
      if (shouldFetchFromAPI) {
        try {
          const response = await fetch('/api/moisture');
          if (response.ok) {
            readings = await response.json();
            lastSyncTime.current = Date.now();
          }
        } catch (error) {
          console.error('Error fetching online readings:', error);
        }
      }

      // Get offline readings
      const db = await openDB();
      const transaction = db.transaction(['readings', 'pendingReadings'], 'readonly');
      const readingsStore = transaction.objectStore('readings');
      const pendingStore = transaction.objectStore('pendingReadings');

      const [offlineReadings, pendingReadings] = await Promise.all([
        new Promise<MoistureReading[]>((resolve, reject) => {
          const request = readingsStore.getAll();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        }),
        new Promise<MoistureReading[]>((resolve, reject) => {
          const request = pendingStore.getAll();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        })
      ]);

      return [...readings, ...offlineReadings, ...pendingReadings];
    } catch (error) {
      console.error('Error getting all readings:', error);
      return [];
    }
  }, [isOnline, openDB]);

  // Sync pending readings when online
  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      syncPendingReadings();
    }
  }, [isOnline, pendingCount, syncPendingReadings]);

  return {
    isOnline,
    isPending,
    pendingCount,
    saveReading,
    getAllReadings,
    syncPendingReadings,
  };
}

import { useState, useEffect, useCallback } from 'react';
import { DrawingElement } from '../types/sketch';
import { syncService } from '../services/syncService';

interface SyncState {
  isSyncing: boolean;
  lastSyncTime: number | null;
  error: Error | null;
  isOnline: boolean;
}

interface UseSyncOptions {
  onSyncComplete?: () => void;
  onSyncError?: (error: Error) => void;
  onConflict?: (serverData: any, localData: any) => Promise<any>;
}

export const useSync = (options?: UseSyncOptions) => {
  const [syncState, setSyncState] = useState<SyncState>({
    isSyncing: false,
    lastSyncTime: null,
    error: null,
    isOnline: navigator.onLine,
  });

  // Initialize sync service
  useEffect(() => {
    syncService.initialize();
    return () => {
      syncService.disconnect();
    };
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setSyncState(prev => ({ ...prev, isOnline: true, error: null }));
    };

    const handleOffline = () => {
      setSyncState(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync drawing elements
  const syncElements = useCallback(async (elements: DrawingElement[]) => {
    if (!elements.length) return;

    setSyncState(prev => ({ ...prev, isSyncing: true, error: null }));

    try {
      await syncService.syncDrawingElements(elements, {
        onError: (error: Error) => {
          setSyncState(prev => ({
            ...prev,
            isSyncing: false,
            error,
          }));
          options?.onSyncError?.(error);
        }
      });
      
      // If we get here, sync was successful
      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: Date.now(),
        error: null
      }));
      options?.onSyncComplete?.();
    } catch (error) {
      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        error: error as Error,
      }));
      options?.onSyncError?.(error as Error);
    }
  }, [options]);

  // Sync status indicators
  const getSyncStatus = useCallback(() => {
    if (!syncState.isOnline) return 'offline';
    if (syncState.isSyncing) return 'syncing';
    if (syncState.error) return 'error';
    if (syncState.lastSyncTime) {
      const timeSinceLastSync = Date.now() - syncState.lastSyncTime;
      if (timeSinceLastSync < 60000) return 'synced'; // Less than 1 minute
      if (timeSinceLastSync < 300000) return 'stale'; // Less than 5 minutes
      return 'outdated';
    }
    return 'never';
  }, [syncState]);

  // Format last sync time
  const getLastSyncTime = useCallback(() => {
    if (!syncState.lastSyncTime) return 'Never';
    
    const timeDiff = Date.now() - syncState.lastSyncTime;
    if (timeDiff < 60000) return 'Just now';
    if (timeDiff < 3600000) return `${Math.floor(timeDiff / 60000)}m ago`;
    if (timeDiff < 86400000) return `${Math.floor(timeDiff / 3600000)}h ago`;
    return new Date(syncState.lastSyncTime).toLocaleDateString();
  }, [syncState.lastSyncTime]);

  return {
    syncElements,
    syncState,
    getSyncStatus,
    getLastSyncTime,
    isOnline: syncState.isOnline,
    isSyncing: syncState.isSyncing,
    error: syncState.error,
  };
};

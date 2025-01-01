'use client';

import React, { useEffect, useState } from 'react';
import {
  Alert,
  Snackbar,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
} from '@mui/material';
import {
  CloudOff as CloudOffIcon,
  Sync as SyncIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { offlineService } from '../../services/offlineService';

export default function OfflineStatus() {
  const [showOffline, setShowOffline] = useState(false);
  const [showSync, setShowSync] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    // Subscribe to offline status changes
    const unsubscribe = offlineService.subscribeToStatus((status) => {
      setShowOffline(!status.isOnline);
      setShowSync(status.hasPendingSync);
      setLastSync(status.lastSyncAttempt);
    });

    // Listen for service worker updates
    const handleUpdate = () => setShowUpdate(true);
    window.addEventListener('swUpdateAvailable', handleUpdate);

    return () => {
      unsubscribe();
      window.removeEventListener('swUpdateAvailable', handleUpdate);
    };
  }, []);

  const handleCloseOffline = () => {
    setShowOffline(false);
  };

  const handleCloseSync = () => {
    setShowSync(false);
  };

  const handleSync = async () => {
    try {
      await offlineService.syncOfflineData();
      setShowSync(false);
    } catch (error) {
      console.error('Failed to sync:', error);
    }
  };

  const handleUpdate = async () => {
    try {
      await offlineService.skipWaiting();
      setShowUpdate(false);
      window.location.reload();
    } catch (error) {
      console.error('Failed to update:', error);
    }
  };

  return (
    <>
      {/* Offline Status */}
      <Snackbar
        open={showOffline}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          severity="warning"
          icon={<CloudOffIcon />}
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleCloseOffline}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          You&apos;re offline. Changes will sync when connection is restored.
        </Alert>
      </Snackbar>

      {/* Pending Sync Status */}
      <Snackbar
        open={showSync}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity="info"
          icon={<SyncIcon />}
          action={
            <>
              <Button color="inherit" size="small" onClick={handleSync}>
                Sync Now
              </Button>
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={handleCloseSync}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </>
          }
        >
          {lastSync ? (
            `Changes pending sync. Last attempt: ${lastSync.toLocaleTimeString()}`
          ) : (
            'Changes pending synchronization'
          )}
        </Alert>
      </Snackbar>

      {/* Update Available Dialog */}
      <Dialog open={showUpdate} onClose={() => setShowUpdate(false)}>
        <DialogTitle>Update Available</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <RefreshIcon color="primary" sx={{ fontSize: 40 }} />
            <Typography>
              A new version of the application is available. Would you like to update now?
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            The application will reload to apply the updates.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUpdate(false)}>Later</Button>
          <Button onClick={handleUpdate} variant="contained" autoFocus>
            Update Now
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

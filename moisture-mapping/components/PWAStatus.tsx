import React, { useState, useEffect } from 'react';
import { Box, Typography, Alert } from '@mui/material';

interface PWAStatusState {
  isInstallable: boolean;
  isOfflineCapable: boolean;
  serviceWorkerActive: boolean;
  error?: string;
}

export default function PWAStatus() {
  const [status, setStatus] = useState<PWAStatusState>(() => ({
    isInstallable: false,
    isOfflineCapable: false,
    serviceWorkerActive: false,
  }));

  useEffect(() => {
    let mounted = true;

    const checkStatus = async () => {
      try {
        // Check if service worker is supported and active
        const swSupported = 'serviceWorker' in navigator;
        let swActive = false;

        if (swSupported) {
          const registration = await navigator.serviceWorker.getRegistration();
          swActive = registration?.active !== null || false;
        }

        // Check if app is installable
        const isInstallable = window.matchMedia('(display-mode: browser)').matches &&
          'BeforeInstallPromptEvent' in window;

        // Check if app has offline capabilities
        const isOfflineCapable = 'caches' in window;

        if (mounted) {
          setStatus({
            isInstallable,
            isOfflineCapable,
            serviceWorkerActive: swActive,
          });
        }
      } catch (error) {
        console.error('Error checking PWA status:', error);
        if (mounted) {
          setStatus(prev => ({
            ...prev,
            error: 'Error checking PWA status',
          }));
        }
      }
    };

    // Initial check
    checkStatus();

    // Set up service worker state change listener
    const handleControllerChange = () => {
      if (mounted) {
        checkStatus();
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    }

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && mounted) {
        checkStatus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      mounted = false;
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // Empty dependency array since we don't want to re-run this effect

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        System Status
      </Typography>
      
      {status.error ? (
        <Alert severity="error">{status.error}</Alert>
      ) : (
        <Box>
          <Alert 
            severity={status.serviceWorkerActive ? "success" : "warning"}
            sx={{ mb: 1 }}
          >
            Service Worker: {status.serviceWorkerActive ? 'Active' : 'Not Active'}
          </Alert>
          
          <Alert 
            severity={status.isOfflineCapable ? "success" : "warning"}
            sx={{ mb: 1 }}
          >
            Offline Capability: {status.isOfflineCapable ? 'Available' : 'Not Available'}
          </Alert>
          
          <Alert 
            severity={status.isInstallable ? "info" : "warning"}
            sx={{ mb: 1 }}
          >
            Install Status: {status.isInstallable ? 'Can be installed' : 'Already installed or not installable'}
          </Alert>
        </Box>
      )}
    </Box>
  );
}

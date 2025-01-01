import { useState, useEffect } from 'react';

interface PWAStatus {
  isInstallable: boolean;
  isOfflineCapable: boolean;
  serviceWorkerActive: boolean;
  error?: string;
}

export function usePWAStatus() {
  const [status, setStatus] = useState<PWAStatus>({
    isInstallable: false,
    isOfflineCapable: false,
    serviceWorkerActive: false,
  });

  useEffect(() => {
    let mounted = true;

    const checkStatus = async () => {
      try {
        // Check if service worker is supported
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
    const controllerChangeHandler = () => {
      if (mounted) {
        checkStatus();
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', controllerChangeHandler);
    }

    // Handle visibility change
    const visibilityHandler = () => {
      if (document.visibilityState === 'visible' && mounted) {
        checkStatus();
      }
    };
    document.addEventListener('visibilitychange', visibilityHandler);

    // Cleanup
    return () => {
      mounted = false;
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', controllerChangeHandler);
      }
      document.removeEventListener('visibilitychange', visibilityHandler);
    };
  }, []);

  return status;
}

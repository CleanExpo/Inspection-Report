import { useEffect, useState } from 'react';
import { useEventListener } from './useEventListener';

export interface NetworkState {
  /**
   * Whether the browser has network access
   */
  online: boolean;

  /**
   * Previous online state
   */
  previousOnline?: boolean;

  /**
   * Effective connection type (4g, 3g, 2g, slow-2g)
   */
  effectiveType?: string;

  /**
   * Estimated bandwidth in Mbps
   */
  downlink?: number;

  /**
   * Estimated round-trip time in milliseconds
   */
  rtt?: number;

  /**
   * Whether the user has enabled data saver
   */
  saveData?: boolean;
}

export interface UseNetworkOptions {
  /**
   * Whether to enable network monitoring
   */
  enabled?: boolean;

  /**
   * Callback when network status changes
   */
  onChange?: (state: NetworkState) => void;
}

/**
 * Hook for monitoring network status
 */
export function useNetwork(options: UseNetworkOptions = {}) {
  const {
    enabled = true,
    onChange,
  } = options;

  const [state, setState] = useState<NetworkState>(() => {
    const connection = getNetworkConnection();
    return {
      online: navigator.onLine,
      ...getConnectionDetails(connection),
    };
  });

  useEffect(() => {
    if (!enabled) return;

    const handleConnectionChange = () => {
      const connection = getNetworkConnection();
      setState(prevState => {
        const newState = {
          online: navigator.onLine,
          previousOnline: prevState.online,
          ...getConnectionDetails(connection),
        };
        onChange?.(newState);
        return newState;
      });
    };

    // Get initial state
    handleConnectionChange();

    // Listen for connection changes
    const connection = getNetworkConnection();
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    return () => {
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, [enabled, onChange]);

  // Listen for online/offline events
  useEventListener('online', () => {
    setState(prevState => {
      const newState = {
        ...prevState,
        online: true,
        previousOnline: prevState.online,
      };
      onChange?.(newState);
      return newState;
    });
  }, { enabled });

  useEventListener('offline', () => {
    setState(prevState => {
      const newState = {
        ...prevState,
        online: false,
        previousOnline: prevState.online,
      };
      onChange?.(newState);
      return newState;
    });
  }, { enabled });

  return state;
}

// Helper to get network connection object
function getNetworkConnection(): any {
  if (typeof navigator !== 'undefined') {
    return (
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection
    );
  }
  return null;
}

// Helper to get connection details
function getConnectionDetails(connection: any) {
  if (!connection) {
    return {};
  }

  return {
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData,
  };
}

/**
 * useNetwork Hook Usage Guide:
 * 
 * 1. Basic usage:
 *    function App() {
 *      const network = useNetwork();
 * 
 *      return (
 *        <div>
 *          <div>Status: {network.online ? 'Online' : 'Offline'}</div>
 *          {network.effectiveType && (
 *            <div>Network: {network.effectiveType}</div>
 *          )}
 *        </div>
 *      );
 *    }
 * 
 * 2. With change callback:
 *    function NetworkAware() {
 *      useNetwork({
 *        onChange: (state) => {
 *          if (!state.online && state.previousOnline) {
 *            alert('You are offline!');
 *          }
 *        },
 *      });
 * 
 *      return <div>Network-aware component</div>;
 *    }
 * 
 * 3. Offline-first app:
 *    function OfflineFirst() {
 *      const { online } = useNetwork();
 * 
 *      useEffect(() => {
 *        if (online) {
 *          // Sync offline changes
 *          syncData();
 *        }
 *      }, [online]);
 * 
 *      return (
 *        <div>
 *          {!online && (
 *            <div className="offline-banner">
 *              Working offline - changes will sync when online
 *            </div>
 *          )}
 *          <Content />
 *        </div>
 *      );
 *    }
 * 
 * 4. Network-aware loading:
 *    function ImageLoader({ src, alt }) {
 *      const { effectiveType } = useNetwork();
 * 
 *      const quality = 
 *        effectiveType === '4g' ? 'high' :
 *        effectiveType === '3g' ? 'medium' : 'low';
 * 
 *      return (
 *        <img
 *          src={`${src}?quality=${quality}`}
 *          alt={alt}
 *        />
 *      );
 *    }
 * 
 * 5. Save data mode:
 *    function VideoPlayer({ src }) {
 *      const { saveData } = useNetwork();
 * 
 *      return (
 *        <video
 *          src={src}
 *          autoPlay={!saveData}
 *          preload={saveData ? 'none' : 'auto'}
 *        />
 *      );
 *    }
 * 
 * 6. Connection speed warning:
 *    function SpeedWarning() {
 *      const { effectiveType, rtt } = useNetwork();
 * 
 *      if (effectiveType === 'slow-2g' || rtt > 500) {
 *        return (
 *          <div className="warning">
 *            Slow connection detected - some features may be limited
 *          </div>
 *        );
 *      }
 * 
 *      return null;
 *    }
 * 
 * Notes:
 * - Tracks online/offline status
 * - Provides connection details when available
 * - Supports change callbacks
 * - Can be enabled/disabled
 * - Type-safe
 * - SSR friendly
 * - Uses native browser APIs
 */

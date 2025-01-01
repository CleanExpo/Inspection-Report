import { useEffect, useState } from 'react';

export type ScriptStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface UseScriptOptions {
  /**
   * Whether to load the script immediately
   */
  enabled?: boolean;

  /**
   * Whether to remove the script on unmount
   */
  removeOnUnmount?: boolean;

  /**
   * Script attributes
   */
  attributes?: Record<string, string>;

  /**
   * Callback when script loads successfully
   */
  onLoad?: () => void;

  /**
   * Callback when script fails to load
   */
  onError?: (error: Error) => void;
}

// Keep track of scripts loaded by URL
const cachedScripts = new Map<string, ScriptStatus>();

/**
 * Hook for dynamically loading external scripts
 */
export function useScript(
  src: string | null,
  options: UseScriptOptions = {}
): ScriptStatus {
  const {
    enabled = true,
    removeOnUnmount = false,
    attributes = {},
    onLoad,
    onError,
  } = options;

  const [status, setStatus] = useState<ScriptStatus>(() => {
    if (!src) return 'idle';
    return cachedScripts.get(src) || 'idle';
  });

  useEffect(() => {
    if (!src || !enabled) {
      return;
    }

    // If the script is already cached, use the cached status
    if (cachedScripts.has(src)) {
      setStatus(cachedScripts.get(src)!);
      if (cachedScripts.get(src) === 'ready') {
        onLoad?.();
      }
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = src;
    script.async = true;

    // Add custom attributes
    Object.entries(attributes).forEach(([key, value]) => {
      script.setAttribute(key, value);
    });

    // Update status
    const setScriptStatus = (newStatus: ScriptStatus) => {
      setStatus(newStatus);
      cachedScripts.set(src, newStatus);
    };

    setScriptStatus('loading');

    // Add event listeners
    script.addEventListener('load', () => {
      setScriptStatus('ready');
      onLoad?.();
    });

    script.addEventListener('error', () => {
      const error = new Error(`Failed to load script: ${src}`);
      setScriptStatus('error');
      onError?.(error);
    });

    // Add script to document
    document.body.appendChild(script);

    // Cleanup
    return () => {
      if (removeOnUnmount) {
        document.body.removeChild(script);
        cachedScripts.delete(src);
      }
    };
  }, [src, enabled, removeOnUnmount, onLoad, onError, ...Object.values(attributes)]);

  return status;
}

/**
 * useScript Hook Usage Guide:
 * 
 * 1. Basic usage:
 *    function GoogleMaps() {
 *      const status = useScript(
 *        'https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY'
 *      );
 * 
 *      if (status === 'loading') return <div>Loading...</div>;
 *      if (status === 'error') return <div>Error loading maps</div>;
 *      if (status === 'ready') return <div id="map" />;
 * 
 *      return null;
 *    }
 * 
 * 2. With callbacks:
 *    function StripeCheckout() {
 *      const status = useScript(
 *        'https://js.stripe.com/v3/',
 *        {
 *          onLoad: () => {
 *            const stripe = window.Stripe('YOUR_PUBLISHABLE_KEY');
 *            // Initialize checkout
 *          },
 *          onError: (error) => {
 *            console.error('Stripe failed to load:', error);
 *          },
 *        }
 *      );
 * 
 *      return <div>Stripe status: {status}</div>;
 *    }
 * 
 * 3. Conditional loading:
 *    function ConditionalScript({ shouldLoad }) {
 *      const status = useScript(
 *        'https://example.com/script.js',
 *        {
 *          enabled: shouldLoad,
 *        }
 *      );
 * 
 *      return <div>Script status: {status}</div>;
 *    }
 * 
 * 4. With custom attributes:
 *    function ExternalWidget() {
 *      const status = useScript(
 *        'https://widget.com/embed.js',
 *        {
 *          attributes: {
 *            'data-widget-id': 'xyz123',
 *            'data-theme': 'dark',
 *          },
 *        }
 *      );
 * 
 *      return <div>Widget status: {status}</div>;
 *    }
 * 
 * 5. Remove on unmount:
 *    function TemporaryScript() {
 *      const status = useScript(
 *        'https://example.com/temporary.js',
 *        {
 *          removeOnUnmount: true,
 *        }
 *      );
 * 
 *      return <div>Temporary script: {status}</div>;
 *    }
 * 
 * 6. Multiple scripts:
 *    function Dependencies() {
 *      const jqueryStatus = useScript('https://code.jquery.com/jquery.js');
 *      const pluginStatus = useScript(
 *        jqueryStatus === 'ready'
 *          ? 'https://code.jquery.com/jquery-plugin.js'
 *          : null
 *      );
 * 
 *      return (
 *        <div>
 *          <div>jQuery: {jqueryStatus}</div>
 *          <div>Plugin: {pluginStatus}</div>
 *        </div>
 *      );
 *    }
 * 
 * Notes:
 * - Handles script loading states
 * - Supports callbacks
 * - Caches loaded scripts
 * - Conditional loading
 * - Custom attributes
 * - Cleanup on unmount
 * - Type-safe
 * - SSR friendly
 */

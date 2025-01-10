/**
 * Browser detection utilities for platform-specific optimizations
 */

export interface BrowserInfo {
    isSafari: boolean;
    isIOS: boolean;
    isMobile: boolean;
    isChrome: boolean;
    isFirefox: boolean;
    version: number;
}

export function detectBrowser(): BrowserInfo {
    const ua = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    
    // Safari detection
    // Note: Chrome on iOS uses Safari's WebKit engine
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua) || isIOS;
    
    // Mobile detection
    const isMobile = /mobile|android|iphone|ipad|ipod/i.test(ua);
    
    // Chrome detection (excluding iOS Chrome which uses Safari's engine)
    const isChrome = /chrome/.test(ua) && !isIOS;
    
    // Firefox detection
    const isFirefox = /firefox/.test(ua);
    
    // Version detection
    let version = 0;
    if (isSafari) {
        const match = ua.match(/version\/(\d+)/);
        version = match ? parseInt(match[1], 10) : 0;
    } else if (isChrome) {
        const match = ua.match(/chrome\/(\d+)/);
        version = match ? parseInt(match[1], 10) : 0;
    } else if (isFirefox) {
        const match = ua.match(/firefox\/(\d+)/);
        version = match ? parseInt(match[1], 10) : 0;
    }

    return {
        isSafari,
        isIOS,
        isMobile,
        isChrome,
        isFirefox,
        version
    };
}

/**
 * Safari-specific touch event workarounds
 */
export const SafariTouchFixes = {
    /**
     * Prevents default touch behaviors in Safari that can interfere with canvas interactions
     */
    preventDefaultTouchBehaviors(element: HTMLElement): void {
        // Prevent Safari's native gestures
        element.style.webkitTouchCallout = 'none';
        element.style.webkitUserSelect = 'none';
        
        // Prevent scrolling/zooming
        element.addEventListener('gesturestart', (e) => e.preventDefault());
        element.addEventListener('gesturechange', (e) => e.preventDefault());
        element.addEventListener('gestureend', (e) => e.preventDefault());
        
        // Prevent double-tap to zoom
        let lastTap = 0;
        element.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTap < 300) {
                e.preventDefault();
            }
            lastTap = now;
        });
    },

    /**
     * Fixes touch coordinate calculation issues in Safari
     */
    adjustTouchCoordinates(touch: Touch, element: HTMLElement): Point2D {
        const rect = element.getBoundingClientRect();
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Safari sometimes includes scroll offset in touch coordinates
        return {
            x: touch.clientX - rect.left - scrollLeft,
            y: touch.clientY - rect.top - scrollTop
        };
    },

    /**
     * Handles Safari-specific touch event timing issues
     */
    createTouchEventHandler(handler: (e: TouchEvent) => void): (e: TouchEvent) => void {
        let lastEventTime = 0;
        const MIN_EVENT_INTERVAL = 16; // ~60fps

        return (e: TouchEvent) => {
            const now = performance.now();
            if (now - lastEventTime >= MIN_EVENT_INTERVAL) {
                handler(e);
                lastEventTime = now;
            }
        };
    },

    /**
     * Fixes issues with touch event listeners in Safari
     */
    addSafariTouchListener(
        element: HTMLElement,
        eventType: string,
        handler: (e: TouchEvent) => void,
        options?: AddEventListenerOptions
    ): () => void {
        const wrappedHandler = SafariTouchFixes.createTouchEventHandler(handler);
        
        // Add both touch and mouse events for better compatibility
        element.addEventListener(eventType, wrappedHandler as EventListener, options);
        
        // Return cleanup function
        return () => {
            element.removeEventListener(eventType, wrappedHandler as EventListener, options);
        };
    }
};

interface Point2D {
    x: number;
    y: number;
}

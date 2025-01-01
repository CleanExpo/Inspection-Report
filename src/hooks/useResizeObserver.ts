import { useEffect, useRef, useState } from 'react';

export interface UseResizeObserverOptions {
  /**
   * Whether the observer is enabled
   */
  enabled?: boolean;

  /**
   * Callback when size changes
   */
  onResize?: (entry: ResizeObserverEntry) => void;

  /**
   * Whether to observe border box instead of content box
   */
  box?: ResizeObserverBoxOptions;
}

export interface Size {
  /**
   * Element width
   */
  width: number;

  /**
   * Element height
   */
  height: number;
}

/**
 * Hook for observing element size changes
 */
export function useResizeObserver(
  elementRef: React.RefObject<Element>,
  options: UseResizeObserverOptions = {}
) {
  const {
    enabled = true,
    onResize,
    box = 'content-box',
  } = options;

  const [size, setSize] = useState<Size>();
  const previousSize = useRef<Size>();

  useEffect(() => {
    const element = elementRef?.current;
    if (!enabled || !element) {
      return;
    }

    const observerCallback: ResizeObserverCallback = (entries) => {
      const entry = entries[0];

      const newSize: Size = {
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      };

      // Only update if size has changed
      if (
        !previousSize.current ||
        previousSize.current.width !== newSize.width ||
        previousSize.current.height !== newSize.height
      ) {
        previousSize.current = newSize;
        setSize(newSize);
        onResize?.(entry);
      }
    };

    const observer = new ResizeObserver(observerCallback);
    observer.observe(element, { box });

    return () => observer.disconnect();
  }, [elementRef, enabled, onResize, box]);

  return size;
}

/**
 * useResizeObserver Hook Usage Guide:
 * 
 * 1. Basic usage:
 *    function Component() {
 *      const ref = useRef(null);
 *      const size = useResizeObserver(ref);
 * 
 *      return (
 *        <div ref={ref}>
 *          Size: {size?.width}x{size?.height}
 *        </div>
 *      );
 *    }
 * 
 * 2. With resize callback:
 *    function ResponsiveComponent() {
 *      const ref = useRef(null);
 *      useResizeObserver(ref, {
 *        onResize: (entry) => {
 *          console.log('New size:', entry.contentRect);
 *          // Access additional size information if needed:
 *          console.log('Border box:', entry.borderBoxSize);
 *          console.log('Content box:', entry.contentBoxSize);
 *        },
 *      });
 * 
 *      return <div ref={ref}>Resizable content</div>;
 *    }
 * 
 * 3. Observing border box:
 *    function BorderBoxComponent() {
 *      const ref = useRef(null);
 *      const size = useResizeObserver(ref, {
 *        box: 'border-box',
 *      });
 * 
 *      return (
 *        <div
 *          ref={ref}
 *          style={{ padding: '20px', border: '5px solid black' }}
 *        >
 *          Border box size: {size?.width}x{size?.height}
 *        </div>
 *      );
 *    }
 * 
 * 4. Responsive layout:
 *    function ResponsiveLayout() {
 *      const ref = useRef(null);
 *      const size = useResizeObserver(ref);
 * 
 *      return (
 *        <div ref={ref}>
 *          <div className={size?.width < 768 ? 'mobile' : 'desktop'}>
 *            Responsive content
 *          </div>
 *        </div>
 *      );
 *    }
 * 
 * 5. Dynamic grid:
 *    function DynamicGrid() {
 *      const ref = useRef(null);
 *      const size = useResizeObserver(ref);
 * 
 *      const columns = Math.floor(size?.width / 200) || 1;
 * 
 *      return (
 *        <div
 *          ref={ref}
 *          style={{
 *            display: 'grid',
 *            gridTemplateColumns: `repeat(${columns}, 1fr)`,
 *          }}
 *        >
 *          {items.map(item => (
 *            <div key={item.id}>{item.content}</div>
 *          ))}
 *        </div>
 *      );
 *    }
 * 
 * 6. Canvas resizing:
 *    function ResponsiveCanvas() {
 *      const containerRef = useRef(null);
 *      const canvasRef = useRef(null);
 * 
 *      useResizeObserver(containerRef, {
 *        onResize: (entry) => {
 *          const canvas = canvasRef.current;
 *          if (canvas) {
 *            canvas.width = entry.contentRect.width;
 *            canvas.height = entry.contentRect.height;
 *            // Redraw canvas
 *          }
 *        },
 *      });
 * 
 *      return (
 *        <div ref={containerRef}>
 *          <canvas ref={canvasRef} />
 *        </div>
 *      );
 *    }
 * 
 * Notes:
 * - Uses ResizeObserver API
 * - Supports border-box and content-box
 * - Provides size information
 * - Only triggers on actual size changes
 * - Cleans up observer
 * - Type-safe
 * - Supports custom callbacks
 * - Access to full ResizeObserverEntry in callback
 */

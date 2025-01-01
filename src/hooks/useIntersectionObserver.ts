import { useEffect, useRef, useState } from 'react';

export interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  /**
   * Whether the observer is enabled
   */
  enabled?: boolean;

  /**
   * Callback when intersection changes
   */
  onIntersect?: (entry: IntersectionObserverEntry) => void;

  /**
   * Whether to freeze the observer after first intersection
   */
  freezeOnceVisible?: boolean;
}

/**
 * Hook for observing element intersection with viewport
 */
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: UseIntersectionObserverOptions = {}
) {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0px',
    enabled = true,
    onIntersect,
    freezeOnceVisible = false,
  } = options;

  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const frozen = useRef(false);

  useEffect(() => {
    const element = elementRef?.current;
    if (!enabled || !element || (freezeOnceVisible && frozen.current)) {
      return;
    }

    const observerCallback: IntersectionObserverCallback = ([entry]) => {
      setEntry(entry);
      onIntersect?.(entry);

      if (entry.isIntersecting && freezeOnceVisible) {
        frozen.current = true;
      }
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold,
      root,
      rootMargin,
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [
    elementRef,
    threshold,
    root,
    rootMargin,
    enabled,
    onIntersect,
    freezeOnceVisible,
  ]);

  return {
    entry,
    isIntersecting: entry?.isIntersecting,
    intersectionRatio: entry?.intersectionRatio,
    boundingClientRect: entry?.boundingClientRect,
  };
}

/**
 * useIntersectionObserver Hook Usage Guide:
 * 
 * 1. Basic usage:
 *    function Component() {
 *      const ref = useRef(null);
 *      const { isIntersecting } = useIntersectionObserver(ref);
 * 
 *      return (
 *        <div ref={ref}>
 *          {isIntersecting ? 'Visible' : 'Hidden'}
 *        </div>
 *      );
 *    }
 * 
 * 2. Lazy loading images:
 *    function LazyImage({ src, alt }) {
 *      const ref = useRef(null);
 *      const { isIntersecting } = useIntersectionObserver(ref, {
 *        freezeOnceVisible: true,
 *      });
 * 
 *      return (
 *        <img
 *          ref={ref}
 *          src={isIntersecting ? src : undefined}
 *          alt={alt}
 *        />
 *      );
 *    }
 * 
 * 3. Infinite scroll:
 *    function InfiniteList() {
 *      const [items, setItems] = useState([]);
 *      const [page, setPage] = useState(1);
 *      const loadMoreRef = useRef(null);
 * 
 *      useIntersectionObserver(loadMoreRef, {
 *        onIntersect: (entry) => {
 *          if (entry.isIntersecting) {
 *            setPage(p => p + 1);
 *          }
 *        },
 *      });
 * 
 *      return (
 *        <div>
 *          {items.map(item => (
 *            <div key={item.id}>{item.content}</div>
 *          ))}
 *          <div ref={loadMoreRef}>Loading more...</div>
 *        </div>
 *      );
 *    }
 * 
 * 4. With custom threshold:
 *    function ProgressiveLoad() {
 *      const ref = useRef(null);
 *      const { intersectionRatio } = useIntersectionObserver(ref, {
 *        threshold: [0, 0.25, 0.5, 0.75, 1],
 *      });
 * 
 *      return (
 *        <div
 *          ref={ref}
 *          style={{ opacity: intersectionRatio }}
 *        >
 *          Fade in as visible
 *        </div>
 *      );
 *    }
 * 
 * 5. With root margin:
 *    function PreloadContent() {
 *      const ref = useRef(null);
 *      useIntersectionObserver(ref, {
 *        rootMargin: '200px',
 *        onIntersect: (entry) => {
 *          if (entry.isIntersecting) {
 *            // Preload content
 *          }
 *        },
 *      });
 * 
 *      return <div ref={ref}>Content</div>;
 *    }
 * 
 * 6. With custom root:
 *    function ScrollContainer() {
 *      const containerRef = useRef(null);
 *      const targetRef = useRef(null);
 * 
 *      useIntersectionObserver(targetRef, {
 *        root: containerRef.current,
 *        onIntersect: (entry) => {
 *          console.log('Visible in container:', entry.isIntersecting);
 *        },
 *      });
 * 
 *      return (
 *        <div ref={containerRef} style={{ overflow: 'auto' }}>
 *          <div ref={targetRef}>Target element</div>
 *        </div>
 *      );
 *    }
 * 
 * Notes:
 * - SSR friendly
 * - Supports all IntersectionObserver options
 * - Can freeze after first visibility
 * - Provides detailed intersection data
 * - Cleans up observer
 * - Type-safe
 * - Supports custom callbacks
 */

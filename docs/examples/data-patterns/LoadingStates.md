# Loading State Management

This guide demonstrates patterns for managing loading states in React applications, including skeleton screens, progressive loading, and infinite scroll implementations.

## Skeleton Screens

### Basic Skeleton Component
```tsx
const Skeleton = ({ width = '100%', height = '20px' }) => (
  <div
    className="skeleton-pulse"
    style={{
      width,
      height,
      backgroundColor: '#e0e0e0',
      borderRadius: '4px',
      animation: 'pulse 1.5s ease-in-out infinite'
    }}
  />
);

// Keyframe animation
const styles = `
  @keyframes pulse {
    0% { opacity: 1 }
    50% { opacity: 0.4 }
    100% { opacity: 1 }
  }
`;
```

### Article Card Skeleton
```tsx
const ArticleCardSkeleton = () => (
  <div className="article-card">
    <Skeleton height="200px" /> {/* Image placeholder */}
    <div className="content">
      <Skeleton width="70%" height="24px" /> {/* Title */}
      <div style={{ margin: '12px 0' }}>
        <Skeleton width="100%" /> {/* Description line 1 */}
        <Skeleton width="90%" /> {/* Description line 2 */}
      </div>
      <div className="meta">
        <Skeleton width="30%" /> {/* Author */}
        <Skeleton width="20%" /> {/* Date */}
      </div>
    </div>
  </div>
);
```

## Progressive Loading

### Chunked Data Loading
```tsx
const ChunkedList = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentChunk, setCurrentChunk] = useState(0);
  const CHUNK_SIZE = 20;

  const loadNextChunk = async () => {
    setLoading(true);
    try {
      const newItems = await api.getItems(currentChunk, CHUNK_SIZE);
      setItems(prev => [...prev, ...newItems]);
      setCurrentChunk(prev => prev + 1);
    } catch (error) {
      console.error('Error loading chunk:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNextChunk();
  }, []);

  return (
    <div>
      {items.map(item => (
        <ListItem key={item.id} item={item} />
      ))}
      {loading && <LoadingIndicator />}
      <button 
        onClick={loadNextChunk}
        disabled={loading}
      >
        Load More
      </button>
    </div>
  );
};
```

### Progressive Image Loading
```tsx
const ProgressiveImage = ({ 
  lowQualitySrc, 
  highQualitySrc, 
  alt 
}: {
  lowQualitySrc: string;
  highQualitySrc: string;
  alt: string;
}) => {
  const [src, setSrc] = useState(lowQualitySrc);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = highQualitySrc;
    img.onload = () => {
      setSrc(highQualitySrc);
      setLoaded(true);
    };
  }, [highQualitySrc]);

  return (
    <img
      src={src}
      alt={alt}
      className={`progressive-image ${loaded ? 'loaded' : 'loading'}`}
      style={{
        filter: loaded ? 'none' : 'blur(10px)',
        transition: 'filter 0.3s ease-out'
      }}
    />
  );
};
```

## Infinite Scroll

### Basic Infinite Scroll
```tsx
const InfiniteScrollList = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const loaderRef = useRef(null);

  const loadMore = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const newItems = await api.getItems(page);
      if (newItems.length === 0) {
        setHasMore(false);
        return;
      }
      
      setItems(prev => [...prev, ...newItems]);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error loading more items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [page, loading, hasMore]);

  return (
    <div className="infinite-scroll-container">
      {items.map(item => (
        <ListItem key={item.id} item={item} />
      ))}
      
      <div ref={loaderRef} className="loader">
        {loading && <LoadingSpinner />}
        {!hasMore && <div>No more items to load</div>}
      </div>
    </div>
  );
};
```

### Advanced Infinite Scroll with Virtualization
```tsx
import { FixedSizeList } from 'react-window';

const VirtualizedInfiniteList = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMoreItems = async (startIndex: number, stopIndex: number) => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const newItems = await api.getItemRange(startIndex, stopIndex);
      if (newItems.length === 0) {
        setHasMore(false);
        return;
      }

      setItems(prev => {
        const updated = [...prev];
        newItems.forEach((item, index) => {
          updated[startIndex + index] = item;
        });
        return updated;
      });
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = items[index];
    
    if (!item) {
      return (
        <div style={style}>
          <Skeleton />
        </div>
      );
    }

    return (
      <div style={style}>
        <ListItem item={item} />
      </div>
    );
  };

  return (
    <FixedSizeList
      height={800}
      width="100%"
      itemCount={1000} // Estimated total count
      itemSize={100} // Height of each row
      onItemsRendered={({ visibleStartIndex, visibleStopIndex }) => {
        loadMoreItems(visibleStartIndex, visibleStopIndex);
      }}
    >
      {Row}
    </FixedSizeList>
  );
};
```

## Best Practices

1. **Skeleton Screens**
   - Match skeleton dimensions to actual content
   - Use subtle animations to indicate loading
   - Maintain consistent layout during loading

2. **Progressive Loading**
   - Load essential content first
   - Show loading indicators for subsequent content
   - Consider user bandwidth and device capabilities

3. **Infinite Scroll**
   - Implement proper scroll position restoration
   - Handle error states gracefully
   - Consider memory management for large lists

4. **Performance**
   - Use virtualization for large lists
   - Implement proper cleanup in useEffect
   - Optimize re-renders during loading

5. **User Experience**
   - Provide clear loading feedback
   - Maintain UI responsiveness during loading
   - Handle edge cases (no data, errors, etc.)

These patterns provide a foundation for implementing smooth loading experiences in React applications. Adapt them based on your specific requirements and user needs.

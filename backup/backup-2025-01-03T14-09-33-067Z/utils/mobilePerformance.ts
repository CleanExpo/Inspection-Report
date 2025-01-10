import { useEffect, useState, useRef, useCallback } from 'react';

// Image optimization configuration
interface ImageOptimizationConfig {
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  blur?: number;
}

const defaultConfig: ImageOptimizationConfig = {
  quality: 80,
  format: 'webp',
  blur: 10,
};

// Image optimization utility
export const optimizeImageUrl = (
  url: string,
  width: number,
  config: ImageOptimizationConfig = defaultConfig
): string => {
  // Check if URL is already optimized
  if (url.includes('?optimize=true')) {
    return url;
  }

  try {
    // Create URL object to manipulate parameters
    const imageUrl = new URL(url);
    // Add optimization parameters
    imageUrl.searchParams.set('optimize', 'true');
    imageUrl.searchParams.set('w', width.toString());
    imageUrl.searchParams.set('q', String(config.quality ?? defaultConfig.quality));
    imageUrl.searchParams.set('fm', String(config.format ?? defaultConfig.format));
    
    if (config.blur) {
      imageUrl.searchParams.set('blur', config.blur.toString());
    }

    return imageUrl.toString();
  } catch (error) {
    console.warn('Invalid URL:', url);
    return url;
  }
};

// Lazy loading hook for images
export function useLazyImage(src: string, options: IntersectionObserverInit = {}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    let observer: IntersectionObserver;
    let mounted = true;

    if (imageRef.current) {
      observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && mounted) {
          // Load optimized image based on device width
          const width = window.innerWidth;
          const optimizedSrc = optimizeImageUrl(src, width);
          setImageSrc(optimizedSrc);
          observer.unobserve(entry.target);
        }
      }, options);

      observer.observe(imageRef.current);
    }

    return () => {
      mounted = false;
      if (observer) {
        observer.disconnect();
      }
    };
  }, [src, options]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  return { imageRef, imageSrc, isLoaded, handleLoad };
}

// Mobile cache manager
interface CacheConfig {
  maxSize: number; // Maximum cache size in bytes
  maxAge: number; // Maximum age in milliseconds
}

class MobileCacheManager {
  private static instance: MobileCacheManager;
  private cache: Map<string, { data: any; size: number; timestamp: number }>;
  private currentSize: number;
  private config: CacheConfig;

  private constructor(config: CacheConfig) {
    this.cache = new Map();
    this.currentSize = 0;
    this.config = config;
  }

  public static getInstance(config: CacheConfig = { maxSize: 50 * 1024 * 1024, maxAge: 24 * 60 * 60 * 1000 }): MobileCacheManager {
    if (!MobileCacheManager.instance) {
      MobileCacheManager.instance = new MobileCacheManager(config);
    }
    return MobileCacheManager.instance;
  }

  private getItemSize(item: any): number {
    return new TextEncoder().encode(JSON.stringify(item)).length;
  }

  private evictOldItems(): void {
    const now = Date.now();
    Array.from(this.cache.entries()).forEach(([key, value]) => {
      if (now - value.timestamp > this.config.maxAge) {
        this.currentSize -= value.size;
        this.cache.delete(key);
      }
    });
  }

  private makeSpace(requiredSize: number): void {
    const sortedEntries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);

    for (const [key, value] of sortedEntries) {
      if (this.currentSize + requiredSize <= this.config.maxSize) {
        break;
      }
      this.currentSize -= value.size;
      this.cache.delete(key);
    }
  }

  public set(key: string, data: any): void {
    this.evictOldItems();

    const size = this.getItemSize(data);
    if (size > this.config.maxSize) {
      console.warn(`Item size (${size} bytes) exceeds cache max size (${this.config.maxSize} bytes)`);
      return;
    }

    this.makeSpace(size);

    this.cache.set(key, {
      data,
      size,
      timestamp: Date.now(),
    });
    this.currentSize += size;
  }

  public get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.config.maxAge) {
      this.currentSize -= item.size;
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  public clear(): void {
    this.cache.clear();
    this.currentSize = 0;
  }

  public getCacheStats(): { size: number; itemCount: number } {
    return {
      size: this.currentSize,
      itemCount: this.cache.size,
    };
  }
}

export const mobileCache = MobileCacheManager.getInstance();

// Resource preloader for mobile
export class ResourcePreloader {
  private static preloadedResources = new Set<string>();

  public static preload(urls: string[]): Promise<void[]> {
    const newUrls = urls.filter(url => !this.preloadedResources.has(url));
    
    const promises = newUrls.map(url => {
      if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        return this.preloadImage(url);
      } else if (url.match(/\.(js)$/i)) {
        return this.preloadScript(url);
      } else if (url.match(/\.(css)$/i)) {
        return this.preloadStyle(url);
      }
      return Promise.resolve();
    });

    newUrls.forEach(url => this.preloadedResources.add(url));
    return Promise.all(promises);
  }

  private static preloadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = url;
    });
  }

  private static preloadScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.onload = () => resolve();
      script.onerror = reject;
      script.src = url;
      script.async = true;
      document.head.appendChild(script);
    });
  }

  private static preloadStyle(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.onload = () => resolve();
      link.onerror = reject;
      link.rel = 'stylesheet';
      link.href = url;
      document.head.appendChild(link);
    });
  }
}

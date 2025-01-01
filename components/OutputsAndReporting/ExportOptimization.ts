import { ExportError } from './ExportUtils';

interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

interface CacheEntry {
  data: Blob;
  timestamp: number;
}

// In-memory LRU cache for optimized assets
const assetCache = new Map<string, CacheEntry>();
const CACHE_MAX_SIZE = 50; // Maximum number of items in cache
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes TTL

/**
 * Optimize an image for export by resizing and compressing
 */
export const optimizeImage = async (
  imageElement: HTMLImageElement,
  options: ImageOptimizationOptions = {}
): Promise<Blob> => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    format = 'jpeg'
  } = options;

  // Generate cache key based on image source and options
  const cacheKey = `${imageElement.src}-${maxWidth}-${maxHeight}-${quality}-${format}`;

  // Check cache first
  const cached = assetCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    // Create canvas for image processing
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new ExportError('Failed to get canvas context');
    }

    // Calculate dimensions while maintaining aspect ratio
    let width = imageElement.naturalWidth;
    let height = imageElement.naturalHeight;
    
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width *= ratio;
      height *= ratio;
    }

    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;

    // Draw and optimize image
    ctx.drawImage(imageElement, 0, 0, width, height);

    // Convert to blob with specified format and quality
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new ExportError('Failed to convert canvas to blob'));
          }
        },
        `image/${format}`,
        quality
      );
    });

    // Update cache
    updateCache(cacheKey, blob);

    return blob;
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Unknown error occurred');
    throw new ExportError(`Image optimization failed: ${error.message}`);
  }
};

/**
 * Optimize HTML content for export by minifying and cleaning
 */
export const optimizeContent = (content: HTMLElement): HTMLElement => {
  const clone = content.cloneNode(true) as HTMLElement;

  // Remove unnecessary whitespace and comments
  const walker = document.createTreeWalker(
    clone,
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_COMMENT,
    null
  );

  const nodesToRemove: Node[] = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.nodeType === Node.COMMENT_NODE) {
      nodesToRemove.push(node);
    } else if (node.nodeType === Node.TEXT_NODE) {
      node.textContent = node.textContent?.trim().replace(/\s+/g, ' ') || '';
    }
  }

  nodesToRemove.forEach(node => node.parentNode?.removeChild(node));

  // Remove empty elements and unnecessary attributes
  const elements = clone.getElementsByTagName('*');
  for (let i = elements.length - 1; i >= 0; i--) {
    const el = elements[i];
    
    // Remove empty elements that aren't self-closing
    if (!el.hasChildNodes() && 
        !['img', 'br', 'hr', 'input', 'meta', 'link'].includes(el.tagName.toLowerCase())) {
      el.parentNode?.removeChild(el);
      continue;
    }

    // Remove unnecessary attributes
    const attrs = el.attributes;
    for (let j = attrs.length - 1; j >= 0; j--) {
      const attr = attrs[j];
      if (attr.name.startsWith('data-') || 
          ['id', 'class'].includes(attr.name)) {
        el.removeAttribute(attr.name);
      }
    }
  }

  return clone;
};

/**
 * Update the asset cache with new entry
 */
const updateCache = (key: string, data: Blob): void => {
  // Remove oldest entries if cache is full
  if (assetCache.size >= CACHE_MAX_SIZE) {
    const oldestKey = Array.from(assetCache.keys())[0];
    assetCache.delete(oldestKey);
  }

  // Add new entry
  assetCache.set(key, {
    data,
    timestamp: Date.now()
  });
};

/**
 * Clear expired entries from cache
 */
export const cleanCache = (): void => {
  const now = Date.now();
  Array.from(assetCache.entries()).forEach(([key, entry]) => {
    if (now - entry.timestamp > CACHE_TTL) {
      assetCache.delete(key);
    }
  });
};

// Clean cache periodically
setInterval(cleanCache, CACHE_TTL);

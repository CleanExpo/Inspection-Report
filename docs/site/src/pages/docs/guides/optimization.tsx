import MainLayout from '../../../layouts/MainLayout';

export default function OptimizationGuide() {
  return (
    <MainLayout>
      <div className="prose prose-lg max-w-none dark:prose-invert">
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
          <a href="/docs/guides" className="hover:text-blue-600 dark:hover:text-blue-400">Guides</a>
          <span>/</span>
          <span>Export Optimization</span>
        </div>

        <h1>Export Optimization Guide</h1>
        
        <div className="doc-section">
          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mb-6">
            <p className="text-blue-800 dark:text-blue-200 m-0">
              Learn how to optimize your export operations for better performance,
              reduced memory usage, and improved output quality.
            </p>
          </div>
        </div>

        <div className="doc-section">
          <h2>Image Optimization</h2>
          
          <h3>Using the Image Optimizer</h3>
          <p>
            The <code>optimizeImage</code> utility provides efficient image processing:
          </p>
          <pre>
            <code>{`import { optimizeImage } from '@inspection-report/core';

// Basic optimization
const optimizedBlob = await optimizeImage(imageElement, {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8,
  format: 'jpeg'
});

// Format-specific optimization
const webpBlob = await optimizeImage(imageElement, {
  maxWidth: 1280,
  maxHeight: 720,
  quality: 0.9,
  format: 'webp'  // Better compression, modern format
});`}</code>
          </pre>

          <h3>Best Practices for Image Optimization</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="doc-card">
              <h4 className="font-semibold">Resolution Guidelines</h4>
              <ul>
                <li>Standard documents: 1920x1080 max</li>
                <li>Thumbnails: 400x300 max</li>
                <li>Print-quality: 3000x2000 max</li>
              </ul>
            </div>
            <div className="doc-card">
              <h4 className="font-semibold">Format Selection</h4>
              <ul>
                <li>Photos: JPEG (quality: 0.8-0.9)</li>
                <li>Graphics: PNG (quality: 0.9)</li>
                <li>Modern browsers: WebP</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="doc-section">
          <h2>Content Optimization</h2>
          
          <h3>HTML Content Cleanup</h3>
          <p>
            Use the <code>optimizeContent</code> utility to prepare HTML for export:
          </p>
          <pre>
            <code>{`import { optimizeContent } from '@inspection-report/core';

// Clean up HTML content
const cleanContent = optimizeContent(documentElement);

// Custom cleanup with specific rules
const customCleanup = (element) => {
  const cleaned = optimizeContent(element);
  
  // Additional custom cleanup
  cleaned.querySelectorAll('script, style').forEach(el => el.remove());
  cleaned.querySelectorAll('[data-private]').forEach(el => el.remove());
  
  return cleaned;
};`}</code>
          </pre>

          <h3>Content Optimization Strategies</h3>
          <ul>
            <li>Remove unnecessary whitespace and comments</li>
            <li>Clean up empty elements</li>
            <li>Remove unused attributes</li>
            <li>Normalize text content</li>
          </ul>
        </div>

        <div className="doc-section">
          <h2>Caching Strategies</h2>
          
          <h3>Built-in LRU Cache</h3>
          <p>
            The optimization module includes an LRU cache for optimized assets:
          </p>
          <pre>
            <code>{`// Cache is automatically used by optimizeImage
const blob1 = await optimizeImage(image, options);  // First call: processes image
const blob2 = await optimizeImage(image, options);  // Second call: returns cached result

// Manual cache cleanup
import { cleanCache } from '@inspection-report/core';
cleanCache();  // Removes expired entries`}</code>
          </pre>

          <h3>Cache Configuration</h3>
          <div className="doc-card">
            <ul>
              <li>Maximum size: 50 items</li>
              <li>TTL: 30 minutes</li>
              <li>Automatic cleanup</li>
              <li>LRU eviction policy</li>
            </ul>
          </div>
        </div>

        <div className="doc-section">
          <h2>Batch Processing Optimization</h2>
          
          <h3>Concurrent Processing</h3>
          <p>
            Optimize batch exports with controlled concurrency:
          </p>
          <pre>
            <code>{`// Configure batch processing
const batchConfig = {
  maxConcurrent: 3,  // Process 3 documents at a time
  chunkSize: 10,     // Split large batches into chunks
  retryAttempts: 2   // Retry failed exports
};

// Implementation
const processBatch = async (documents) => {
  const chunks = splitIntoChunks(documents, batchConfig.chunkSize);
  
  for (const chunk of chunks) {
    const promises = chunk.map(doc => processDocument(doc));
    await Promise.all(promises);
  }
};`}</code>
          </pre>

          <h3>Memory Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="doc-card">
              <h4 className="font-semibold">Batch Size Guidelines</h4>
              <ul>
                <li>Small documents: 20-30 per batch</li>
                <li>Medium documents: 10-15 per batch</li>
                <li>Large documents: 5-10 per batch</li>
              </ul>
            </div>
            <div className="doc-card">
              <h4 className="font-semibold">Resource Cleanup</h4>
              <ul>
                <li>Clear references after processing</li>
                <li>Release blob URLs</li>
                <li>Clean up temporary files</li>
                <li>Monitor memory usage</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="doc-section">
          <h2>Performance Monitoring</h2>
          
          <h3>Key Metrics</h3>
          <div className="doc-card space-y-4">
            <ul>
              <li>Processing time per document</li>
              <li>Memory usage during export</li>
              <li>Cache hit rate</li>
              <li>Error rate and types</li>
            </ul>
          </div>

          <h3>Monitoring Implementation</h3>
          <pre>
            <code>{`const monitorExport = async (document) => {
  const startTime = performance.now();
  const startMemory = performance.memory?.usedJSHeapSize;

  try {
    await processDocument(document);
  } finally {
    const duration = performance.now() - startTime;
    const memoryUsed = performance.memory?.usedJSHeapSize - startMemory;

    logMetrics({
      documentId: document.id,
      duration,
      memoryUsed,
      timestamp: new Date()
    });
  }
};`}</code>
          </pre>
        </div>

        <div className="doc-section">
          <h2>Troubleshooting</h2>
          <div className="space-y-4">
            <div className="doc-card">
              <h3 className="text-lg font-semibold mb-2">Common Issues</h3>
              <ul>
                <li>High memory usage during batch processing</li>
                <li>Slow export performance</li>
                <li>Cache misses</li>
                <li>Resource leaks</li>
              </ul>
            </div>
            <div className="doc-card">
              <h3 className="text-lg font-semibold mb-2">Solutions</h3>
              <ul>
                <li>Adjust batch sizes and concurrency</li>
                <li>Optimize image resolution and quality</li>
                <li>Implement proper cleanup routines</li>
                <li>Monitor and adjust cache settings</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="doc-section">
          <h2>Related Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="/docs/components/export-optimization" className="doc-card group">
              <h3 className="text-lg font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400">
                ExportOptimization API →
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Complete API reference for optimization utilities
              </p>
            </a>
            <a href="/docs/guides/batch-export-implementation" className="doc-card group">
              <h3 className="text-lg font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400">
                Batch Export Guide →
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Learn about implementing batch exports
              </p>
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

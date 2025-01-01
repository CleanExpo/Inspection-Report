import MainLayout from '../../../layouts/MainLayout';

export default function ExportOptimizationDocs() {
  return (
    <MainLayout>
      <div className="prose prose-lg max-w-none dark:prose-invert">
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
          <a href="/docs/components" className="hover:text-blue-600 dark:hover:text-blue-400">Components</a>
          <span>/</span>
          <span>ExportOptimization</span>
        </div>

        <h1>Export Optimization</h1>
        
        <div className="doc-section">
          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mb-6">
            <p className="text-blue-800 dark:text-blue-200 m-0">
              A collection of utilities for optimizing document exports, including image optimization,
              content minification, and asset caching.
            </p>
          </div>

          <h2>Installation</h2>
          <pre>
            <code>{`import { optimizeImage, optimizeContent, cleanCache } from '@inspection-report/core';`}</code>
          </pre>
        </div>

        <div className="doc-section">
          <h2>Image Optimization</h2>
          <p>
            The <code>optimizeImage</code> function provides efficient image processing for exports,
            including resizing, compression, and format conversion.
          </p>

          <h3>Interface</h3>
          <pre>
            <code>{`interface ImageOptimizationOptions {
  maxWidth?: number;    // Maximum width (default: 1920)
  maxHeight?: number;   // Maximum height (default: 1080)
  quality?: number;     // Compression quality 0-1 (default: 0.8)
  format?: 'jpeg' | 'png' | 'webp';  // Output format (default: 'jpeg')
}

async function optimizeImage(
  imageElement: HTMLImageElement,
  options?: ImageOptimizationOptions
): Promise<Blob>`}</code>
          </pre>

          <h3>Example Usage</h3>
          <pre>
            <code>{`// Basic usage with defaults
const optimizedBlob = await optimizeImage(imageElement);

// Custom optimization settings
const optimizedBlob = await optimizeImage(imageElement, {
  maxWidth: 1280,
  maxHeight: 720,
  quality: 0.9,
  format: 'webp'
});`}</code>
          </pre>

          <h3>Features</h3>
          <ul>
            <li>Automatic aspect ratio preservation</li>
            <li>Multiple output format support</li>
            <li>Quality control for compression</li>
            <li>Built-in error handling</li>
            <li>LRU caching for optimized assets</li>
          </ul>
        </div>

        <div className="doc-section">
          <h2>Content Optimization</h2>
          <p>
            The <code>optimizeContent</code> function prepares HTML content for export by
            removing unnecessary elements and optimizing the structure.
          </p>

          <h3>Interface</h3>
          <pre>
            <code>{`function optimizeContent(content: HTMLElement): HTMLElement`}</code>
          </pre>

          <h3>Optimization Features</h3>
          <ul>
            <li>Whitespace normalization</li>
            <li>Comment removal</li>
            <li>Empty element cleanup</li>
            <li>Attribute optimization</li>
            <li>DOM structure preservation</li>
          </ul>

          <h3>Example Usage</h3>
          <pre>
            <code>{`const contentElement = document.getElementById('report-content');
const optimizedContent = optimizeContent(contentElement);

// Use optimized content for export
generatePDF(optimizedContent);`}</code>
          </pre>
        </div>

        <div className="doc-section">
          <h2>Caching System</h2>
          <p>
            The optimization module includes a built-in LRU (Least Recently Used) cache
            for optimized assets to improve performance in batch operations.
          </p>

          <h3>Cache Configuration</h3>
          <ul>
            <li>Maximum cache size: 50 items</li>
            <li>Time-to-live (TTL): 30 minutes</li>
            <li>Automatic cleanup of expired entries</li>
            <li>LRU eviction policy</li>
          </ul>

          <h3>Cache Management</h3>
          <pre>
            <code>{`// Manually clean expired cache entries
cleanCache();

// Cache is automatically cleaned every 30 minutes
// No manual intervention required for normal operation`}</code>
          </pre>
        </div>

        <div className="doc-section">
          <h2>Best Practices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="doc-card">
              <h3 className="text-lg font-semibold mb-2">Performance</h3>
              <ul>
                <li>Use appropriate image dimensions</li>
                <li>Choose optimal format for content type</li>
                <li>Balance quality vs file size</li>
                <li>Leverage caching for repeated exports</li>
              </ul>
            </div>
            <div className="doc-card">
              <h3 className="text-lg font-semibold mb-2">Memory Management</h3>
              <ul>
                <li>Monitor cache size in large operations</li>
                <li>Clean up resources after batch exports</li>
                <li>Handle large images in chunks</li>
                <li>Use appropriate quality settings</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="doc-section">
          <h2>Error Handling</h2>
          <p>
            The optimization utilities use a custom <code>ExportError</code> class for
            error handling:
          </p>
          <pre>
            <code>{`try {
  const optimizedImage = await optimizeImage(imageElement);
} catch (err) {
  if (err instanceof ExportError) {
    console.error('Optimization failed:', err.message);
    // Handle optimization-specific error
  } else {
    // Handle other errors
  }
}`}</code>
          </pre>
        </div>

        <div className="doc-section">
          <h2>Related Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="/docs/components/batch-export" className="doc-card group">
              <h3 className="text-lg font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400">
                BatchExport Component →
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Learn about batch export functionality
              </p>
            </a>
            <a href="/docs/guides/optimization" className="doc-card group">
              <h3 className="text-lg font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400">
                Optimization Guide →
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Detailed guide on optimizing exports
              </p>
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

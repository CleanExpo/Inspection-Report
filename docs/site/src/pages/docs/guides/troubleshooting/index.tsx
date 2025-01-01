import MainLayout from '../../../../layouts/MainLayout';

export default function TroubleshootingGuide() {
  return (
    <MainLayout>
      <div className="prose prose-lg max-w-none dark:prose-invert">
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
          <a href="/docs/guides" className="hover:text-blue-600 dark:hover:text-blue-400">Guides</a>
          <span>/</span>
          <span>Troubleshooting</span>
        </div>

        <h1>Troubleshooting Guide</h1>
        
        <div className="doc-section">
          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mb-6">
            <p className="text-blue-800 dark:text-blue-200 m-0">
              Common issues, solutions, and debugging strategies for the Inspection Report system.
            </p>
          </div>
        </div>

        <div className="doc-section">
          <h2>Common Export Errors</h2>
          
          <div className="space-y-6">
            <div className="doc-card">
              <h3 className="text-xl font-semibold mb-3">Missing Content References</h3>
              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded">
                  <p className="text-red-700 dark:text-red-300 font-mono text-sm">
                    Error: Content reference is not available
                  </p>
                </div>
                <h4 className="font-semibold">Solution:</h4>
                <ul>
                  <li>Ensure document refs are properly initialized</li>
                  <li>Wait for content to be mounted before export</li>
                  <li>Check if content elements exist in the DOM</li>
                </ul>
                <pre>
                  <code>{`// Correct implementation
useEffect(() => {
  if (documentRef.current) {
    startExport();
  }
}, [documentRef.current]);

// Check ref before export
const handleExport = () => {
  if (!documentRef.current) {
    console.error('Document content not available');
    return;
  }
  startExport();
};`}</code>
                </pre>
              </div>
            </div>

            <div className="doc-card">
              <h3 className="text-xl font-semibold mb-3">Memory Exceeded</h3>
              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded">
                  <p className="text-red-700 dark:text-red-300 font-mono text-sm">
                    Error: JavaScript heap out of memory
                  </p>
                </div>
                <h4 className="font-semibold">Solution:</h4>
                <ul>
                  <li>Reduce batch size</li>
                  <li>Implement pagination</li>
                  <li>Optimize image sizes</li>
                  <li>Clear unused resources</li>
                </ul>
                <pre>
                  <code>{`// Implement chunking for large batches
const processBatchWithChunks = async (documents) => {
  const chunks = splitIntoChunks(documents, 10);
  
  for (const chunk of chunks) {
    await processChunk(chunk);
    // Clear memory after each chunk
    clearTemporaryResources();
  }
};`}</code>
                </pre>
              </div>
            </div>

            <div className="doc-card">
              <h3 className="text-xl font-semibold mb-3">Export Format Errors</h3>
              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded">
                  <p className="text-red-700 dark:text-red-300 font-mono text-sm">
                    Error: Invalid export format specified
                  </p>
                </div>
                <h4 className="font-semibold">Solution:</h4>
                <ul>
                  <li>Verify supported formats</li>
                  <li>Check format compatibility</li>
                  <li>Validate format options</li>
                </ul>
                <pre>
                  <code>{`// Validate format before export
const validateFormat = (format) => {
  const supportedFormats = ['pdf', 'docx', 'html'];
  if (!supportedFormats.includes(format)) {
    throw new Error(\`Unsupported format: \${format}\`);
  }
};`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>

        <div className="doc-section">
          <h2>Performance Issues</h2>
          
          <div className="space-y-6">
            <div className="doc-card">
              <h3 className="text-xl font-semibold mb-3">Slow Export Performance</h3>
              <h4 className="font-semibold">Symptoms:</h4>
              <ul>
                <li>Long processing times</li>
                <li>High CPU usage</li>
                <li>Browser unresponsiveness</li>
              </ul>
              <h4 className="font-semibold mt-4">Solutions:</h4>
              <ul>
                <li>Enable caching</li>
                <li>Optimize image sizes</li>
                <li>Use concurrent processing</li>
                <li>Implement progress tracking</li>
              </ul>
              <pre>
                <code>{`// Monitor export performance
const monitorPerformance = async (exportFn) => {
  const start = performance.now();
  try {
    await exportFn();
  } finally {
    const duration = performance.now() - start;
    if (duration > 5000) {
      console.warn('Export took longer than 5 seconds');
      // Log performance metrics
    }
  }
};`}</code>
              </pre>
            </div>

            <div className="doc-card">
              <h3 className="text-xl font-semibold mb-3">Memory Leaks</h3>
              <h4 className="font-semibold">Symptoms:</h4>
              <ul>
                <li>Increasing memory usage</li>
                <li>Browser crashes</li>
                <li>Degraded performance over time</li>
              </ul>
              <h4 className="font-semibold mt-4">Solutions:</h4>
              <pre>
                <code>{`// Implement proper cleanup
useEffect(() => {
  return () => {
    // Clear cached resources
    cleanCache();
    // Release blob URLs
    blobUrls.forEach(URL.revokeObjectURL);
    // Clear temporary data
    clearTempData();
  };
}, []);`}</code>
              </pre>
            </div>
          </div>
        </div>

        <div className="doc-section">
          <h2>Integration Issues</h2>
          
          <div className="space-y-6">
            <div className="doc-card">
              <h3 className="text-xl font-semibold mb-3">Component Integration</h3>
              <h4 className="font-semibold">Common Issues:</h4>
              <ul>
                <li>Incorrect prop types</li>
                <li>Missing dependencies</li>
                <li>Lifecycle conflicts</li>
              </ul>
              <h4 className="font-semibold mt-4">Solutions:</h4>
              <pre>
                <code>{`// Proper component integration
import { BatchExport } from '@inspection-report/core';

// Type checking for props
interface ExportProps {
  documents: ExportDocument[];
  onComplete: (results: ExportResult[]) => void;
}

// Proper error boundaries
class ExportErrorBoundary extends React.Component {
  componentDidCatch(error, info) {
    // Log error and show fallback UI
  }
}`}</code>
              </pre>
            </div>

            <div className="doc-card">
              <h3 className="text-xl font-semibold mb-3">API Integration</h3>
              <h4 className="font-semibold">Common Issues:</h4>
              <ul>
                <li>Authentication errors</li>
                <li>Rate limiting</li>
                <li>Network timeouts</li>
              </ul>
              <h4 className="font-semibold mt-4">Solutions:</h4>
              <pre>
                <code>{`// Implement retry logic
const exportWithRetry = async (document, attempts = 3) => {
  for (let i = 0; i < attempts; i++) {
    try {
      return await exportDocument(document);
    } catch (err) {
      if (i === attempts - 1) throw err;
      // Exponential backoff
      await delay(Math.pow(2, i) * 1000);
    }
  }
};`}</code>
              </pre>
            </div>
          </div>
        </div>

        <div className="doc-section">
          <h2>Debugging Tools</h2>
          
          <div className="space-y-4">
            <div className="doc-card">
              <h3 className="text-xl font-semibold mb-3">Built-in Debugging</h3>
              <p>Enable debug mode for detailed logging:</p>
              <pre>
                <code>{`import { enableDebug } from '@inspection-report/core';

enableDebug({
  logLevel: 'verbose',
  logToConsole: true,
  logToFile: true,
  filename: 'export-debug.log'
});`}</code>
              </pre>
            </div>

            <div className="doc-card">
              <h3 className="text-xl font-semibold mb-3">Performance Monitoring</h3>
              <p>Use the built-in performance monitoring tools:</p>
              <pre>
                <code>{`import { monitor } from '@inspection-report/core';

const exportWithMonitoring = monitor.wrap(exportDocument, {
  name: 'document-export',
  threshold: 5000, // Log if execution exceeds 5s
  metrics: ['duration', 'memory', 'errors']
});`}</code>
              </pre>
            </div>
          </div>
        </div>

        <div className="doc-section">
          <h2>Getting Help</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="doc-card">
              <h3 className="text-xl font-semibold mb-3">Community Support</h3>
              <ul>
                <li>GitHub Issues</li>
                <li>Stack Overflow</li>
                <li>Discord Community</li>
              </ul>
            </div>
            <div className="doc-card">
              <h3 className="text-xl font-semibold mb-3">Professional Support</h3>
              <ul>
                <li>Premium Support Plans</li>
                <li>Direct Email Support</li>
                <li>Custom Solutions</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="doc-section">
          <h2>Related Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="/docs/guides/optimization" className="doc-card group">
              <h3 className="text-lg font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400">
                Optimization Guide →
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Learn about optimizing export performance
              </p>
            </a>
            <a href="/docs/guides/best-practices" className="doc-card group">
              <h3 className="text-lg font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400">
                Best Practices →
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Development and production best practices
              </p>
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

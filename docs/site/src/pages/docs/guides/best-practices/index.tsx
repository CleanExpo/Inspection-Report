import MainLayout from '../../../../layouts/MainLayout';

export default function BestPracticesGuide() {
  return (
    <MainLayout>
      <div className="prose prose-lg max-w-none dark:prose-invert">
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
          <a href="/docs/guides" className="hover:text-blue-600 dark:hover:text-blue-400">Guides</a>
          <span>/</span>
          <span>Best Practices</span>
        </div>

        <h1>Best Practices</h1>
        
        <div className="doc-section">
          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mb-6">
            <p className="text-blue-800 dark:text-blue-200 m-0">
              Recommended patterns and practices for developing and deploying with the Inspection Report system.
            </p>
          </div>
        </div>

        <div className="doc-section">
          <h2>Development Best Practices</h2>
          
          <h3>Code Organization</h3>
          <div className="doc-card space-y-4">
            <p>Follow these patterns for maintainable code:</p>
            <pre>
              <code>{`// Group related functionality
📁 components/
  📁 export/
    ├─ BatchExport.tsx       # Main export component
    ├─ ExportOptions.tsx     # Export configuration
    ├─ ExportProgress.tsx    # Progress tracking
    └─ index.ts             # Public API

// Use barrel exports
export { BatchExport } from './BatchExport';
export { ExportOptions } from './ExportOptions';
export type { ExportConfig } from './types';`}</code>
            </pre>
          </div>

          <h3 className="mt-8">Type Safety</h3>
          <div className="doc-card space-y-4">
            <p>Leverage TypeScript for better development experience:</p>
            <pre>
              <code>{`// Define clear interfaces
interface ExportOptions {
  format: 'pdf' | 'docx' | 'html';
  quality: number;
  includeImages: boolean;
}

// Use type guards
function isValidExportFormat(format: string): format is ExportFormat {
  return ['pdf', 'docx', 'html'].includes(format);
}

// Enforce type safety
function configureExport(options: ExportOptions) {
  if (!isValidExportFormat(options.format)) {
    throw new Error(\`Invalid format: \${options.format}\`);
  }
}`}</code>
            </pre>
          </div>

          <h3 className="mt-8">Error Handling</h3>
          <div className="doc-card space-y-4">
            <p>Implement robust error handling:</p>
            <pre>
              <code>{`// Custom error classes
class ExportError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ExportError';
  }
}

// Error boundaries
class ExportErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <ExportErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}`}</code>
            </pre>
          </div>
        </div>

        <div className="doc-section">
          <h2>Production Best Practices</h2>

          <h3>Performance Optimization</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="doc-card">
              <h4 className="font-semibold">Memory Management</h4>
              <ul>
                <li>Implement cleanup routines</li>
                <li>Use proper garbage collection</li>
                <li>Monitor memory usage</li>
                <li>Clear temporary resources</li>
              </ul>
              <pre>
                <code>{`// Cleanup example
useEffect(() => {
  return () => {
    cleanupExportResources();
    clearCache();
    revokeObjectURLs();
  };
}, []);`}</code>
              </pre>
            </div>
            <div className="doc-card">
              <h4 className="font-semibold">Resource Loading</h4>
              <ul>
                <li>Lazy load components</li>
                <li>Implement code splitting</li>
                <li>Optimize bundle size</li>
                <li>Use dynamic imports</li>
              </ul>
              <pre>
                <code>{`// Lazy loading
const BatchExport = React.lazy(() => 
  import('./components/BatchExport')
);

// With fallback
<Suspense fallback={<LoadingSpinner />}>
  <BatchExport />
</Suspense>`}</code>
              </pre>
            </div>
          </div>

          <h3 className="mt-8">Monitoring and Logging</h3>
          <div className="doc-card space-y-4">
            <p>Implement comprehensive monitoring:</p>
            <pre>
              <code>{`// Configure monitoring
const monitor = {
  error: (error: Error, context?: any) => {
    logger.error(error, { context });
    metrics.increment('export_errors');
  },
  
  performance: (metric: string, value: number) => {
    metrics.gauge(\`export_\${metric}\`, value);
  },
  
  event: (name: string, data?: any) => {
    logger.info(name, { ...data });
    metrics.increment(\`export_\${name}\`);
  }
};

// Usage
try {
  const startTime = performance.now();
  await exportDocument(doc);
  monitor.performance('duration', performance.now() - startTime);
  monitor.event('export_success');
} catch (error) {
  monitor.error(error, { documentId: doc.id });
}`}</code>
            </pre>
          </div>
        </div>

        <div className="doc-section">
          <h2>Security Best Practices</h2>
          
          <div className="space-y-6">
            <div className="doc-card">
              <h3 className="text-xl font-semibold mb-3">Input Validation</h3>
              <pre>
                <code>{`// Validate all inputs
const validateExportConfig = (config: unknown): ExportConfig => {
  if (!config || typeof config !== 'object') {
    throw new Error('Invalid configuration');
  }

  // Type assertion with validation
  const validConfig = {
    format: validateFormat(config.format),
    quality: validateQuality(config.quality),
    security: validateSecurity(config.security)
  };

  return validConfig;
};`}</code>
              </pre>
            </div>

            <div className="doc-card">
              <h3 className="text-xl font-semibold mb-3">Content Security</h3>
              <pre>
                <code>{`// Sanitize content
import DOMPurify from 'dompurify';

const sanitizeContent = (content: string): string => {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'b', 'i', 'img'],
    ALLOWED_ATTR: ['src', 'alt', 'title']
  });
};

// Secure resource loading
const loadResource = async (url: string) => {
  if (!isAllowedDomain(url)) {
    throw new SecurityError('Invalid resource domain');
  }
  return await fetchWithTimeout(url);
};`}</code>
              </pre>
            </div>
          </div>
        </div>

        <div className="doc-section">
          <h2>Testing Best Practices</h2>
          
          <div className="space-y-6">
            <div className="doc-card">
              <h3 className="text-xl font-semibold mb-3">Unit Testing</h3>
              <pre>
                <code>{`// Test export functionality
describe('BatchExport', () => {
  it('should handle multiple documents', async () => {
    const docs = generateTestDocuments(3);
    const result = await batchExport(docs);
    
    expect(result).toHaveLength(3);
    expect(result.every(r => r.success)).toBe(true);
  });

  it('should handle errors gracefully', async () => {
    const docs = [invalidDocument];
    const result = await batchExport(docs);
    
    expect(result[0].success).toBe(false);
    expect(result[0].error).toBeDefined();
  });
});`}</code>
              </pre>
            </div>

            <div className="doc-card">
              <h3 className="text-xl font-semibold mb-3">Integration Testing</h3>
              <pre>
                <code>{`// Test complete export flow
describe('Export Flow', () => {
  it('should process end-to-end export', async () => {
    // Setup
    const doc = await createTestDocument();
    const component = render(<BatchExport docs={[doc]} />);
    
    // Trigger export
    await userEvent.click(screen.getByText('Export'));
    
    // Verify results
    expect(await screen.findByText('Export Complete')).toBeVisible();
    expect(mockExportAPI).toHaveBeenCalledWith(doc);
  });
});`}</code>
              </pre>
            </div>
          </div>
        </div>

        <div className="doc-section">
          <h2>Related Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="/docs/guides/troubleshooting" className="doc-card group">
              <h3 className="text-lg font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400">
                Troubleshooting Guide →
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Common issues and solutions
              </p>
            </a>
            <a href="/docs/guides/optimization" className="doc-card group">
              <h3 className="text-lg font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400">
                Optimization Guide →
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Performance optimization techniques
              </p>
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

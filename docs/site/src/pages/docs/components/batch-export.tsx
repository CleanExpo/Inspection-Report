import MainLayout from '../../../layouts/MainLayout';

export default function BatchExportDocs() {
  return (
    <MainLayout>
      <div className="prose prose-lg max-w-none dark:prose-invert">
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
          <a href="/docs/components" className="hover:text-blue-600 dark:hover:text-blue-400">Components</a>
          <span>/</span>
          <span>BatchExport</span>
        </div>

        <h1>BatchExport Component</h1>
        
        <div className="doc-section">
          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mb-6">
            <p className="text-blue-800 dark:text-blue-200 m-0">
              A powerful component for batch processing and exporting multiple documents with progress tracking,
              tag filtering, and concurrent processing capabilities.
            </p>
          </div>

          <h2>Installation</h2>
          <pre>
            <code>{`import { BatchExport } from '@inspection-report/core';`}</code>
          </pre>
        </div>

        <div className="doc-section">
          <h2>Props</h2>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Prop</th>
                  <th>Type</th>
                  <th>Required</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>documents</td>
                  <td>ExportDocument[]</td>
                  <td>Yes</td>
                  <td>Array of documents to be exported</td>
                </tr>
                <tr>
                  <td>theme</td>
                  <td>ExportTheme</td>
                  <td>Yes</td>
                  <td>Theme configuration for exported documents</td>
                </tr>
                <tr>
                  <td>onExportComplete</td>
                  <td>function</td>
                  <td>No</td>
                  <td>Callback function called when export completes</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="mt-6">TypeScript Interfaces</h3>
          <pre>
            <code>{`interface ExportDocument {
  id: string;
  title: string;
  contentRef: React.RefObject<HTMLElement>;
  tags?: string[];
  version?: string;
  paperSize?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
}

interface BatchExportProps {
  documents: ExportDocument[];
  theme: ExportTheme;
  onExportComplete?: (results: {
    id: string;
    success: boolean;
    error?: string;
  }[]) => void;
}`}</code>
          </pre>
        </div>

        <div className="doc-section">
          <h2>Basic Usage</h2>
          <p>
            Here's a simple example of using the BatchExport component:
          </p>
          <pre>
            <code>{`import { BatchExport } from '@inspection-report/core';
import { useRef } from 'react';

function ExportPage() {
  const doc1Ref = useRef(null);
  const doc2Ref = useRef(null);

  const documents = [
    {
      id: '1',
      title: 'Inspection Report 1',
      contentRef: doc1Ref,
      tags: ['residential', '2024'],
    },
    {
      id: '2',
      title: 'Inspection Report 2',
      contentRef: doc2Ref,
      tags: ['commercial', '2024'],
    },
  ];

  const theme = {
    primaryColor: '#007bff',
    fontFamily: 'Arial',
    // ... other theme properties
  };

  const handleExportComplete = (results) => {
    console.log('Export completed:', results);
  };

  return (
    <div>
      <div ref={doc1Ref}>
        {/* Document 1 content */}
      </div>
      <div ref={doc2Ref}>
        {/* Document 2 content */}
      </div>

      <BatchExport
        documents={documents}
        theme={theme}
        onExportComplete={handleExportComplete}
      />
    </div>
  );
}`}</code>
          </pre>
        </div>

        <div className="doc-section">
          <h2>Features</h2>
          
          <h3>Tag Filtering</h3>
          <p>
            The component supports filtering documents by tags, allowing users to select specific document categories for export:
          </p>
          <ul>
            <li>Tags are automatically extracted from documents</li>
            <li>Multiple tags can be selected for filtering</li>
            <li>Documents must match at least one selected tag to be included</li>
          </ul>

          <h3>Queue Management</h3>
          <p>
            Documents are processed in a queue with the following features:
          </p>
          <ul>
            <li>Concurrent processing (up to 3 documents simultaneously)</li>
            <li>Progress tracking for each document</li>
            <li>Ability to stop the export process</li>
            <li>Error handling and status reporting</li>
          </ul>

          <h3>Export Status Tracking</h3>
          <p>
            Each document in the queue has one of the following statuses:
          </p>
          <ul>
            <li><code>pending</code> - Waiting to be processed</li>
            <li><code>processing</code> - Currently being exported</li>
            <li><code>completed</code> - Successfully exported</li>
            <li><code>failed</code> - Export failed with error</li>
          </ul>
        </div>

        <div className="doc-section">
          <h2>Advanced Usage</h2>
          <h3>Custom Export Configuration</h3>
          <pre>
            <code>{`<BatchExport
  documents={[
    {
      id: '1',
      title: 'Custom Report',
      contentRef: reportRef,
      paperSize: 'a4',
      orientation: 'landscape',
      version: '2.0',
      tags: ['custom', 'landscape'],
    }
  ]}
  theme={{
    primaryColor: '#007bff',
    fontSize: '14px',
    headerTemplate: CustomHeader,
    footerTemplate: CustomFooter,
  }}
  onExportComplete={(results) => {
    results.forEach(({ id, success, error }) => {
      if (!success) {
        console.error(\`Export failed for \${id}: \${error}\`);
      }
    });
  }}
/>`}</code>
          </pre>
        </div>

        <div className="doc-section">
          <h2>Best Practices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="doc-card">
              <h3 className="text-lg font-semibold mb-2">Performance</h3>
              <ul>
                <li>Use appropriate image compression</li>
                <li>Keep document content refs up-to-date</li>
                <li>Consider memory usage with large batches</li>
                <li>Monitor export queue size</li>
              </ul>
            </div>
            <div className="doc-card">
              <h3 className="text-lg font-semibold mb-2">Error Handling</h3>
              <ul>
                <li>Implement proper error boundaries</li>
                <li>Handle network failures gracefully</li>
                <li>Provide user feedback for failures</li>
                <li>Log export errors for debugging</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="doc-section">
          <h2>Related Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="/docs/components/export-optimization" className="doc-card group">
              <h3 className="text-lg font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400">
                Export Optimization →
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Learn about optimizing exports for better performance
              </p>
            </a>
            <a href="/docs/api/export/batch" className="doc-card group">
              <h3 className="text-lg font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400">
                Batch Export API →
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                API documentation for batch export functionality
              </p>
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

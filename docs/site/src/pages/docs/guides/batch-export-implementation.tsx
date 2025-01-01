import MainLayout from '../../../layouts/MainLayout';

export default function BatchExportImplementationGuide() {
  return (
    <MainLayout>
      <div className="prose prose-lg max-w-none dark:prose-invert">
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
          <a href="/docs/guides" className="hover:text-blue-600 dark:hover:text-blue-400">Guides</a>
          <span>/</span>
          <span>Batch Export Implementation</span>
        </div>

        <h1>Implementing Batch Export</h1>
        
        <div className="doc-section">
          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mb-6">
            <p className="text-blue-800 dark:text-blue-200 m-0">
              A comprehensive guide to implementing batch export functionality in your application,
              including optimization, progress tracking, and error handling.
            </p>
          </div>
        </div>

        <div className="doc-section">
          <h2>Prerequisites</h2>
          <ul>
            <li>React 16.8+ (for hooks support)</li>
            <li>@inspection-report/core package installed</li>
            <li>Basic understanding of React components and hooks</li>
            <li>Familiarity with async/await and Promises</li>
          </ul>
        </div>

        <div className="doc-section">
          <h2>Implementation Steps</h2>
          
          <h3>1. Basic Setup</h3>
          <p>First, import the necessary components and utilities:</p>
          <pre>
            <code>{`import { BatchExport } from '@inspection-report/core';
import { useRef, useState } from 'react';
import type { ExportDocument, ExportTheme } from '@inspection-report/core';`}</code>
          </pre>

          <h3>2. Prepare Document References</h3>
          <p>Create refs for each document you want to export:</p>
          <pre>
            <code>{`function ExportPage() {
  // Create refs for documents
  const documentRefs = useRef([]);
  
  // Prepare document data
  const documents = [
    {
      id: '1',
      title: 'Report 1',
      contentRef: documentRefs.current[0],
      tags: ['residential'],
      paperSize: 'a4'
    },
    // ... more documents
  ];

  return (
    <div>
      {/* Document content with refs */}
      {documents.map((doc, index) => (
        <div key={doc.id} ref={el => documentRefs.current[index] = el}>
          {/* Document content */}
        </div>
      ))}
      
      {/* BatchExport component */}
    </div>
  );
}`}</code>
          </pre>

          <h3>3. Configure Export Theme</h3>
          <p>Set up the theme configuration for consistent export styling:</p>
          <pre>
            <code>{`const theme: ExportTheme = {
  primaryColor: '#007bff',
  fontFamily: 'Arial, sans-serif',
  fontSize: '14px',
  headerTemplate: ({ title }) => (
    <div className="export-header">
      <h1>{title}</h1>
      <div className="date">{new Date().toLocaleDateString()}</div>
    </div>
  ),
  footerTemplate: ({ pageNumber, totalPages }) => (
    <div className="export-footer">
      Page {pageNumber} of {totalPages}
    </div>
  )
};`}</code>
          </pre>

          <h3>4. Handle Export Results</h3>
          <p>Implement the export completion handler:</p>
          <pre>
            <code>{`const handleExportComplete = (results) => {
  results.forEach(({ id, success, error }) => {
    if (success) {
      console.log(\`Export successful for document \${id}\`);
    } else {
      console.error(\`Export failed for document \${id}: \${error}\`);
    }
  });
  
  // Update UI or notify user
  updateExportStatus(results);
};`}</code>
          </pre>

          <h3>5. Complete Implementation</h3>
          <p>Put it all together with the BatchExport component:</p>
          <pre>
            <code>{`function ExportPage() {
  const documentRefs = useRef([]);
  const [exportStatus, setExportStatus] = useState({});

  const documents = [
    {
      id: '1',
      title: 'Report 1',
      contentRef: documentRefs.current[0],
      tags: ['residential'],
      paperSize: 'a4'
    },
    // ... more documents
  ];

  const theme = {
    primaryColor: '#007bff',
    fontFamily: 'Arial, sans-serif',
    // ... theme configuration
  };

  const handleExportComplete = (results) => {
    const newStatus = results.reduce((acc, { id, success, error }) => ({
      ...acc,
      [id]: { success, error }
    }), {});
    setExportStatus(newStatus);
  };

  return (
    <div>
      {/* Document content */}
      {documents.map((doc, index) => (
        <div key={doc.id} ref={el => documentRefs.current[index] = el}>
          {/* Document content */}
        </div>
      ))}

      {/* Export component */}
      <BatchExport
        documents={documents}
        theme={theme}
        onExportComplete={handleExportComplete}
      />

      {/* Status display */}
      {Object.entries(exportStatus).map(([id, status]) => (
        <div key={id} className={status.success ? 'success' : 'error'}>
          Document {id}: {status.success ? 'Success' : status.error}
        </div>
      ))}
    </div>
  );
}`}</code>
          </pre>
        </div>

        <div className="doc-section">
          <h2>Advanced Features</h2>

          <h3>Tag-based Filtering</h3>
          <p>
            Implement tag filtering to allow users to export specific document categories:
          </p>
          <pre>
            <code>{`const [selectedTags, setSelectedTags] = useState(new Set());

const filteredDocuments = documents.filter(doc => 
  selectedTags.size === 0 || doc.tags?.some(tag => selectedTags.has(tag))
);

// Tag selection UI
const toggleTag = (tag) => {
  const newTags = new Set(selectedTags);
  if (newTags.has(tag)) {
    newTags.delete(tag);
  } else {
    newTags.add(tag);
  }
  setSelectedTags(newTags);
};`}</code>
          </pre>

          <h3>Progress Tracking</h3>
          <p>
            Monitor export progress with a custom progress handler:
          </p>
          <pre>
            <code>{`const [progress, setProgress] = useState({});

const handleProgress = (documentId, status) => {
  setProgress(prev => ({
    ...prev,
    [documentId]: status
  }));
};`}</code>
          </pre>
        </div>

        <div className="doc-section">
          <h2>Best Practices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="doc-card">
              <h3 className="text-lg font-semibold mb-2">Performance</h3>
              <ul>
                <li>Use document refs efficiently</li>
                <li>Implement proper cleanup</li>
                <li>Optimize document content before export</li>
                <li>Use appropriate batch sizes</li>
              </ul>
            </div>
            <div className="doc-card">
              <h3 className="text-lg font-semibold mb-2">Error Handling</h3>
              <ul>
                <li>Implement proper error boundaries</li>
                <li>Handle network failures gracefully</li>
                <li>Provide clear error messages</li>
                <li>Implement retry mechanisms</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="doc-section">
          <h2>Common Issues</h2>
          <div className="space-y-4">
            <div className="doc-card">
              <h3 className="text-lg font-semibold mb-2">Missing Content References</h3>
              <p>
                Ensure all document refs are properly set before starting the export process.
                Use useEffect to verify refs are available.
              </p>
            </div>
            <div className="doc-card">
              <h3 className="text-lg font-semibold mb-2">Memory Management</h3>
              <p>
                For large batches, consider implementing pagination or chunking to prevent
                memory issues. Monitor memory usage during export operations.
              </p>
            </div>
          </div>
        </div>

        <div className="doc-section">
          <h2>Related Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="/docs/components/batch-export" className="doc-card group">
              <h3 className="text-lg font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400">
                BatchExport Component →
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Detailed API reference for the BatchExport component
              </p>
            </a>
            <a href="/docs/guides/optimization" className="doc-card group">
              <h3 className="text-lg font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400">
                Export Optimization →
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Learn about optimizing export performance
              </p>
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

import MainLayout from '../../../../layouts/MainLayout';

export default function GenerateExportDocs() {
  return (
    <MainLayout>
      <div className="prose prose-lg max-w-none dark:prose-invert">
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
          <a href="/docs/api" className="hover:text-blue-600 dark:hover:text-blue-400">API</a>
          <span>/</span>
          <a href="/docs/api#export" className="hover:text-blue-600 dark:hover:text-blue-400">Export</a>
          <span>/</span>
          <span>Generate Export</span>
        </div>

        <h1>Generate Export</h1>
        
        <div className="doc-section">
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <code className="text-lg">POST /api/export</code>
          </div>
          
          <p className="mt-4">
            Generates an export of one or more inspection reports in the specified format.
            Supports various output formats and customization options.
          </p>
        </div>

        <div className="doc-section">
          <h2>Request Body</h2>
          <pre>
            <code>{`{
  "reportId": "string",       // Required: ID of the report to export
  "format": "string",        // Required: Output format (pdf, docx, html)
  "options": {
    "template": "string",    // Optional: Template name to use
    "includeImages": boolean,// Optional: Include images in export (default: true)
    "watermark": "string",   // Optional: Watermark text
    "compression": {         // Optional: Compression settings
      "enabled": boolean,
      "quality": "high" | "medium" | "low"
    },
    "metadata": {           // Optional: Additional metadata
      "author": "string",
      "company": "string",
      "keywords": string[]
    }
  }
}`}</code>
          </pre>
        </div>

        <div className="doc-section">
          <h2>Response</h2>
          <h3>Success Response (200 OK)</h3>
          <pre>
            <code>{`{
  "id": "export_123",
  "status": "completed",
  "url": "https://api.example.com/exports/export_123.pdf",
  "format": "pdf",
  "size": 1048576,
  "createdAt": "2024-01-15T12:00:00Z",
  "expiresAt": "2024-01-22T12:00:00Z"
}`}</code>
          </pre>

          <h3 className="mt-6">Error Response (400 Bad Request)</h3>
          <pre>
            <code>{`{
  "error": {
    "code": "validation_error",
    "message": "Invalid export format specified",
    "details": {
      "field": "format",
      "allowed": ["pdf", "docx", "html"]
    }
  }
}`}</code>
          </pre>
        </div>

        <div className="doc-section">
          <h2>Example Usage</h2>
          <div className="space-y-4">
            <p>Using curl:</p>
            <pre>
              <code>{`curl -X POST https://api.example.com/api/export \\
  -H "Authorization: Bearer your-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "reportId": "report_123",
    "format": "pdf",
    "options": {
      "template": "standard",
      "includeImages": true
    }
  }'`}</code>
            </pre>

            <p>Using JavaScript:</p>
            <pre>
              <code>{`const response = await fetch('https://api.example.com/api/export', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your-api-key',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    reportId: 'report_123',
    format: 'pdf',
    options: {
      template: 'standard',
      includeImages: true,
    },
  }),
});

const result = await response.json();`}</code>
            </pre>
          </div>
        </div>

        <div className="doc-section">
          <h2>Notes</h2>
          <ul>
            <li>Export URLs are temporary and expire after 7 days</li>
            <li>Maximum report size for export is 100MB</li>
            <li>Processing time varies based on report size and complexity</li>
            <li>Rate limits apply (see <a href="/docs/api#rate-limits">Rate Limits</a>)</li>
          </ul>
        </div>

        <div className="doc-section">
          <h2>Related Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="/docs/api/export/batch" className="doc-card group">
              <h3 className="text-lg font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400">
                Batch Export →
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Export multiple reports in a single request
              </p>
            </a>
            <a href="/docs/guides/optimization" className="doc-card group">
              <h3 className="text-lg font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400">
                Export Optimization →
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Best practices for optimizing export performance
              </p>
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

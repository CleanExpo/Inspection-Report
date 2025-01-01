import MainLayout from '../../../layouts/MainLayout';

export default function ApiDocumentation() {
  return (
    <MainLayout>
      <div className="prose prose-lg max-w-none dark:prose-invert">
        <h1>API Documentation</h1>
        
        <div className="doc-section">
          <h2>Overview</h2>
          <p>
            The Inspection Report API provides a comprehensive set of endpoints for managing inspection reports,
            handling data export, and integrating with external systems.
          </p>
        </div>

        <div className="doc-section">
          <h2>Authentication</h2>
          <p>
            All API requests require authentication using an API key. Include your API key in the request
            headers using the following format:
          </p>
          <pre>
            <code>{`Authorization: Bearer your-api-key`}</code>
          </pre>
        </div>

        <div className="doc-section">
          <h2>API Endpoints</h2>
          <div className="space-y-6">
            {/* Reports */}
            <div className="doc-card">
              <h3 className="text-xl font-semibold mb-3">Reports</h3>
              <ul className="space-y-3">
                <li>
                  <a href="/docs/api/reports/create" className="flex items-center justify-between group">
                    <div>
                      <span className="font-semibold">Create Report</span>
                      <p className="text-sm text-gray-600 dark:text-gray-300">POST /api/reports</p>
                    </div>
                    <span className="text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100">→</span>
                  </a>
                </li>
                <li>
                  <a href="/docs/api/reports/get" className="flex items-center justify-between group">
                    <div>
                      <span className="font-semibold">Get Report</span>
                      <p className="text-sm text-gray-600 dark:text-gray-300">GET /api/reports/:id</p>
                    </div>
                    <span className="text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100">→</span>
                  </a>
                </li>
                <li>
                  <a href="/docs/api/reports/update" className="flex items-center justify-between group">
                    <div>
                      <span className="font-semibold">Update Report</span>
                      <p className="text-sm text-gray-600 dark:text-gray-300">PUT /api/reports/:id</p>
                    </div>
                    <span className="text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100">→</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Export */}
            <div className="doc-card">
              <h3 className="text-xl font-semibold mb-3">Export</h3>
              <ul className="space-y-3">
                <li>
                  <a href="/docs/api/export/generate" className="flex items-center justify-between group">
                    <div>
                      <span className="font-semibold">Generate Export</span>
                      <p className="text-sm text-gray-600 dark:text-gray-300">POST /api/export</p>
                    </div>
                    <span className="text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100">→</span>
                  </a>
                </li>
                <li>
                  <a href="/docs/api/export/batch" className="flex items-center justify-between group">
                    <div>
                      <span className="font-semibold">Batch Export</span>
                      <p className="text-sm text-gray-600 dark:text-gray-300">POST /api/export/batch</p>
                    </div>
                    <span className="text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100">→</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Sections */}
            <div className="doc-card">
              <h3 className="text-xl font-semibold mb-3">Sections</h3>
              <ul className="space-y-3">
                <li>
                  <a href="/docs/api/sections/add" className="flex items-center justify-between group">
                    <div>
                      <span className="font-semibold">Add Section</span>
                      <p className="text-sm text-gray-600 dark:text-gray-300">POST /api/reports/:id/sections</p>
                    </div>
                    <span className="text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100">→</span>
                  </a>
                </li>
                <li>
                  <a href="/docs/api/sections/update" className="flex items-center justify-between group">
                    <div>
                      <span className="font-semibold">Update Section</span>
                      <p className="text-sm text-gray-600 dark:text-gray-300">PUT /api/reports/:id/sections/:sectionId</p>
                    </div>
                    <span className="text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100">→</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="doc-section">
          <h2>Rate Limits</h2>
          <p>
            The API has rate limits to ensure fair usage. The current limits are:
          </p>
          <ul>
            <li>100 requests per minute per API key</li>
            <li>1000 requests per hour per API key</li>
            <li>Batch operations count as multiple requests based on the number of items</li>
          </ul>
        </div>

        <div className="doc-section">
          <h2>Error Handling</h2>
          <p>
            The API uses standard HTTP response codes and returns detailed error messages in JSON format:
          </p>
          <pre>
            <code>{`{
  "error": {
    "code": "validation_error",
    "message": "Invalid report format specified",
    "details": {
      "field": "format",
      "allowed": ["pdf", "docx", "html"]
    }
  }
}`}</code>
          </pre>
        </div>
      </div>
    </MainLayout>
  );
}

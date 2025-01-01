import MainLayout from '../../layouts/MainLayout';

export default function GettingStarted() {
  return (
    <MainLayout>
      <div className="prose prose-lg max-w-none dark:prose-invert">
        <h1>Getting Started</h1>
        
        <div className="doc-section">
          <h2>Installation</h2>
          <p>
            The Inspection Report system can be installed using npm or yarn:
          </p>
          <pre>
            <code>npm install @inspection-report/core</code>
          </pre>
          <p>Or using yarn:</p>
          <pre>
            <code>yarn add @inspection-report/core</code>
          </pre>
        </div>

        <div className="doc-section">
          <h2>Basic Setup</h2>
          <p>
            After installation, you'll need to initialize the system with your configuration:
          </p>
          <pre>
            <code>{`import { initializeInspection } from '@inspection-report/core';

const config = {
  apiKey: 'your-api-key',
  environment: 'production',
  // Additional configuration options
};

initializeInspection(config);`}</code>
          </pre>
        </div>

        <div className="doc-section">
          <h2>Key Concepts</h2>
          <ul>
            <li>
              <strong>Reports</strong> - The core data structure representing an inspection
            </li>
            <li>
              <strong>Sections</strong> - Modular components of a report
            </li>
            <li>
              <strong>Export Options</strong> - Various formats for exporting reports
            </li>
            <li>
              <strong>Batch Processing</strong> - Handling multiple reports efficiently
            </li>
          </ul>
        </div>

        <div className="doc-section">
          <h2>Quick Start Guide</h2>
          <ol>
            <li>Install the package using npm or yarn</li>
            <li>Configure your environment variables</li>
            <li>Initialize the system with your configuration</li>
            <li>Create your first report using the provided templates</li>
            <li>Customize the report sections as needed</li>
          </ol>
          <p>
            For more detailed information, check out our{' '}
            <a href="/docs/guides/configuration">configuration guide</a> and{' '}
            <a href="/docs/api">API documentation</a>.
          </p>
        </div>

        <div className="doc-section">
          <h2>Example Usage</h2>
          <pre>
            <code>{`import { createReport, addSection } from '@inspection-report/core';

// Create a new report
const report = createReport({
  title: 'Property Inspection',
  date: new Date(),
  inspector: 'John Doe'
});

// Add sections to the report
await addSection(report.id, {
  type: 'moisture',
  data: {
    readings: [
      { location: 'Living Room', value: 12 },
      { location: 'Bathroom', value: 15 }
    ]
  }
});

// Generate the report
const result = await generateReport(report.id, {
  format: 'pdf',
  template: 'standard'
});`}</code>
          </pre>
        </div>

        <div className="doc-section">
          <h2>Next Steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="doc-card">
              <h3 className="text-lg font-semibold mb-2">Explore Components</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Learn about our pre-built components and how to use them in your reports.
              </p>
              <a href="/docs/components" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                View Components →
              </a>
            </div>
            <div className="doc-card">
              <h3 className="text-lg font-semibold mb-2">API Reference</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Detailed documentation of all available API endpoints and methods.
              </p>
              <a href="/docs/api" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                View API Docs →
              </a>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

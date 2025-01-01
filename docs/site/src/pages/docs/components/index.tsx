import MainLayout from '../../../layouts/MainLayout';

export default function ComponentsDocumentation() {
  return (
    <MainLayout>
      <div className="prose prose-lg max-w-none dark:prose-invert">
        <h1>Components</h1>
        
        <div className="doc-section">
          <h2>Overview</h2>
          <p>
            The Inspection Report system provides a comprehensive set of React components
            for building inspection reports. These components are designed to be modular,
            customizable, and easy to integrate into your application.
          </p>
        </div>

        <div className="doc-section">
          <h2>Component Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Output & Reporting */}
            <div className="doc-card">
              <h3 className="text-xl font-semibold mb-3">Output & Reporting</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Components for generating and exporting reports in various formats.
              </p>
              <ul className="space-y-2">
                <li>
                  <a href="/docs/components/batch-export" className="text-blue-600 dark:text-blue-400 hover:underline">
                    BatchExport
                  </a>
                </li>
                <li>
                  <a href="/docs/components/export-optimization" className="text-blue-600 dark:text-blue-400 hover:underline">
                    ExportOptimization
                  </a>
                </li>
                <li>
                  <a href="/docs/components/report-generator" className="text-blue-600 dark:text-blue-400 hover:underline">
                    ReportGenerator
                  </a>
                </li>
              </ul>
            </div>

            {/* Data Input */}
            <div className="doc-card">
              <h3 className="text-xl font-semibold mb-3">Data Input</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Form components for collecting inspection data.
              </p>
              <ul className="space-y-2">
                <li>
                  <a href="/docs/components/inspection-form" className="text-blue-600 dark:text-blue-400 hover:underline">
                    InspectionForm
                  </a>
                </li>
                <li>
                  <a href="/docs/components/moisture-readings" className="text-blue-600 dark:text-blue-400 hover:underline">
                    MoistureReadings
                  </a>
                </li>
                <li>
                  <a href="/docs/components/photo-upload" className="text-blue-600 dark:text-blue-400 hover:underline">
                    PhotoUpload
                  </a>
                </li>
              </ul>
            </div>

            {/* Visualization */}
            <div className="doc-card">
              <h3 className="text-xl font-semibold mb-3">Visualization</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Components for displaying data and generating visual reports.
              </p>
              <ul className="space-y-2">
                <li>
                  <a href="/docs/components/moisture-map" className="text-blue-600 dark:text-blue-400 hover:underline">
                    MoistureMap
                  </a>
                </li>
                <li>
                  <a href="/docs/components/data-charts" className="text-blue-600 dark:text-blue-400 hover:underline">
                    DataCharts
                  </a>
                </li>
                <li>
                  <a href="/docs/components/photo-gallery" className="text-blue-600 dark:text-blue-400 hover:underline">
                    PhotoGallery
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="doc-section">
          <h2>Component Guidelines</h2>
          <div className="space-y-4">
            <h3>Installation</h3>
            <p>
              All components are available in the main package and can be imported directly:
            </p>
            <pre>
              <code>{`import { BatchExport, ReportGenerator } from '@inspection-report/core';`}</code>
            </pre>

            <h3>TypeScript Support</h3>
            <p>
              All components include TypeScript definitions and prop types for better development experience:
            </p>
            <pre>
              <code>{`import type { BatchExportProps } from '@inspection-report/core';`}</code>
            </pre>

            <h3>Customization</h3>
            <p>
              Components can be customized using:
            </p>
            <ul>
              <li>Props for behavior and data configuration</li>
              <li>Tailwind CSS classes for styling</li>
              <li>Theme variables for consistent branding</li>
              <li>Render props for custom content</li>
            </ul>
          </div>
        </div>

        <div className="doc-section">
          <h2>Best Practices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="doc-card">
              <h3 className="text-lg font-semibold mb-2">Performance</h3>
              <ul className="space-y-2">
                <li>Use React.memo() for expensive renders</li>
                <li>Implement proper error boundaries</li>
                <li>Optimize re-renders with useMemo and useCallback</li>
                <li>Lazy load components when possible</li>
              </ul>
            </div>
            <div className="doc-card">
              <h3 className="text-lg font-semibold mb-2">Accessibility</h3>
              <ul className="space-y-2">
                <li>Include proper ARIA labels</li>
                <li>Ensure keyboard navigation</li>
                <li>Maintain proper color contrast</li>
                <li>Support screen readers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

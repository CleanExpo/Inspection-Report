import MainLayout from '../../../layouts/MainLayout';

export default function GuidesIndex() {
  return (
    <MainLayout>
      <div className="prose prose-lg max-w-none dark:prose-invert">
        <h1>Integration Guides</h1>
        
        <div className="doc-section">
          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mb-6">
            <p className="text-blue-800 dark:text-blue-200 m-0">
              Comprehensive guides for integrating and implementing the Inspection Report system
              in your applications.
            </p>
          </div>
        </div>

        <div className="doc-section">
          <h2>Getting Started</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="doc-card">
              <h3 className="text-xl font-semibold mb-3">Quick Start</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Get up and running with the basic setup and configuration.
              </p>
              <a href="/docs/guides/quick-start" className="text-blue-600 dark:text-blue-400 hover:underline">
                Learn more →
              </a>
            </div>
            <div className="doc-card">
              <h3 className="text-xl font-semibold mb-3">System Requirements</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Learn about the technical requirements and dependencies.
              </p>
              <a href="/docs/guides/requirements" className="text-blue-600 dark:text-blue-400 hover:underline">
                Learn more →
              </a>
            </div>
          </div>
        </div>

        <div className="doc-section">
          <h2>Core Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="doc-card">
              <h3 className="text-xl font-semibold mb-3">Batch Export Implementation</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Learn how to implement batch export functionality with optimization.
              </p>
              <a href="/docs/guides/batch-export-implementation" className="text-blue-600 dark:text-blue-400 hover:underline">
                View Guide →
              </a>
            </div>
            <div className="doc-card">
              <h3 className="text-xl font-semibold mb-3">Export Optimization</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Best practices for optimizing export performance and quality.
              </p>
              <a href="/docs/guides/optimization" className="text-blue-600 dark:text-blue-400 hover:underline">
                View Guide →
              </a>
            </div>
            <div className="doc-card">
              <h3 className="text-xl font-semibold mb-3">Custom Templates</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Create and customize export templates for different use cases.
              </p>
              <a href="/docs/guides/custom-templates" className="text-blue-600 dark:text-blue-400 hover:underline">
                View Guide →
              </a>
            </div>
          </div>
        </div>

        <div className="doc-section">
          <h2>Advanced Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="doc-card">
              <h3 className="text-xl font-semibold mb-3">Performance Optimization</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Advanced techniques for optimizing performance in large-scale deployments.
              </p>
              <ul className="space-y-2">
                <li>
                  <a href="/docs/guides/caching-strategies" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Caching Strategies
                  </a>
                </li>
                <li>
                  <a href="/docs/guides/memory-management" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Memory Management
                  </a>
                </li>
                <li>
                  <a href="/docs/guides/batch-processing" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Batch Processing
                  </a>
                </li>
              </ul>
            </div>
            <div className="doc-card">
              <h3 className="text-xl font-semibold mb-3">Customization</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Extend and customize the system for specific requirements.
              </p>
              <ul className="space-y-2">
                <li>
                  <a href="/docs/guides/custom-components" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Custom Components
                  </a>
                </li>
                <li>
                  <a href="/docs/guides/theming" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Theming
                  </a>
                </li>
                <li>
                  <a href="/docs/guides/plugins" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Plugin Development
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="doc-section">
          <h2>Troubleshooting</h2>
          <div className="space-y-4">
            <div className="doc-card">
              <h3 className="text-xl font-semibold mb-3">Common Issues</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/docs/guides/troubleshooting/export-errors" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Export Errors
                  </a>
                </li>
                <li>
                  <a href="/docs/guides/troubleshooting/performance" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Performance Issues
                  </a>
                </li>
                <li>
                  <a href="/docs/guides/troubleshooting/integration" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Integration Problems
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="doc-section">
          <h2>Best Practices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="doc-card">
              <h3 className="text-xl font-semibold mb-3">Development</h3>
              <ul className="space-y-2">
                <li>Code organization</li>
                <li>Error handling</li>
                <li>Testing strategies</li>
                <li>Performance optimization</li>
              </ul>
              <a href="/docs/guides/best-practices/development" className="text-blue-600 dark:text-blue-400 hover:underline mt-4 block">
                View Development Guide →
              </a>
            </div>
            <div className="doc-card">
              <h3 className="text-xl font-semibold mb-3">Production</h3>
              <ul className="space-y-2">
                <li>Deployment strategies</li>
                <li>Monitoring and logging</li>
                <li>Resource management</li>
                <li>Security considerations</li>
              </ul>
              <a href="/docs/guides/best-practices/production" className="text-blue-600 dark:text-blue-400 hover:underline mt-4 block">
                View Production Guide →
              </a>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

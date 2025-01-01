import MainLayout from '../layouts/MainLayout'

export default function Home() {
  return (
    <MainLayout>
      <div className="prose prose-lg max-w-none">
        <h1>Inspection Report Documentation</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {/* Getting Started */}
          <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-bold mb-4">Getting Started</h2>
            <p className="text-gray-600 mb-4">
              Learn how to set up and start using the Inspection Report system.
            </p>
            <a href="/docs/getting-started" className="text-blue-600 hover:underline">
              Read more →
            </a>
          </div>

          {/* API Documentation */}
          <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-bold mb-4">API Reference</h2>
            <p className="text-gray-600 mb-4">
              Detailed documentation of all available API endpoints and their usage.
            </p>
            <a href="/docs/api" className="text-blue-600 hover:underline">
              Read more →
            </a>
          </div>

          {/* Components */}
          <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-bold mb-4">Components</h2>
            <p className="text-gray-600 mb-4">
              Explore our library of reusable React components and their implementations.
            </p>
            <a href="/docs/components" className="text-blue-600 hover:underline">
              Read more →
            </a>
          </div>

          {/* Integration Guides */}
          <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-bold mb-4">Integration Guides</h2>
            <p className="text-gray-600 mb-4">
              Step-by-step guides for integrating with various systems and workflows.
            </p>
            <a href="/docs/guides/integration" className="text-blue-600 hover:underline">
              Read more →
            </a>
          </div>

          {/* Best Practices */}
          <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-bold mb-4">Best Practices</h2>
            <p className="text-gray-600 mb-4">
              Learn about recommended patterns and practices for development.
            </p>
            <a href="/docs/guides/best-practices" className="text-blue-600 hover:underline">
              Read more →
            </a>
          </div>

          {/* Examples */}
          <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-bold mb-4">Examples</h2>
            <p className="text-gray-600 mb-4">
              Real-world examples and code snippets to help you get started quickly.
            </p>
            <a href="/docs/examples" className="text-blue-600 hover:underline">
              Read more →
            </a>
          </div>
        </div>

        <div className="mt-12">
          <h2>Latest Updates</h2>
          <ul className="space-y-4">
            <li className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">2024-01-15</span>
              <span className="text-blue-600">New</span>
              <span>Added batch export functionality with optimization features</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">2024-01-10</span>
              <span className="text-green-600">Update</span>
              <span>Improved documentation site with new examples</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">2024-01-05</span>
              <span className="text-purple-600">Enhancement</span>
              <span>Added new API endpoints for report generation</span>
            </li>
          </ul>
        </div>
      </div>
    </MainLayout>
  );
}

import { NextPage } from 'next';

const DocsHome: NextPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Documentation</h1>
      <div className="grid gap-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
          <ul className="space-y-2">
            <li>
              <a href="/docs/getting-started/installation" className="text-blue-600 hover:underline">
                Installation
              </a>
            </li>
            <li>
              <a href="/docs/getting-started/quick-start" className="text-blue-600 hover:underline">
                Quick Start Guide
              </a>
            </li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Core Features</h2>
          <ul className="space-y-2">
            <li>
              <a href="/docs/features/export" className="text-blue-600 hover:underline">
                Export Features
              </a>
            </li>
            <li>
              <a href="/docs/features/optimization" className="text-blue-600 hover:underline">
                Optimization
              </a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default DocsHome;

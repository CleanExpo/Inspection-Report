import { ReactNode } from 'react';
import DocSearch from '../components/DocSearch';
import MobileNav from '../components/MobileNav';
import { MDXProvider } from '../components/MDXProvider';

interface DocsLayoutProps {
  children: ReactNode;
}

const DocsLayout = ({ children }: DocsLayoutProps) => {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 fixed top-0 inset-x-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <MobileNav />
              <h1 className="text-lg font-semibold text-gray-900 ml-2 md:ml-0">
                Inspection Report Docs
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
      {/* Sidebar Navigation */}
      <nav className="w-64 border-r border-gray-200 p-4 hidden md:block">
        <div className="sticky top-4">
          <h3 className="font-semibold mb-4">Documentation</h3>
          <div className="mb-6">
            <DocSearch />
          </div>
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Getting Started</h4>
              <ul className="pl-2 space-y-2 text-sm">
                <li>
                  <a href="/docs/getting-started/installation" className="text-gray-600 hover:text-gray-900">
                    Installation
                  </a>
                </li>
                <li>
                  <a href="/docs/getting-started/quick-start" className="text-gray-600 hover:text-gray-900">
                    Quick Start Guide
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Core Features</h4>
              <ul className="pl-2 space-y-2 text-sm">
                <li>
                  <a href="/docs/features/export" className="text-gray-600 hover:text-gray-900">
                    Export Features
                  </a>
                </li>
                <li>
                  <a href="/docs/features/optimization" className="text-gray-600 hover:text-gray-900">
                    Optimization
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

        {/* Main Content */}
        <main className="flex-1 p-4">
          <MDXProvider>
            {children}
          </MDXProvider>
        </main>
      </div>
    </div>
  );
};

export default DocsLayout;

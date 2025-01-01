import { NextPage } from 'next';
import DocsLayout from '../../../layouts/DocsLayout';
import Breadcrumb from '../../../components/Breadcrumb';

const InstallationGuide: NextPage = () => {
  return (
    <DocsLayout>
      <div className="max-w-3xl mx-auto">
        <Breadcrumb path="/docs/getting-started/installation" />
        <article>
        <h1 className="text-3xl font-bold mb-6">Installation Guide</h1>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Prerequisites</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Node.js 16.x or later</li>
            <li>npm or yarn package manager</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Installation Steps</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-medium mb-2">1. Clone the Repository</h3>
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                <code>git clone https://github.com/your-org/inspection-report.git</code>
              </pre>
            </div>
            
            <div>
              <h3 className="text-xl font-medium mb-2">2. Install Dependencies</h3>
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                <code>cd inspection-report
npm install</code>
              </pre>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-2">3. Configure Environment</h3>
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                <code>cp .env.example .env.local
# Edit .env.local with your configuration</code>
              </pre>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Verification</h2>
          <p className="mb-4">Run the development server to verify your installation:</p>
          <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
            <code>npm run dev</code>
          </pre>
          <p className="mt-4">Visit <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:3000</code> in your browser.</p>
        </section>
        </article>
      </div>
    </DocsLayout>
  );
};

export default InstallationGuide;

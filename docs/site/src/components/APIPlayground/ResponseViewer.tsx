import { useState } from 'react';
import type { APIResponse, RequestError } from '../../types/api';
import { CodeEditor } from '../CodeEditor';

interface ResponseViewerProps {
  response: APIResponse | null;
  error: RequestError | null;
  isLoading?: boolean;
}

type ResponseTab = 'body' | 'headers' | 'timing';

export function ResponseViewer({
  response,
  error,
  isLoading = false
}: ResponseViewerProps) {
  const [activeTab, setActiveTab] = useState<ResponseTab>('body');

  if (isLoading) {
    return (
      <div className="p-4 border rounded dark:border-gray-700">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded dark:bg-gray-700"></div>
              <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-300 rounded bg-red-50 dark:bg-red-900/20 dark:border-red-800">
        <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Error</h3>
        <p className="mt-2 text-red-700 dark:text-red-300">{error.message}</p>
        {error.details && (
          <pre className="mt-2 text-sm text-red-600 dark:text-red-400 overflow-auto">
            {JSON.stringify(error.details, null, 2)}
          </pre>
        )}
      </div>
    );
  }

  if (!response) {
    return (
      <div className="p-4 border rounded dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">
          Send a request to see the response here
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded dark:border-gray-700">
      <div className="p-4 border-b dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <StatusBadge status={response.status} />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {response.statusText}
          </span>
        </div>
      </div>

      <div className="border-b dark:border-gray-700">
        <nav className="flex">
          {(['body', 'headers', 'timing'] as ResponseTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4">
        {activeTab === 'body' && (
          <CodeEditor
            value={typeof response.body === 'string' 
              ? response.body 
              : JSON.stringify(response.body, null, 2)
            }
            language="json"
            readOnly
            height="300px"
          />
        )}

        {activeTab === 'headers' && (
          <div className="space-y-2">
            {Object.entries(response.headers).map(([key, value]) => (
              <div key={key} className="flex">
                <span className="font-medium min-w-[150px]">{key}:</span>
                <span className="text-gray-600 dark:text-gray-400">{value}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'timing' && response.timing && (
          <div className="space-y-2">
            <div className="flex">
              <span className="font-medium min-w-[150px]">Duration:</span>
              <span className="text-gray-600 dark:text-gray-400">
                {Math.round(response.timing.duration)}ms
              </span>
            </div>
            <div className="flex">
              <span className="font-medium min-w-[150px]">Started:</span>
              <span className="text-gray-600 dark:text-gray-400">
                {new Date(response.timing.start).toISOString()}
              </span>
            </div>
            <div className="flex">
              <span className="font-medium min-w-[150px]">Ended:</span>
              <span className="text-gray-600 dark:text-gray-400">
                {new Date(response.timing.end).toISOString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: number }) {
  let color = 'gray';
  if (status >= 200 && status < 300) color = 'green';
  if (status >= 300 && status < 400) color = 'blue';
  if (status >= 400 && status < 500) color = 'yellow';
  if (status >= 500) color = 'red';

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-sm font-medium bg-${color}-100 text-${color}-800 dark:bg-${color}-900/30 dark:text-${color}-300`}>
      {status}
    </span>
  );
}

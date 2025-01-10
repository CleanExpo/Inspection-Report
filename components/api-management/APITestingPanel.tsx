"use client";

import { useState } from 'react';
import { APICredential } from '../../services/apiCredentialService';

interface APITestingPanelProps {
  credentials: APICredential[];
  onTest: (id: string) => Promise<void>;
}

export default function APITestingPanel({ credentials, onTest }: APITestingPanelProps) {
  const [selectedCredential, setSelectedCredential] = useState<string>('');
  const [testResponse, setTestResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTest = async () => {
    if (!selectedCredential) return;

    setIsLoading(true);
    try {
      await onTest(selectedCredential);
      setTestResponse(JSON.stringify({ status: 'success', timestamp: new Date() }, null, 2));
    } catch (error) {
      setTestResponse(JSON.stringify({ status: 'error', message: error }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Credential Selection */}
      <div>
        <label htmlFor="credential" className="block text-sm font-medium text-gray-700">
          Select API Integration
        </label>
        <select
          id="credential"
          value={selectedCredential}
          onChange={(e) => setSelectedCredential(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="">Select an integration</option>
          {credentials.map((cred) => (
            <option key={cred.id} value={cred.id}>
              {cred.name} ({cred.type})
            </option>
          ))}
        </select>
      </div>

      {selectedCredential && (
        <div className="bg-gray-50 rounded-lg p-6">
          {/* Test Results */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Test Results</h3>
            <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-auto max-h-96">
              {testResponse || 'No test results yet. Click "Test Integration" to begin.'}
            </pre>
          </div>

          {/* Test Controls */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={handleTest}
              disabled={isLoading}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Testing...
                </>
              ) : (
                'Test Integration'
              )}
            </button>
          </div>

          {/* Test History */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Test History</h3>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {credentials
                  .find((c) => c.id === selectedCredential)
                  ?.lastTested && (
                  <li className="px-4 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Last Test Run
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(
                            credentials.find((c) => c.id === selectedCredential)
                              ?.lastTested || ''
                          ).toLocaleString()}
                        </p>
                      </div>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          credentials.find((c) => c.id === selectedCredential)
                            ?.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {
                          credentials.find((c) => c.id === selectedCredential)
                            ?.status
                        }
                      </span>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

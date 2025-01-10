"use client";

import { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import APICredentialForm from './APICredentialForm';
import APITestingPanel from './APITestingPanel';
import APIUsageMetrics from './APIUsageMetrics';
import { useAPICredentials } from '../../hooks/useAPICredentials';
import { APICredential, NewAPICredential } from '../../services/apiCredentialService';

interface ErrorNotificationProps {
  message: string;
  onDismiss: () => void;
}

function ErrorNotification({ message, onDismiss }: ErrorNotificationProps) {
  return (
    <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong className="font-bold">Error: </strong>
      <span className="block sm:inline">{message}</span>
      <button 
        className="absolute top-0 right-0 px-4 py-3"
        onClick={onDismiss}
      >
        <span className="sr-only">Dismiss</span>
        <svg className="h-4 w-4 fill-current" role="button" viewBox="0 0 20 20">
          <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
        </svg>
      </button>
    </div>
  );
}

export default function APIIntegrationDashboard() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [localError, setError] = useState<string | null>(null);
  const {
    isLoading,
    error: apiError,
    credentials,
    saveCredential,
    testCredential,
    deleteCredential,
    updateCredentialStatus
  } = useAPICredentials();

  useEffect(() => {
    if (apiError) {
      setError(apiError);
    }
  }, [apiError]);

  const handleDismissError = () => {
    setError(null);
  };

  const handleAddCredential = async (credential: NewAPICredential) => {
    try {
      const result = await saveCredential(credential);
      if (!result) {
        throw new Error('Failed to save credential');
      }
    } catch (err) {
      console.error('Error saving credential:', err);
      setError(err instanceof Error ? err.message : 'Failed to save credential');
    }
  };

  const handleTestCredential = async (id: string) => {
    try {
      const success = await testCredential(id);
      if (!success) {
        throw new Error('API test failed');
      }
    } catch (err) {
      console.error('Error testing credential:', err);
      setError(err instanceof Error ? err.message : 'Failed to test credential');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {(localError || apiError) && (
        <ErrorNotification
          message={localError || apiError || ''}
          onDismiss={handleDismissError}
        />
      )}

      <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
        <Tab.List className="flex space-x-4 border-b border-gray-200 mb-6">
          <Tab
            className={({ selected }) =>
              `px-4 py-2 text-sm font-medium rounded-t-lg focus:outline-none ${
                selected
                  ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            Credentials
          </Tab>
          <Tab
            className={({ selected }) =>
              `px-4 py-2 text-sm font-medium rounded-t-lg focus:outline-none ${
                selected
                  ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            Testing
          </Tab>
          <Tab
            className={({ selected }) =>
              `px-4 py-2 text-sm font-medium rounded-t-lg focus:outline-none ${
                selected
                  ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            Usage & Metrics
          </Tab>
        </Tab.List>

        <Tab.Panels>
          <Tab.Panel>
            <div className="space-y-6">
              <APICredentialForm onSubmit={handleAddCredential} />
              
              {/* Existing Credentials List */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Existing Integrations
                </h3>
                <div className="space-y-4">
                  {credentials.map((cred) => (
                    <div
                      key={cred.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900">{cred.name}</h4>
                        <p className="text-sm text-gray-500">{cred.type}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            cred.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : cred.status === 'error'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {cred.status}
                        </span>
                        <button
                          onClick={() => handleTestCredential(cred.id)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Test
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Tab.Panel>

          <Tab.Panel>
            <APITestingPanel credentials={credentials} onTest={handleTestCredential} />
          </Tab.Panel>

          <Tab.Panel>
            <APIUsageMetrics credentials={credentials} />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}

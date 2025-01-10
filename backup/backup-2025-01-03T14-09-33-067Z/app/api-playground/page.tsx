'use client';

import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { HeadersEditor } from './components/HeadersEditor';
import { JsonViewer } from './components/JsonViewer';
import { RequestHistory } from './components/RequestHistory';
import { SavedRequests } from './components/SavedRequests';
import { EnvironmentManager } from './components/EnvironmentManager';
import { processRequest } from './utils/environment';
import type { Environment, RequestConfig, Response, HistoryEntry, SavedRequest } from './types';

const HISTORY_STORAGE_KEY = 'api_playground_history';
const SAVED_REQUESTS_STORAGE_KEY = 'api_playground_saved_requests';
const ENVIRONMENTS_STORAGE_KEY = 'api_playground_environments';
const ACTIVE_ENVIRONMENT_KEY = 'api_playground_active_environment';

export default function APIPlayground() {
  const [request, setRequest] = useState<RequestConfig>({
    method: 'GET',
    url: '',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const [response, setResponse] = useState<Response | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [savedRequests, setSavedRequests] = useState<SavedRequest[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [activeEnvironment, setActiveEnvironment] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'history' | 'saved' | 'environments'>('history');

  // Load data from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (err) {
        console.error('Failed to load history:', err);
      }
    }

    const savedRequestsData = localStorage.getItem(SAVED_REQUESTS_STORAGE_KEY);
    if (savedRequestsData) {
      try {
        setSavedRequests(JSON.parse(savedRequestsData));
      } catch (err) {
        console.error('Failed to load saved requests:', err);
      }
    }

    const savedEnvironments = localStorage.getItem(ENVIRONMENTS_STORAGE_KEY);
    if (savedEnvironments) {
      try {
        setEnvironments(JSON.parse(savedEnvironments));
      } catch (err) {
        console.error('Failed to load environments:', err);
      }
    }

    const savedActiveEnvironment = localStorage.getItem(ACTIVE_ENVIRONMENT_KEY);
    if (savedActiveEnvironment) {
      setActiveEnvironment(savedActiveEnvironment);
    }
  }, []);

  const saveHistory = (newHistory: HistoryEntry[]) => {
    setHistory(newHistory);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
  };

  const saveSavedRequests = (newSavedRequests: SavedRequest[]) => {
    setSavedRequests(newSavedRequests);
    localStorage.setItem(SAVED_REQUESTS_STORAGE_KEY, JSON.stringify(newSavedRequests));
  };

  const saveEnvironments = (newEnvironments: Environment[]) => {
    setEnvironments(newEnvironments);
    localStorage.setItem(ENVIRONMENTS_STORAGE_KEY, JSON.stringify(newEnvironments));
  };

  const handleMethodChange = (method: RequestConfig['method']) => {
    setRequest(prev => ({ ...prev, method }));
  };

  const handleUrlChange = (url: string) => {
    setRequest(prev => ({ ...prev, url }));
  };

  const handleHeadersChange = (headers: Record<string, string>) => {
    setRequest(prev => ({ ...prev, headers }));
  };

  const handleBodyChange = (body: string) => {
    setRequest(prev => ({ ...prev, body }));
  };

  const handleHistorySelect = (entry: HistoryEntry) => {
    setRequest({
      method: entry.method as RequestConfig['method'],
      url: entry.url,
      headers: entry.headers,
      body: entry.body,
    });
  };

  const handleSavedRequestSelect = (savedRequest: SavedRequest) => {
    setRequest({
      method: savedRequest.method as RequestConfig['method'],
      url: savedRequest.url,
      headers: savedRequest.headers,
      body: savedRequest.body,
    });
  };

  const handleSaveRequest = (name: string) => {
    const newRequest: SavedRequest = {
      id: Date.now().toString(),
      name,
      method: request.method,
      url: request.url,
      headers: request.headers,
      body: request.body,
      createdAt: new Date().toISOString(),
    };
    saveSavedRequests([newRequest, ...savedRequests]);
  };

  const handleDeleteSavedRequest = (id: string) => {
    saveSavedRequests(savedRequests.filter(req => req.id !== id));
  };

  const handleClearHistory = () => {
    saveHistory([]);
  };

  const handleEnvironmentChange = (environmentId: string | null) => {
    setActiveEnvironment(environmentId);
    localStorage.setItem(ACTIVE_ENVIRONMENT_KEY, environmentId || '');
  };

  const handleSaveEnvironment = (environment: Omit<Environment, 'id'>) => {
    const newEnvironment: Environment = {
      ...environment,
      id: Date.now().toString(),
    };
    saveEnvironments([...environments, newEnvironment]);
  };

  const handleUpdateEnvironment = (environment: Environment) => {
    saveEnvironments(
      environments.map(env => (env.id === environment.id ? environment : env))
    );
  };

  const handleDeleteEnvironment = (environmentId: string) => {
    if (activeEnvironment === environmentId) {
      handleEnvironmentChange(null);
    }
    saveEnvironments(environments.filter(env => env.id !== environmentId));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const activeEnv = environments.find(env => env.id === activeEnvironment) || null;
      const processedRequest = processRequest(request, activeEnv);

      const response = await fetch(processedRequest.url, {
        method: request.method,
        headers: processedRequest.headers,
        body: processedRequest.body,
      });

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      const responseBody = await response.text();

      setResponse({
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        body: responseBody,
      });

      // Add to history
      const historyEntry: HistoryEntry = {
        id: Date.now().toString(),
        method: request.method,
        url: request.url,
        timestamp: new Date().toISOString(),
        headers: request.headers,
        body: request.body,
      };

      saveHistory([historyEntry, ...history.slice(0, 9)]); // Keep last 10 entries
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">API Playground</h1>

        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex gap-4">
              <button
                onClick={() => setActiveTab('history')}
                className={`py-2 px-1 ${
                  activeTab === 'history'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                History
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`py-2 px-1 ${
                  activeTab === 'saved'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Saved Requests
              </button>
              <button
                onClick={() => setActiveTab('environments')}
                className={`py-2 px-1 ${
                  activeTab === 'environments'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Environments
              </button>
            </nav>
          </div>

          {activeTab === 'history' && (
            <RequestHistory
              history={history}
              onSelect={handleHistorySelect}
              onClear={handleClearHistory}
            />
          )}

          {activeTab === 'saved' && (
            <SavedRequests
              requests={savedRequests}
              currentRequest={request}
              onSelect={handleSavedRequestSelect}
              onDelete={handleDeleteSavedRequest}
              onSave={handleSaveRequest}
            />
          )}

          {activeTab === 'environments' && (
            <EnvironmentManager
              environments={environments}
              activeEnvironment={activeEnvironment}
              onEnvironmentChange={handleEnvironmentChange}
              onSaveEnvironment={handleSaveEnvironment}
              onUpdateEnvironment={handleUpdateEnvironment}
              onDeleteEnvironment={handleDeleteEnvironment}
            />
          )}
        </div>

        {/* Request Builder */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4 items-center">
            <select
              value={request.method}
              onChange={(e) => handleMethodChange(e.target.value as RequestConfig['method'])}
              className="px-3 py-2 border rounded"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>
            <input
              type="text"
              value={request.url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="Enter URL (use {{variable}} for environment variables)"
              className="flex-1 px-3 py-2 border rounded"
            />
            <button
              onClick={handleSubmit}
              disabled={isLoading || !request.url}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>

          {/* Headers */}
          <div className="border rounded p-4">
            <h2 className="text-lg font-semibold mb-2">Headers</h2>
            <HeadersEditor headers={request.headers} onChange={handleHeadersChange} />
          </div>

          {/* Request Body */}
          <div className="border rounded p-4">
            <h2 className="text-lg font-semibold mb-2">Request Body</h2>
            <textarea
              value={request.body || ''}
              onChange={(e) => handleBodyChange(e.target.value)}
              placeholder="Enter request body (optional, use {{variable}} for environment variables)"
              className="w-full h-32 px-3 py-2 border rounded font-mono"
            />
          </div>
        </div>

        {/* Response Display */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Response</h2>
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
              {error}
            </div>
          )}
          {response && (
            <div className="border rounded">
              {/* Status */}
              <div className="p-4 border-b bg-gray-50">
                <span className="font-semibold">Status: </span>
                <span className={response.status < 400 ? 'text-green-600' : 'text-red-600'}>
                  {response.status} {response.statusText}
                </span>
              </div>

              {/* Headers */}
              <div className="p-4 border-b">
                <h3 className="font-semibold mb-2">Headers:</h3>
                <JsonViewer content={JSON.stringify(response.headers)} />
              </div>

              {/* Body */}
              <div className="p-4">
                <h3 className="font-semibold mb-2">Body:</h3>
                <JsonViewer content={response.body} />
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

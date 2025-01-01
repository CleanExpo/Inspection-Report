import { useState } from 'react';
import type { APIRequest, HTTPMethod } from '../../types/api';
import { CodeEditor } from '../CodeEditor';

interface RequestBuilderProps {
  defaultUrl?: string;
  defaultMethod?: HTTPMethod;
  onSubmit: (request: APIRequest) => void;
  isLoading?: boolean;
}

const HTTP_METHODS: HTTPMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

export function RequestBuilder({
  defaultUrl = '',
  defaultMethod = 'GET',
  onSubmit,
  isLoading = false
}: RequestBuilderProps) {
  const [url, setUrl] = useState(defaultUrl);
  const [method, setMethod] = useState<HTTPMethod>(defaultMethod);
  const [headers, setHeaders] = useState<Record<string, string>>({});
  const [body, setBody] = useState('');
  const [params, setParams] = useState<Record<string, string>>({});

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const request: APIRequest = {
      url,
      method,
      headers,
      params,
      ...(method !== 'GET' && body ? { body: JSON.parse(body) } : {})
    };

    onSubmit(request);
  };

  // Handle adding a new header
  const handleAddHeader = () => {
    setHeaders(prev => ({
      ...prev,
      '': ''
    }));
  };

  // Handle updating a header
  const handleHeaderChange = (key: string, newKey: string, value: string) => {
    setHeaders(prev => {
      const { [key]: _, ...rest } = prev;
      return {
        ...rest,
        [newKey]: value
      };
    });
  };

  // Handle removing a header
  const handleRemoveHeader = (key: string) => {
    setHeaders(prev => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex space-x-2">
        <select
          value={method}
          onChange={e => setMethod(e.target.value as HTTPMethod)}
          className="px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700"
        >
          {HTTP_METHODS.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <input
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="Enter request URL"
          required
          className="flex-1 px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Headers</h3>
          <button
            type="button"
            onClick={handleAddHeader}
            className="px-2 py-1 text-sm bg-gray-100 rounded dark:bg-gray-700"
          >
            Add Header
          </button>
        </div>
        {Object.entries(headers).map(([key, value]) => (
          <div key={key} className="flex space-x-2">
            <input
              type="text"
              value={key}
              onChange={e => handleHeaderChange(key, e.target.value, value)}
              placeholder="Header name"
              className="flex-1 px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700"
            />
            <input
              type="text"
              value={value}
              onChange={e => handleHeaderChange(key, key, e.target.value)}
              placeholder="Header value"
              className="flex-1 px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700"
            />
            <button
              type="button"
              onClick={() => handleRemoveHeader(key)}
              className="px-2 py-1 text-red-500 hover:text-red-600"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {method !== 'GET' && (
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Request Body</h3>
          <CodeEditor
            value={body}
            onChange={setBody}
            language="json"
            height="200px"
          />
        </div>
      )}
    </form>
  );
}

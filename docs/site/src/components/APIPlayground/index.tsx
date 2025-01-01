import { useState } from 'react';
import type { APIRequest, APIResponse, HTTPMethod, RequestError } from '../../types/api';
import { RequestBuilder } from './RequestBuilder';
import { ResponseViewer } from './ResponseViewer';

interface APIPlaygroundProps {
  defaultUrl?: string;
  defaultMethod?: HTTPMethod;
  className?: string;
}

export function APIPlayground({
  defaultUrl = '',
  defaultMethod = 'GET',
  className = ''
}: APIPlaygroundProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<APIResponse | null>(null);
  const [error, setError] = useState<RequestError | null>(null);

  const handleRequest = async (request: APIRequest) => {
    setIsLoading(true);
    setError(null);

    const startTime = performance.now();

    try {
      // Build query string from params
      const url = new URL(request.url);
      if (request.params) {
        Object.entries(request.params).forEach(([key, value]) => {
          url.searchParams.append(key, value);
        });
      }

      // Make the request
      const fetchResponse = await fetch(url.toString(), {
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
          ...request.headers
        },
        body: request.body ? JSON.stringify(request.body) : undefined
      });

      const endTime = performance.now();

      // Parse response headers
      const headers: Record<string, string> = {};
      fetchResponse.headers.forEach((value, key) => {
        headers[key] = value;
      });

      // Parse response body based on content type
      let body;
      const contentType = fetchResponse.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        body = await fetchResponse.json();
      } else if (contentType?.includes('text/')) {
        body = await fetchResponse.text();
      } else {
        body = await fetchResponse.blob();
      }

      // Build response object
      const apiResponse: APIResponse = {
        status: fetchResponse.status,
        statusText: fetchResponse.statusText,
        headers,
        body,
        timing: {
          start: startTime,
          end: endTime,
          duration: endTime - startTime
        }
      };

      setResponse(apiResponse);
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'An unknown error occurred',
        details: err
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col space-y-4 ${className}`}>
      <RequestBuilder
        defaultUrl={defaultUrl}
        defaultMethod={defaultMethod}
        onSubmit={handleRequest}
        isLoading={isLoading}
      />
      <ResponseViewer
        response={response}
        error={error}
        isLoading={isLoading}
      />
    </div>
  );
}

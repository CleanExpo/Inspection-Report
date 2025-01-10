'use client';

import React from 'react';

interface HistoryEntry {
  id: string;
  method: string;
  url: string;
  timestamp: string;
  headers: Record<string, string>;
  body?: string;
}

interface RequestHistoryProps {
  history: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onClear: () => void;
}

const getMethodColor = (method: string) => {
  switch (method.toUpperCase()) {
    case 'GET':
      return 'bg-blue-100 text-blue-800';
    case 'POST':
      return 'bg-green-100 text-green-800';
    case 'PUT':
      return 'bg-yellow-100 text-yellow-800';
    case 'DELETE':
      return 'bg-red-100 text-red-800';
    case 'PATCH':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function RequestHistory({ history, onSelect, onClear }: RequestHistoryProps) {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Recent Requests</h2>
        <button
          onClick={onClear}
          className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
        >
          Clear History
        </button>
      </div>
      <div className="space-y-2">
        {history.map((entry) => (
          <div
            key={entry.id}
            className="p-3 border rounded hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => onSelect(entry)}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getMethodColor(entry.method)}`}>
                  {entry.method}
                </span>
                <span className="text-gray-800 font-mono text-sm">{entry.url}</span>
              </div>
              <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                {new Date(entry.timestamp).toLocaleTimeString()}
              </span>
            </div>
            {entry.body && (
              <div className="mt-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="font-medium">Headers:</span>
                  <span className="font-mono">
                    {Object.keys(entry.headers).length} headers
                  </span>
                </div>
                <pre className="mt-1 text-xs text-gray-600 font-mono bg-gray-50 p-2 rounded overflow-x-auto">
                  {entry.body.length > 150 ? `${entry.body.slice(0, 150)}...` : entry.body}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

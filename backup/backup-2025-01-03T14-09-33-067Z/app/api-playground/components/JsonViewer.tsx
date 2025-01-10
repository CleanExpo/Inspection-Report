'use client';

import React from 'react';

interface JsonViewerProps {
  content: string;
}

export function JsonViewer({ content }: JsonViewerProps) {
  const formatJson = (jsonString: string): string => {
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return jsonString;
    }
  };

  return (
    <pre className="bg-gray-50 p-2 rounded font-mono text-sm overflow-auto max-h-96">
      {formatJson(content)}
    </pre>
  );
}

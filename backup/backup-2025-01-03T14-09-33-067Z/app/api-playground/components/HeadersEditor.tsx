'use client';

import React, { useState } from 'react';

interface HeadersEditorProps {
  headers: Record<string, string>;
  onChange: (headers: Record<string, string>) => void;
}

interface HeaderEntry {
  key: string;
  value: string;
}

export function HeadersEditor({ headers, onChange }: HeadersEditorProps) {
  const [entries, setEntries] = useState<HeaderEntry[]>(
    Object.entries(headers).map(([key, value]) => ({ key, value }))
  );

  const handleAdd = () => {
    setEntries([...entries, { key: '', value: '' }]);
  };

  const handleRemove = (index: number) => {
    const newEntries = entries.filter((_, i) => i !== index);
    setEntries(newEntries);
    updateHeaders(newEntries);
  };

  const handleChange = (index: number, field: 'key' | 'value', value: string) => {
    const newEntries = entries.map((entry, i) => {
      if (i === index) {
        return { ...entry, [field]: value };
      }
      return entry;
    });
    setEntries(newEntries);
    updateHeaders(newEntries);
  };

  const updateHeaders = (entries: HeaderEntry[]) => {
    const newHeaders: Record<string, string> = {};
    entries.forEach(({ key, value }) => {
      if (key && value) {
        newHeaders[key] = value;
      }
    });
    onChange(newHeaders);
  };

  return (
    <div className="space-y-2">
      {entries.map((entry, index) => (
        <div key={index} className="flex gap-2">
          <input
            type="text"
            value={entry.key}
            onChange={(e) => handleChange(index, 'key', e.target.value)}
            placeholder="Header name"
            className="flex-1 px-3 py-2 border rounded"
          />
          <input
            type="text"
            value={entry.value}
            onChange={(e) => handleChange(index, 'value', e.target.value)}
            placeholder="Value"
            className="flex-1 px-3 py-2 border rounded"
          />
          <button
            onClick={() => handleRemove(index)}
            className="px-3 py-2 text-red-600 hover:text-red-800"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        onClick={handleAdd}
        className="px-4 py-2 text-blue-600 hover:text-blue-800"
      >
        + Add Header
      </button>
    </div>
  );
}

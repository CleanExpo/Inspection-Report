'use client';

import React, { useState } from 'react';

interface SavedRequest {
  id: string;
  name: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
  createdAt: string;
}

interface SavedRequestsProps {
  onSelect: (request: SavedRequest) => void;
  onDelete: (id: string) => void;
  onSave: (name: string) => void;
  requests: SavedRequest[];
  currentRequest: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: string;
  };
}

export function SavedRequests({
  requests,
  currentRequest,
  onSelect,
  onDelete,
  onSave,
}: SavedRequestsProps) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newRequestName, setNewRequestName] = useState('');

  const handleSave = () => {
    if (newRequestName.trim()) {
      onSave(newRequestName.trim());
      setNewRequestName('');
      setIsAddingNew(false);
    }
  };

  const handleCancel = () => {
    setNewRequestName('');
    setIsAddingNew(false);
  };

  if (requests.length === 0 && !isAddingNew) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">No saved requests</p>
        <button
          onClick={() => setIsAddingNew(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Save Current Request
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!isAddingNew && (
        <div className="flex justify-end">
          <button
            onClick={() => setIsAddingNew(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={!currentRequest.url}
          >
            Save Current Request
          </button>
        </div>
      )}

      {isAddingNew && (
        <div className="border rounded p-4 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Save Request</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="requestName" className="block text-sm font-medium text-gray-700 mb-1">
                Request Name
              </label>
              <input
                type="text"
                id="requestName"
                value={newRequestName}
                onChange={(e) => setNewRequestName(e.target.value)}
                placeholder="Enter a name for this request"
                className="w-full px-3 py-2 border rounded"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!newRequestName.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {requests.map((request) => (
          <div
            key={request.id}
            className="border rounded p-4 hover:bg-gray-50"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="font-medium">{request.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                    {request.method}
                  </span>
                  <span className="text-sm text-gray-600 font-mono truncate">
                    {request.url}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  Saved {new Date(request.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onSelect(request)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Load
                </button>
                <button
                  onClick={() => onDelete(request.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

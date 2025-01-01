'use client';

import { useState } from 'react';

interface Measurement {
  id: string;
  type: 'distance' | 'area';
  value: number;
  timestamp: Date;
  label?: string;
}

interface MeasurementHistoryProps {
  measurements: Measurement[];
  onDelete: (id: string) => void;
  onLabelChange: (id: string, label: string) => void;
}

export default function MeasurementHistory({
  measurements,
  onDelete,
  onLabelChange
}: MeasurementHistoryProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');

  const handleEditStart = (measurement: Measurement) => {
    setEditingId(measurement.id);
    setEditLabel(measurement.label || '');
  };

  const handleEditSave = () => {
    if (editingId) {
      onLabelChange(editingId, editLabel);
      setEditingId(null);
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditLabel('');
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatValue = (measurement: Measurement) => {
    const value = measurement.value.toFixed(2);
    return measurement.type === 'area' ? `${value} m²` : `${value} m`;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Measurement History</h3>
      </div>

      <div className="divide-y divide-gray-200">
        {measurements.length === 0 ? (
          <div className="px-4 py-3 text-gray-500 text-center">
            No measurements recorded
          </div>
        ) : (
          measurements.map((measurement) => (
            <div
              key={measurement.id}
              className="px-4 py-3 flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    measurement.type === 'area'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {measurement.type === 'area' ? 'Area' : 'Distance'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatTimestamp(measurement.timestamp)}
                  </span>
                </div>

                <div className="mt-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      {formatValue(measurement)}
                    </span>
                    {editingId === measurement.id ? (
                      <div className="flex-1 flex items-center space-x-2">
                        <input
                          type="text"
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          className="flex-1 min-w-0 block w-full px-3 py-1 text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Add label"
                          autoFocus
                        />
                        <button
                          onClick={handleEditSave}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleEditCancel}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditStart(measurement)}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        {measurement.label || 'Add label'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0">
                <button
                  onClick={() => onDelete(measurement.id)}
                  className="inline-flex items-center p-1 border border-transparent rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

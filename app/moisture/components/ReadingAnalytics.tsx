'use client';

import { useState, useEffect } from 'react';
import { MoistureUnit } from '@prisma/client';
import { analyzeReadings, exportReadings, generateTimeSeries } from '../utils/readingAnalysis';

interface ReadingDataPoint {
  id: string;
  readingId: string;
  value: number;
  unit: MoistureUnit;
  timestamp: string;
  depth?: number;
}

interface MoistureReading {
  id: string;
  jobId: string;
  locationX: number;
  locationY: number;
  room: string;
  floor: number;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  equipmentId: string;
  temperature?: number | null;
  humidity?: number | null;
  pressure?: number | null;
  dataPoints: ReadingDataPoint[];
}

interface ReadingAnalyticsProps {
  jobId: string;
}

export default function ReadingAnalytics({ jobId }: ReadingAnalyticsProps) {
  const [readings, setReadings] = useState<MoistureReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [selectedFloor, setSelectedFloor] = useState<number | ''>('');

  useEffect(() => {
    fetchReadings();
  }, [jobId]);

  const fetchReadings = async () => {
    try {
      const response = await fetch(`/api/moisture/readings?jobId=${jobId}`);
      if (!response.ok) throw new Error('Failed to fetch readings');
      const data = await response.json();
      setReadings(data.readings);
    } catch (err) {
      setError('Failed to load readings');
      console.error('Readings fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: 'csv' | 'json') => {
    const filteredReadings = filterReadings(readings);
    const exportData = exportReadings(filteredReadings);
    
    // Create and trigger download
    const blob = new Blob(
      [format === 'csv' ? exportData.csv : exportData.json],
      { type: format === 'csv' ? 'text/csv' : 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moisture-readings-${jobId}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filterReadings = (readings: MoistureReading[]) => {
    return readings.filter(reading => 
      (!selectedRoom || reading.room === selectedRoom) &&
      (selectedFloor === '' || reading.floor === selectedFloor)
    );
  };

  const getUniqueRooms = () => {
    return Array.from(new Set(readings.map(r => r.room)));
  };

  const getUniqueFloors = () => {
    return Array.from(new Set(readings.map(r => r.floor)));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
        {error}
      </div>
    );
  }

  const filteredReadings = filterReadings(readings);
  const analysis = analyzeReadings(filteredReadings);
  const timeSeries = generateTimeSeries(filteredReadings);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Room
          </label>
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">All Rooms</option>
            {getUniqueRooms().map(room => (
              <option key={room} value={room}>{room}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Floor
          </label>
          <select
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value ? Number(e.target.value) : '')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">All Floors</option>
            {getUniqueFloors().map(floor => (
              <option key={floor} value={floor}>{floor}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Average</h3>
          <p className="mt-1 text-3xl font-semibold text-gray-900">
            {analysis.average.toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Range</h3>
          <p className="mt-1 text-3xl font-semibold text-gray-900">
            {analysis.min.toFixed(2)} - {analysis.max.toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Trend</h3>
          <p className="mt-1 text-3xl font-semibold text-gray-900">
            {analysis.trend.charAt(0).toUpperCase() + analysis.trend.slice(1)}
          </p>
          <p className="text-sm text-gray-500">
            {Math.abs(analysis.changeRate).toFixed(2)}% per day
          </p>
        </div>
      </div>

      {/* Time Series Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Reading History</h3>
          <div className="space-x-2">
            <button
              onClick={() => handleExport('csv')}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Export CSV
            </button>
            <button
              onClick={() => handleExport('json')}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Export JSON
            </button>
          </div>
        </div>
        <div className="border-t border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Floor
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {timeSeries.map((reading, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(reading.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reading.value.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reading.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {selectedRoom || 'All Rooms'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {selectedFloor || 'All Floors'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

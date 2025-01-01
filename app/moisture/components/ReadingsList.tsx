'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface DataPoint {
  id: string;
  value: number;
  unit: string;
  timestamp: string;
  depth?: number;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface MoistureReading {
  id: string;
  jobId: string;
  locationX: number;
  locationY: number;
  room: string;
  floor: number;
  notes?: string;
  createdAt: string;
  dataPoints: DataPoint[];
  equipment: {
    id: string;
    model: string;
    serialNumber: string;
  };
  temperature?: number;
  humidity?: number;
  pressure?: number;
}

export default function ReadingsList({ jobId }: { jobId: string }) {
  const [readings, setReadings] = useState<MoistureReading[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();
  const [sortField, setSortField] = useState<keyof MoistureReading>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState({
    room: '',
    floor: '',
  });

  const fetchReadings = useCallback(async () => {
    let isMounted = true;
    setLoading(true);
    
    try {
      let url = `/api/moisture/readings?jobId=${jobId}&page=${pagination.page}&limit=${pagination.limit}&sortField=${sortField}&sortDirection=${sortDirection}`;
      if (filters.room) url += `&room=${encodeURIComponent(filters.room)}`;
      if (filters.floor) url += `&floor=${filters.floor}`;
      
      const response = await fetch(url);
      if (!isMounted) return;
      if (!response.ok) throw new Error('Failed to fetch readings');
      const data = await response.json();
      
      // Validate response structure
      if (!data || !Array.isArray(data.readings)) {
        throw new Error('Invalid response format');
      }

      setReadings(data.readings);
      
      // Safely update pagination with fallback values
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total ?? prev.total,
        totalPages: data.pagination?.totalPages ?? prev.totalPages
      }));
    } catch (err) {
      setError('Failed to load readings');
      console.error('Readings fetch error:', err);
    } finally {
      setLoading(false);
    }
    
    return () => {
      isMounted = false;
    };
  }, [jobId, filters.room, filters.floor, pagination.page, pagination.limit, sortField, sortDirection]);

  // Initial fetch and refetch on filter/sort changes
  useEffect(() => {
    fetchReadings();
  }, [fetchReadings]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-500">Loading readings...</div>
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

  if (readings.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded">
        <p className="text-gray-600">No readings found for this job.</p>
      </div>
    );
  }

  const handleSort = (field: keyof MoistureReading) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this reading? This action cannot be undone.')) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/moisture/readings?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete reading');
      }

      // Remove the reading from the local state
      setReadings(prev => prev.filter(reading => reading.id !== id));
      router.refresh();
    } catch (err) {
      setError('Failed to delete reading');
      console.error('Delete error:', err);
    } finally {
      setDeletingId(null);
    }
  }, [router]);

  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    // Reset to first page when filters change
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
  }, []);

  // Debounce filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only fetch if filters have actually changed
      if (filters.room !== '' || filters.floor !== '') {
        setPagination(prev => ({ ...prev, page: 1 }));
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [filters]);

  // No need for local sorting since server handles it
  const sortedReadings = readings;

  const SortIcon = ({ field }: { field: keyof MoistureReading }) => {
    if (sortField !== field) return null;
    return (
      <span className="ml-1">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Room Filter
          </label>
          <input
            type="text"
            name="room"
            value={filters.room}
            onChange={handleFilterChange}
            placeholder="Filter by room..."
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Floor Filter
          </label>
          <input
            type="number"
            name="floor"
            value={filters.floor}
            onChange={handleFilterChange}
            placeholder="Filter by floor..."
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Pagination Info */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          Showing {readings.length} of {pagination.total} readings
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(1)}
            disabled={pagination.page === 1}
            className={`px-3 py-1 rounded ${
              pagination.page === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            First
          </button>
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className={`px-3 py-1 rounded ${
              pagination.page === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Previous
          </button>
          <span className="px-3 py-1">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className={`px-3 py-1 rounded ${
              pagination.page === pagination.totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Next
          </button>
          <button
            onClick={() => handlePageChange(pagination.totalPages)}
            disabled={pagination.page === pagination.totalPages}
            className={`px-3 py-1 rounded ${
              pagination.page === pagination.totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Last
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('locationX')}
              >
                Location
                <SortIcon field="locationX" />
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('room')}
              >
                Room
                <SortIcon field="room" />
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('floor')}
              >
                Floor
                <SortIcon field="floor" />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data Points
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('createdAt')}
              >
                Date
                <SortIcon field="createdAt" />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Equipment
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Environmental Data
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notes
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
          {sortedReadings.map((reading) => (
            <tr key={reading.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                ({reading.locationX}, {reading.locationY})
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {reading.room}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {reading.floor}
              </td>
              <td className="px-6 py-4 text-sm">
                <div className="space-y-1">
                  {reading.dataPoints.map((point, index) => (
                    <div key={point.id} className="text-gray-600">
                      {point.value} {point.unit}
                      {point.depth && ` @ ${point.depth}mm`}
                    </div>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {format(new Date(reading.createdAt), 'MMM d, yyyy HH:mm')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {reading.equipment.model} - {reading.equipment.serialNumber}
              </td>
              <td className="px-6 py-4 text-sm">
                <div className="space-y-1">
                  {reading.temperature && (
                    <div>Temp: {reading.temperature.toFixed(1)}°C</div>
                  )}
                  {reading.humidity && (
                    <div>RH: {reading.humidity.toFixed(1)}%</div>
                  )}
                  {reading.pressure && (
                    <div>Pressure: {reading.pressure.toFixed(1)} hPa</div>
                  )}
                  {!reading.temperature && !reading.humidity && !reading.pressure && '-'}
                </div>
              </td>
              <td className="px-6 py-4 text-sm">
                {reading.notes || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  onClick={() => handleDelete(reading.id)}
                  disabled={deletingId === reading.id}
                  className={`text-red-600 hover:text-red-900 ${
                    deletingId === reading.id ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {deletingId === reading.id ? 'Deleting...' : 'Delete'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </div>
  );
}

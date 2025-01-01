import { useState, useEffect } from 'react';
import { Equipment, EquipmentType, EquipmentStatus } from '@prisma/client';
import { format, isBefore } from 'date-fns';

interface EquipmentListProps {
  onEdit: (equipment: Equipment) => void;
}

interface EquipmentWithCount extends Equipment {
  readingsCount: number;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function EquipmentList({ onEdit }: EquipmentListProps) {
  const [equipment, setEquipment] = useState<EquipmentWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });
  const [filters, setFilters] = useState({
    status: '',
    type: ''
  });

  const fetchEquipment = async () => {
    try {
      let url = `/api/moisture/equipment?page=${pagination.page}&limit=${pagination.limit}`;
      if (filters.status) url += `&status=${filters.status}`;
      if (filters.type) url += `&type=${filters.type}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch equipment');
      
      const data = await response.json();
      setEquipment(data.equipment);
      setPagination(data.pagination);
    } catch (err) {
      setError('Failed to load equipment');
      console.error('Equipment fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, [pagination.page, filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getStatusColor = (status: EquipmentStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'MAINTENANCE':
        return 'bg-yellow-100 text-yellow-800';
      case 'RETIRED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCalibrationStatus = (nextCalibrationDue: Date) => {
    const today = new Date();
    const dueDate = new Date(nextCalibrationDue);
    const isOverdue = isBefore(dueDate, today);

    return {
      color: isOverdue ? 'text-red-600' : 'text-gray-600',
      text: isOverdue ? 'Overdue' : 'Up to date'
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-500">Loading equipment...</div>
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

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status Filter
          </label>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            {Object.values(EquipmentStatus).map(status => (
              <option key={status} value={status}>
                {status.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type Filter
          </label>
          <select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            {Object.values(EquipmentType).map(type => (
              <option key={type} value={type}>
                {type.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Equipment List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {equipment.map((eq) => (
            <li key={eq.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-900">
                      {eq.model} - {eq.serialNumber}
                    </div>
                    <div className="ml-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(eq.status)}`}>
                        {eq.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-3 text-sm text-gray-500">
                    <div>
                      Type: {eq.type.replace('_', ' ')}
                    </div>
                    <div>
                      Readings: {eq.readingsCount}
                    </div>
                    <div>
                      Last Used: {eq.lastUsed ? format(new Date(eq.lastUsed), 'MMM d, yyyy') : 'Never'}
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 text-sm">
                    <div>
                      Calibrated: {format(new Date(eq.calibrationDate), 'MMM d, yyyy')}
                    </div>
                    <div className={getCalibrationStatus(eq.nextCalibrationDue).color}>
                      Next Due: {format(new Date(eq.nextCalibrationDue), 'MMM d, yyyy')}
                      {' '}
                      ({getCalibrationStatus(eq.nextCalibrationDue).text})
                    </div>
                  </div>
                </div>
                <div className="ml-4">
                  <button
                    onClick={() => onEdit(eq)}
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-700">
          Showing {equipment.length} of {pagination.total} equipment
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: 1 }))}
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
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
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
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
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
            onClick={() => setPagination(prev => ({ ...prev, page: prev.totalPages }))}
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
    </div>
  );
}

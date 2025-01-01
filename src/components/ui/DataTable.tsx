import React, { useState, useMemo } from 'react';
import { BaseProps } from '../../types/ui';

interface Column<T> {
  /**
   * Unique identifier for the column
   */
  id: string;

  /**
   * Header content for the column
   */
  header: React.ReactNode;

  /**
   * Function to get cell content from row data
   */
  accessor: (row: T) => React.ReactNode;

  /**
   * Whether the column is sortable
   */
  sortable?: boolean;

  /**
   * Whether the column is filterable
   */
  filterable?: boolean;

  /**
   * Width of the column
   */
  width?: number | string;

  /**
   * Text alignment for the column
   */
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> extends BaseProps {
  /**
   * Column definitions
   */
  columns: Column<T>[];

  /**
   * Data to display
   */
  data: T[];

  /**
   * Whether to show row selection
   */
  selectable?: boolean;

  /**
   * Selected row IDs
   */
  selected?: string[];

  /**
   * Callback when selection changes
   */
  onSelectionChange?: (selected: string[]) => void;

  /**
   * Function to get unique ID from row data
   */
  getRowId?: (row: T) => string;

  /**
   * Whether to show pagination
   */
  pagination?: boolean;

  /**
   * Number of rows per page
   */
  pageSize?: number;

  /**
   * Whether to show sorting controls
   */
  sortable?: boolean;

  /**
   * Whether to show filtering controls
   */
  filterable?: boolean;

  /**
   * Whether to show loading state
   */
  loading?: boolean;

  /**
   * Text to show when there is no data
   */
  emptyText?: string;

  /**
   * Whether to show borders between rows
   */
  bordered?: boolean;

  /**
   * Whether to show striped rows
   */
  striped?: boolean;

  /**
   * Whether rows are hoverable
   */
  hoverable?: boolean;

  /**
   * The size of the table
   */
  size?: 'sm' | 'md' | 'lg';
}

const DataTable = <T extends object>({
  columns,
  data,
  selectable = false,
  selected = [],
  onSelectionChange,
  getRowId = (row: any) => row.id,
  pagination = true,
  pageSize = 10,
  sortable = true,
  filterable = true,
  loading = false,
  emptyText = 'No data available',
  bordered = true,
  striped = true,
  hoverable = true,
  size = 'md',
  className = '',
  ...props
}: DataTableProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<Record<string, string>>({});

  const sizes = {
    sm: 'text-sm p-2',
    md: 'text-base p-3',
    lg: 'text-lg p-4',
  };

  // Apply sorting
  const sortedData = useMemo(() => {
    if (!sortColumn) return data;

    return [...data].sort((a: any, b: any) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortColumn, sortDirection]);

  // Apply filtering
  const filteredData = useMemo(() => {
    return sortedData.filter(row => {
      return Object.entries(filters).every(([key, value]) => {
        const cellValue = String(row[key as keyof T]).toLowerCase();
        return cellValue.includes(value.toLowerCase());
      });
    });
  }, [sortedData, filters]);

  // Apply pagination
  const paginatedData = useMemo(() => {
    if (!pagination) return filteredData;

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredData.slice(start, end);
  }, [filteredData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };

  const handleFilter = (columnId: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [columnId]: value,
    }));
    setCurrentPage(1);
  };

  const handleSelectAll = (checked: boolean) => {
    const newSelected = checked
      ? paginatedData.map(row => getRowId(row))
      : [];
    onSelectionChange?.(newSelected);
  };

  const handleSelectRow = (rowId: string) => {
    const newSelected = selected.includes(rowId)
      ? selected.filter(id => id !== rowId)
      : [...selected, rowId];
    onSelectionChange?.(newSelected);
  };

  const renderHeader = (column: Column<T>) => {
    return (
      <th
        key={column.id}
        className={`
          ${sizes[size]}
          font-semibold
          text-gray-900
          ${column.align ? `text-${column.align}` : 'text-left'}
          ${column.sortable !== false && sortable ? 'cursor-pointer hover:bg-gray-50' : ''}
        `}
        style={{ width: column.width }}
        onClick={() => column.sortable !== false && sortable && handleSort(column.id)}
      >
        <div className="flex items-center space-x-2">
          <span>{column.header}</span>
          {column.sortable !== false && sortable && sortColumn === column.id && (
            <svg
              className={`w-4 h-4 transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          )}
        </div>
        {column.filterable !== false && filterable && (
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm"
            placeholder={`Filter ${column.header}`}
            value={filters[column.id] || ''}
            onChange={(e) => handleFilter(column.id, e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </th>
    );
  };

  return (
    <div className={`overflow-x-auto ${className}`} {...props}>
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            {selectable && (
              <th className={sizes[size]}>
                <input
                  type="checkbox"
                  checked={selected.length === paginatedData.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </th>
            )}
            {columns.map(renderHeader)}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td
                colSpan={selectable ? columns.length + 1 : columns.length}
                className="text-center py-8"
              >
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
                </div>
              </td>
            </tr>
          ) : paginatedData.length === 0 ? (
            <tr>
              <td
                colSpan={selectable ? columns.length + 1 : columns.length}
                className="text-center py-8 text-gray-500"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            paginatedData.map((row, rowIndex) => (
              <tr
                key={getRowId(row)}
                className={`
                  ${striped && rowIndex % 2 === 1 ? 'bg-gray-50' : ''}
                  ${hoverable ? 'hover:bg-gray-100' : ''}
                  ${bordered ? 'border-b border-gray-200' : ''}
                `}
              >
                {selectable && (
                  <td className={sizes[size]}>
                    <input
                      type="checkbox"
                      checked={selected.includes(getRowId(row))}
                      onChange={() => handleSelectRow(getRowId(row))}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                )}
                {columns.map(column => (
                  <td
                    key={column.id}
                    className={`
                      ${sizes[size]}
                      ${column.align ? `text-${column.align}` : ''}
                    `}
                  >
                    {column.accessor(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} results
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;

/**
 * DataTable Component Usage Guide:
 * 
 * 1. Basic table:
 *    <DataTable
 *      columns={[
 *        { id: 'name', header: 'Name', accessor: row => row.name },
 *        { id: 'age', header: 'Age', accessor: row => row.age },
 *      ]}
 *      data={data}
 *    />
 * 
 * 2. With selection:
 *    <DataTable
 *      selectable
 *      selected={selectedRows}
 *      onSelectionChange={setSelectedRows}
 *      columns={columns}
 *      data={data}
 *    />
 * 
 * 3. Custom column width and alignment:
 *    <DataTable
 *      columns={[
 *        { id: 'name', header: 'Name', accessor: row => row.name, width: 200 },
 *        { id: 'age', header: 'Age', accessor: row => row.age, align: 'center' },
 *      ]}
 *      data={data}
 *    />
 * 
 * 4. Without pagination:
 *    <DataTable
 *      pagination={false}
 *      columns={columns}
 *      data={data}
 *    />
 * 
 * 5. Custom page size:
 *    <DataTable
 *      pageSize={20}
 *      columns={columns}
 *      data={data}
 *    />
 * 
 * 6. Without sorting:
 *    <DataTable
 *      sortable={false}
 *      columns={columns}
 *      data={data}
 *    />
 * 
 * 7. Without filtering:
 *    <DataTable
 *      filterable={false}
 *      columns={columns}
 *      data={data}
 *    />
 * 
 * 8. Loading state:
 *    <DataTable
 *      loading
 *      columns={columns}
 *      data={data}
 *    />
 * 
 * 9. Custom empty text:
 *    <DataTable
 *      emptyText="No results found"
 *      columns={columns}
 *      data={data}
 *    />
 * 
 * 10. Different sizes:
 *     <DataTable size="sm" />
 *     <DataTable size="md" />
 *     <DataTable size="lg" />
 * 
 * Notes:
 * - Sortable columns
 * - Filterable columns
 * - Row selection
 * - Pagination
 * - Loading state
 * - Empty state
 * - Different sizes
 * - Custom styling
 * - Accessible
 */

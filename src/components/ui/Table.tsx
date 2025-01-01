import React from 'react';
import { BaseProps } from '../../types/ui';

interface Column<T> {
  key: string;
  header: React.ReactNode;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string | number;
}

interface TableProps<T> extends BaseProps {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string | number;
  sortable?: boolean;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  selectable?: boolean;
  selectedRows?: (string | number)[];
  onSelectRow?: (id: string | number) => void;
  onSelectAll?: () => void;
  loading?: boolean;
  emptyMessage?: string;
  stickyHeader?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  compact?: boolean;
  bordered?: boolean;
}

function Table<T extends Record<string, any>>({
  data,
  columns,
  keyExtractor,
  sortable = false,
  sortColumn,
  sortDirection = 'asc',
  onSort,
  selectable = false,
  selectedRows = [],
  onSelectRow,
  onSelectAll,
  loading = false,
  emptyMessage = 'No data available',
  stickyHeader = false,
  striped = false,
  hoverable = true,
  compact = false,
  bordered = false,
  className = '',
}: TableProps<T>) {
  const handleSort = (column: Column<T>) => {
    if (sortable && column.sortable && onSort) {
      onSort(column.key);
    }
  };

  const renderSortIcon = (column: Column<T>) => {
    if (!sortable || !column.sortable) return null;

    return (
      <span className="ml-2 inline-flex flex-col">
        <svg
          className={`w-2 h-2 ${
            sortColumn === column.key && sortDirection === 'asc'
              ? 'text-primary'
              : 'text-gray-400'
          }`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 5l7 7H5z" />
        </svg>
        <svg
          className={`w-2 h-2 ${
            sortColumn === column.key && sortDirection === 'desc'
              ? 'text-primary'
              : 'text-gray-400'
          }`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 19l7-7H5z" />
        </svg>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="text-center p-8 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className={`
        min-w-full divide-y divide-gray-200
        ${bordered ? 'border border-gray-200' : ''}
      `}>
        <thead className={`bg-gray-50 ${stickyHeader ? 'sticky top-0' : ''}`}>
          <tr>
            {selectable && (
              <th scope="col" className="relative w-12 px-6 py-3">
                <input
                  type="checkbox"
                  className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  checked={selectedRows.length === data.length}
                  onChange={onSelectAll}
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`
                  ${compact ? 'px-4 py-2' : 'px-6 py-3'}
                  text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                  ${column.sortable && sortable ? 'cursor-pointer hover:text-gray-700' : ''}
                `}
                style={{ width: column.width }}
                onClick={() => handleSort(column)}
              >
                <div className="flex items-center">
                  <span>{column.header}</span>
                  {renderSortIcon(column)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => {
            const rowKey = keyExtractor(row);
            const isSelected = selectedRows.includes(rowKey);

            return (
              <tr
                key={rowKey}
                className={`
                  ${striped && rowIndex % 2 === 1 ? 'bg-gray-50' : ''}
                  ${hoverable ? 'hover:bg-gray-50' : ''}
                  ${isSelected ? 'bg-primary-50' : ''}
                `}
              >
                {selectable && (
                  <td className="relative w-12 px-6 py-4">
                    <input
                      type="checkbox"
                      className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      checked={isSelected}
                      onChange={() => onSelectRow?.(rowKey)}
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`
                      ${compact ? 'px-4 py-2' : 'px-6 py-4'}
                      whitespace-nowrap text-sm text-gray-900
                    `}
                  >
                    {column.cell ? column.cell(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Table;

/**
 * Usage Examples:
 * 
 * Basic table:
 * const columns = [
 *   { key: 'name', header: 'Name' },
 *   { key: 'email', header: 'Email' },
 *   { key: 'role', header: 'Role' },
 * ];
 * 
 * <Table
 *   data={users}
 *   columns={columns}
 *   keyExtractor={(user) => user.id}
 * />
 * 
 * With custom cell rendering:
 * const columns = [
 *   {
 *     key: 'status',
 *     header: 'Status',
 *     cell: (row) => (
 *       <Badge type={row.status}>
 *         {row.status}
 *       </Badge>
 *     ),
 *   },
 * ];
 * 
 * Sortable table:
 * <Table
 *   data={data}
 *   columns={columns}
 *   sortable
 *   sortColumn={sortColumn}
 *   sortDirection={sortDirection}
 *   onSort={handleSort}
 * />
 * 
 * Selectable rows:
 * <Table
 *   data={data}
 *   columns={columns}
 *   selectable
 *   selectedRows={selectedRows}
 *   onSelectRow={handleSelectRow}
 *   onSelectAll={handleSelectAll}
 * />
 * 
 * Loading state:
 * <Table
 *   data={data}
 *   columns={columns}
 *   loading={isLoading}
 * />
 * 
 * Styling variants:
 * <Table
 *   data={data}
 *   columns={columns}
 *   striped
 *   hoverable
 *   compact
 *   bordered
 * />
 * 
 * With sticky header:
 * <Table
 *   data={data}
 *   columns={columns}
 *   stickyHeader
 * />
 */

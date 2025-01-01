import React from 'react';
import { BaseProps } from '../../types/ui';

interface PaginationProps extends BaseProps {
  /**
   * The total number of pages
   */
  total: number;

  /**
   * The current page number (1-based)
   */
  current: number;

  /**
   * Callback when page changes
   */
  onChange?: (page: number) => void;

  /**
   * The number of pages to show before and after the current page
   */
  siblings?: number;

  /**
   * The number of pages to show at the start and end
   */
  boundaries?: number;

  /**
   * Whether to show the first/last page buttons
   */
  showFirstLast?: boolean;

  /**
   * Whether to show the previous/next page buttons
   */
  showPrevNext?: boolean;

  /**
   * The size of the pagination
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * The variant of the pagination
   */
  variant?: 'text' | 'outlined' | 'filled';

  /**
   * Whether to show the page size selector
   */
  showPageSize?: boolean;

  /**
   * Available page sizes
   */
  pageSizes?: number[];

  /**
   * Current page size
   */
  pageSize?: number;

  /**
   * Callback when page size changes
   */
  onPageSizeChange?: (pageSize: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  total,
  current,
  onChange,
  siblings = 1,
  boundaries = 1,
  showFirstLast = true,
  showPrevNext = true,
  size = 'md',
  variant = 'outlined',
  showPageSize = false,
  pageSizes = [10, 20, 50, 100],
  pageSize = 10,
  onPageSizeChange,
  className = '',
  ...props
}) => {
  const sizes = {
    sm: {
      button: 'h-8 w-8 text-sm',
      select: 'h-8 text-sm',
    },
    md: {
      button: 'h-10 w-10 text-base',
      select: 'h-10 text-base',
    },
    lg: {
      button: 'h-12 w-12 text-lg',
      select: 'h-12 text-lg',
    },
  };

  const variants = {
    text: {
      button: 'hover:bg-gray-100',
      active: 'bg-primary-50 text-primary-600',
    },
    outlined: {
      button: 'border hover:bg-gray-50',
      active: 'border-primary-600 bg-primary-50 text-primary-600',
    },
    filled: {
      button: 'hover:bg-gray-100',
      active: 'bg-primary-600 text-white',
    },
  };

  const range = (start: number, end: number) => {
    const length = end - start + 1;
    return Array.from({ length }, (_, i) => start + i);
  };

  const getPageNumbers = () => {
    const totalPages = Math.ceil(total / pageSize);
    const totalNumbers = siblings * 2 + 3;
    const totalButtons = totalNumbers + 2;

    if (totalButtons >= totalPages) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(current - siblings, boundaries);
    const rightSiblingIndex = Math.min(current + siblings, totalPages - boundaries + 1);

    const shouldShowLeftDots = leftSiblingIndex > boundaries + 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - boundaries - 1;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblings;
      return [...range(1, leftItemCount), '...', totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblings;
      return [1, '...', ...range(totalPages - rightItemCount + 1, totalPages)];
    }

    return [
      1,
      '...',
      ...range(leftSiblingIndex, rightSiblingIndex),
      '...',
      totalPages,
    ];
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= Math.ceil(total / pageSize)) {
      onChange?.(page);
    }
  };

  const renderPageButton = (page: number | string, index: number) => {
    const isActive = page === current;
    const isDisabled = page === '...';

    return (
      <button
        key={index}
        className={`
          flex items-center justify-center
          rounded-md
          ${sizes[size].button}
          ${isDisabled ? 'cursor-default' : 'cursor-pointer'}
          ${isActive ? variants[variant].active : variants[variant].button}
          disabled:opacity-50
          disabled:cursor-not-allowed
          transition-colors
        `}
        onClick={() => !isDisabled && handlePageChange(page as number)}
        disabled={isDisabled}
        aria-current={isActive ? 'page' : undefined}
      >
        {page}
      </button>
    );
  };

  return (
    <div
      className={`
        flex items-center justify-between
        ${className}
      `}
      {...props}
    >
      {showPageSize && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">Rows per page:</span>
          <select
            className={`
              rounded-md border-gray-300
              ${sizes[size].select}
              focus:outline-none focus:ring-2 focus:ring-primary-500
            `}
            value={pageSize}
            onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
          >
            {pageSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center space-x-2">
        {showFirstLast && (
          <button
            className={`
              flex items-center justify-center
              rounded-md
              ${sizes[size].button}
              ${variants[variant].button}
              disabled:opacity-50
              disabled:cursor-not-allowed
              transition-colors
            `}
            onClick={() => handlePageChange(1)}
            disabled={current === 1}
            aria-label="First page"
          >
            «
          </button>
        )}

        {showPrevNext && (
          <button
            className={`
              flex items-center justify-center
              rounded-md
              ${sizes[size].button}
              ${variants[variant].button}
              disabled:opacity-50
              disabled:cursor-not-allowed
              transition-colors
            `}
            onClick={() => handlePageChange(current - 1)}
            disabled={current === 1}
            aria-label="Previous page"
          >
            ‹
          </button>
        )}

        {getPageNumbers().map((page, index) => renderPageButton(page, index))}

        {showPrevNext && (
          <button
            className={`
              flex items-center justify-center
              rounded-md
              ${sizes[size].button}
              ${variants[variant].button}
              disabled:opacity-50
              disabled:cursor-not-allowed
              transition-colors
            `}
            onClick={() => handlePageChange(current + 1)}
            disabled={current === Math.ceil(total / pageSize)}
            aria-label="Next page"
          >
            ›
          </button>
        )}

        {showFirstLast && (
          <button
            className={`
              flex items-center justify-center
              rounded-md
              ${sizes[size].button}
              ${variants[variant].button}
              disabled:opacity-50
              disabled:cursor-not-allowed
              transition-colors
            `}
            onClick={() => handlePageChange(Math.ceil(total / pageSize))}
            disabled={current === Math.ceil(total / pageSize)}
            aria-label="Last page"
          >
            »
          </button>
        )}
      </div>
    </div>
  );
};

export default Pagination;

/**
 * Pagination Component Usage Guide:
 * 
 * 1. Basic pagination:
 *    <Pagination
 *      total={100}
 *      current={1}
 *      onChange={(page) => setPage(page)}
 *    />
 * 
 * 2. Different sizes:
 *    <Pagination size="sm" />
 *    <Pagination size="md" />
 *    <Pagination size="lg" />
 * 
 * 3. Different variants:
 *    <Pagination variant="text" />
 *    <Pagination variant="outlined" />
 *    <Pagination variant="filled" />
 * 
 * 4. Custom siblings:
 *    <Pagination
 *      siblings={2}
 *      total={100}
 *      current={1}
 *    />
 * 
 * 5. Custom boundaries:
 *    <Pagination
 *      boundaries={2}
 *      total={100}
 *      current={1}
 *    />
 * 
 * 6. Without first/last buttons:
 *    <Pagination
 *      showFirstLast={false}
 *      total={100}
 *      current={1}
 *    />
 * 
 * 7. Without prev/next buttons:
 *    <Pagination
 *      showPrevNext={false}
 *      total={100}
 *      current={1}
 *    />
 * 
 * 8. With page size selector:
 *    <Pagination
 *      showPageSize
 *      pageSizes={[5, 10, 20, 50]}
 *      pageSize={10}
 *      onPageSizeChange={(size) => setPageSize(size)}
 *      total={100}
 *      current={1}
 *    />
 * 
 * Notes:
 * - Multiple sizes
 * - Different variants
 * - Customizable layout
 * - Page size selection
 * - First/last navigation
 * - Previous/next navigation
 * - Dynamic page numbers
 * - Accessible
 */

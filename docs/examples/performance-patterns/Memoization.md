# Memoization Patterns

This guide demonstrates effective patterns for using React's memoization features to optimize performance.

## useMemo Patterns

### Basic Value Memoization

```tsx
// components/ExpensiveCalculation.tsx
import { useMemo } from 'react';

interface CalculationProps {
  numbers: number[];
  multiplier: number;
}

export const ExpensiveCalculation: React.FC<CalculationProps> = ({
  numbers,
  multiplier
}) => {
  const result = useMemo(() => {
    console.log('Calculating...');
    return numbers.reduce((acc, num) => acc + (num * multiplier), 0);
  }, [numbers, multiplier]);

  return <div>Result: {result}</div>;
};
```

### Derived Data Memoization

```tsx
// components/FilteredList.tsx
interface Item {
  id: number;
  name: string;
  category: string;
}

interface FilteredListProps {
  items: Item[];
  category: string;
}

export const FilteredList: React.FC<FilteredListProps> = ({
  items,
  category
}) => {
  const filteredItems = useMemo(() => {
    console.log('Filtering items...');
    return items.filter(item => item.category === category);
  }, [items, category]);

  return (
    <ul>
      {filteredItems.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
};
```

### Object Reference Stability

```tsx
// components/DataGrid.tsx
interface GridStyles {
  border: string;
  padding: number;
  backgroundColor: string;
}

export const DataGrid: React.FC<{ data: any[] }> = ({ data }) => {
  const gridStyles = useMemo<GridStyles>(() => ({
    border: '1px solid #ccc',
    padding: 8,
    backgroundColor: '#fff'
  }), []); // Empty deps array as styles are static

  return (
    <div style={gridStyles}>
      {data.map(item => (
        <div key={item.id}>{/* render item */}</div>
      ))}
    </div>
  );
};
```

## useCallback Implementation

### Event Handler Memoization

```tsx
// components/SearchInput.tsx
import { useCallback, useState } from 'react';

interface SearchInputProps {
  onSearch: (term: string) => void;
  debounceMs?: number;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  onSearch,
  debounceMs = 300
}) => {
  const [value, setValue] = useState('');

  const debouncedSearch = useCallback(() => {
    const handler = setTimeout(() => {
      onSearch(value);
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [value, onSearch, debounceMs]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    debouncedSearch();
  }, [debouncedSearch]);

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      placeholder="Search..."
    />
  );
};
```

### Callback Props

```tsx
// components/ItemList.tsx
interface Item {
  id: string;
  name: string;
}

interface ItemListProps {
  items: Item[];
  onItemSelect: (item: Item) => void;
}

export const ItemList: React.FC<ItemListProps> = ({
  items,
  onItemSelect
}) => {
  const handleClick = useCallback((item: Item) => {
    console.log('Item clicked:', item.name);
    onItemSelect(item);
  }, [onItemSelect]);

  return (
    <ul>
      {items.map(item => (
        <li key={item.id} onClick={() => handleClick(item)}>
          {item.name}
        </li>
      ))}
    </ul>
  );
};
```

## Component Memoization

### React.memo Usage

```tsx
// components/TodoItem.tsx
import { memo } from 'react';

interface TodoProps {
  id: number;
  text: string;
  completed: boolean;
  onToggle: (id: number) => void;
}

const TodoItem: React.FC<TodoProps> = ({
  id,
  text,
  completed,
  onToggle
}) => {
  console.log(`Rendering TodoItem: ${text}`);
  
  return (
    <li
      style={{ textDecoration: completed ? 'line-through' : 'none' }}
      onClick={() => onToggle(id)}
    >
      {text}
    </li>
  );
};

// Custom comparison function
const areEqual = (prevProps: TodoProps, nextProps: TodoProps) => {
  return (
    prevProps.text === nextProps.text &&
    prevProps.completed === nextProps.completed
  );
};

// Memoized component with custom comparison
export default memo(TodoItem, areEqual);
```

### Complex Props Memoization

```tsx
// components/DataTable.tsx
interface TableProps {
  data: any[];
  columns: Column[];
  sortConfig: SortConfig;
  onSort: (column: string) => void;
}

const DataTable: React.FC<TableProps> = memo(({
  data,
  columns,
  sortConfig,
  onSort
}) => {
  const sortedData = useMemo(() => {
    if (!sortConfig.column) return data;
    
    return [...data].sort((a, b) => {
      if (sortConfig.direction === 'asc') {
        return a[sortConfig.column] > b[sortConfig.column] ? 1 : -1;
      }
      return a[sortConfig.column] < b[sortConfig.column] ? 1 : -1;
    });
  }, [data, sortConfig]);

  return (
    <table>
      <thead>
        <tr>
          {columns.map(column => (
            <th key={column.key} onClick={() => onSort(column.key)}>
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedData.map(row => (
          <tr key={row.id}>
            {columns.map(column => (
              <td key={column.key}>{row[column.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
});

export default DataTable;
```

### Testing Memoization

```tsx
// __tests__/Memoization.test.tsx
import { render, fireEvent } from '@testing-library/react';
import { TodoItem } from './TodoItem';

describe('TodoItem Memoization', () => {
  it('should not re-render when irrelevant props change', () => {
    const renderCount = jest.fn();
    const onToggle = jest.fn();

    const { rerender } = render(
      <TodoItem
        id={1}
        text="Test Todo"
        completed={false}
        onToggle={onToggle}
      />
    );

    // Re-render with same props
    rerender(
      <TodoItem
        id={1}
        text="Test Todo"
        completed={false}
        onToggle={onToggle}
      />
    );

    expect(renderCount).toHaveBeenCalledTimes(1);
  });

  it('should re-render when relevant props change', () => {
    const onToggle = jest.fn();

    const { rerender } = render(
      <TodoItem
        id={1}
        text="Test Todo"
        completed={false}
        onToggle={onToggle}
      />
    );

    // Re-render with different completed state
    rerender(
      <TodoItem
        id={1}
        text="Test Todo"
        completed={true}
        onToggle={onToggle}
      />
    );

    expect(onToggle).toHaveBeenCalledTimes(0);
  });
});
```

This section covers memoization patterns. The next sections will cover code splitting, lazy loading, and bundle optimization.

# Core Workflows Guide - Part 1: Basic Data Operations

## CRUD Operations Implementation

### Data Service Setup

```typescript
// src/services/DataService.ts
import { api } from '../utils/api';

export interface DataItem {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export class DataService {
  private endpoint: string;

  constructor(resourcePath: string) {
    this.endpoint = `/api/${resourcePath}`;
  }

  async getAll(): Promise<DataItem[]> {
    const response = await api.get(this.endpoint);
    return response.data;
  }

  async getById(id: string): Promise<DataItem> {
    const response = await api.get(`${this.endpoint}/${id}`);
    return response.data;
  }

  async create(data: Omit<DataItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<DataItem> {
    const response = await api.post(this.endpoint, data);
    return response.data;
  }

  async update(id: string, data: Partial<DataItem>): Promise<DataItem> {
    const response = await api.put(`${this.endpoint}/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`${this.endpoint}/${id}`);
  }
}
```

### Custom Hook Implementation

```typescript
// src/hooks/useDataOperations.ts
import { useState, useCallback } from 'react';
import { DataService, DataItem } from '../services/DataService';

interface UseDataOperationsProps {
  service: DataService;
}

export function useDataOperations({ service }: UseDataOperationsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [items, setItems] = useState<DataItem[]>([]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getAll();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch items'));
    } finally {
      setLoading(false);
    }
  }, [service]);

  const createItem = useCallback(async (data: Omit<DataItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);
    try {
      const newItem = await service.create(data);
      setItems(prev => [...prev, newItem]);
      return newItem;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create item'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  const updateItem = useCallback(async (id: string, data: Partial<DataItem>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedItem = await service.update(id, data);
      setItems(prev => prev.map(item => 
        item.id === id ? updatedItem : item
      ));
      return updatedItem;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update item'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  const deleteItem = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await service.delete(id);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete item'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  return {
    items,
    loading,
    error,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
  };
}
```

### Implementation Example

```typescript
// src/components/DataManagement.tsx
import { useEffect } from 'react';
import { DataService } from '../services/DataService';
import { useDataOperations } from '../hooks/useDataOperations';
import {
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';

const dataService = new DataService('items');

export function DataManagement() {
  const {
    items,
    loading,
    error,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
  } = useDataOperations({ service: dataService });

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleCreate = async () => {
    try {
      await createItem({
        title: 'New Item',
        description: 'Description',
        status: 'active',
      });
    } catch (err) {
      console.error('Failed to create item:', err);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await updateItem(id, {
        title: `Updated Item ${Date.now()}`,
      });
    } catch (err) {
      console.error('Failed to update item:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteItem(id);
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        onClick={handleCreate}
        sx={{ mb: 2 }}
      >
        Create New Item
      </Button>

      <List>
        {items.map((item) => (
          <ListItem key={item.id}>
            <ListItemText
              primary={item.title}
              secondary={item.description}
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="edit"
                onClick={() => handleUpdate(item.id)}
                sx={{ mr: 1 }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleDelete(item.id)}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </div>
  );
}
```

### Error Handling and Loading States

```typescript
// src/components/common/LoadingState.tsx
import { CircularProgress, Box } from '@mui/material';

export function LoadingState() {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="200px"
    >
      <CircularProgress />
    </Box>
  );
}

// src/components/common/ErrorState.tsx
import { Alert, Button, Box } from '@mui/material';

interface ErrorStateProps {
  error: Error;
  onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <Box sx={{ my: 2 }}>
      <Alert
        severity="error"
        action={
          onRetry && (
            <Button color="inherit" size="small" onClick={onRetry}>
              Retry
            </Button>
          )
        }
      >
        {error.message}
      </Alert>
    </Box>
  );
}

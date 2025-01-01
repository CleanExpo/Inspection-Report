import { useState, useCallback, useEffect } from 'react';
import {
  BatchItem,
  BatchSelectionState,
  BatchProcessingState,
  BatchOperationType,
  BatchOperationResult,
  BatchOperationOptions
} from '../types/batch';

interface UseBatchOperationsProps<T extends BatchItem> {
  items: T[];
  onTagItems?: (items: T[], tags: string[]) => Promise<BatchOperationResult>;
  onDeleteItems?: (items: T[]) => Promise<BatchOperationResult>;
  onDownloadItems?: (items: T[]) => Promise<BatchOperationResult>;
  onArchiveItems?: (items: T[]) => Promise<BatchOperationResult>;
  onShareItems?: (items: T[]) => Promise<BatchOperationResult>;
  onCompressItems?: (items: T[]) => Promise<BatchOperationResult>;
  onCreateGallery?: (items: T[]) => Promise<BatchOperationResult>;
}

interface UseBatchOperationsReturn<T extends BatchItem> {
  selectedItems: T[];
  selectionState: BatchSelectionState;
  processingState: BatchProcessingState;
  toggleSelection: (item: T, isMultiSelect?: boolean) => void;
  clearSelection: () => void;
  selectAll: () => void;
  handleTagItems: (tags: string[]) => Promise<BatchOperationResult>;
  handleDeleteItems: () => Promise<BatchOperationResult>;
  handleOperation: (
    operationType: BatchOperationType,
    options?: BatchOperationOptions
  ) => Promise<BatchOperationResult>;
  isOperationAvailable: (operationType: BatchOperationType) => boolean;
}

export function useBatchOperations<T extends BatchItem>({
  items,
  onTagItems,
  onDeleteItems,
  onDownloadItems,
  onArchiveItems,
  onShareItems,
  onCompressItems,
  onCreateGallery
}: UseBatchOperationsProps<T>): UseBatchOperationsReturn<T> {
  const [selectionState, setSelectionState] = useState<BatchSelectionState>({
    selectedIds: [],
    selectionMode: 'single'
  });

  const [processingState, setProcessingState] = useState<BatchProcessingState>({
    isProcessing: false
  });

  // Reset processing state when items change
  useEffect(() => {
    setProcessingState({ isProcessing: false });
  }, [items]);

  const selectedItems = items.filter(item => 
    selectionState.selectedIds.includes(item.id)
  );

  const toggleSelection = useCallback((item: T, isMultiSelect = false) => {
    setSelectionState(prev => {
      const mode = isMultiSelect ? 'multiple' : 'single';
      const isSelected = prev.selectedIds.includes(item.id);

      if (isMultiSelect) {
        return {
          selectedIds: isSelected
            ? prev.selectedIds.filter(id => id !== item.id)
            : [...prev.selectedIds, item.id],
          lastSelected: item.id,
          selectionMode: mode
        };
      }

      return {
        selectedIds: isSelected ? [] : [item.id],
        lastSelected: item.id,
        selectionMode: mode
      };
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectionState({
      selectedIds: [],
      selectionMode: 'single'
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectionState({
      selectedIds: items.map(item => item.id),
      selectionMode: 'multiple'
    });
  }, [items]);

  const handleOperation = async (
    operationType: BatchOperationType,
    options?: BatchOperationOptions
  ): Promise<BatchOperationResult> => {
    if (processingState.isProcessing) {
      return {
        success: false,
        message: 'Another operation is in progress',
        error: 'Operation in progress'
      };
    }

    setProcessingState({
      isProcessing: true,
      currentOperation: operationType
    });

    try {
      let result: BatchOperationResult;

      switch (operationType) {
        case 'tag':
          if (!onTagItems) throw new Error('Tag operation not available');
          result = await onTagItems(selectedItems, []);
          break;
        case 'delete':
          if (!onDeleteItems) throw new Error('Delete operation not available');
          result = await onDeleteItems(selectedItems);
          break;
        case 'download':
          if (!onDownloadItems) throw new Error('Download operation not available');
          result = await onDownloadItems(selectedItems);
          break;
        case 'archive':
          if (!onArchiveItems) throw new Error('Archive operation not available');
          result = await onArchiveItems(selectedItems);
          break;
        case 'share':
          if (!onShareItems) throw new Error('Share operation not available');
          result = await onShareItems(selectedItems);
          break;
        case 'compress':
          if (!onCompressItems) throw new Error('Compress operation not available');
          result = await onCompressItems(selectedItems);
          break;
        case 'createGallery':
          if (!onCreateGallery) throw new Error('Create gallery operation not available');
          result = await onCreateGallery(selectedItems);
          break;
        default:
          throw new Error('Unknown operation type');
      }

      if (result.success && !options?.processInBackground) {
        clearSelection();
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Operation failed';
      return {
        success: false,
        message: errorMessage,
        error: errorMessage
      };
    } finally {
      setProcessingState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const handleTagItems = async (tags: string[]): Promise<BatchOperationResult> => {
    if (!onTagItems) {
      return {
        success: false,
        message: 'Tag operation not available',
        error: 'Operation not available'
      };
    }
    return handleOperation('tag');
  };

  const handleDeleteItems = async (): Promise<BatchOperationResult> => {
    if (!onDeleteItems) {
      return {
        success: false,
        message: 'Delete operation not available',
        error: 'Operation not available'
      };
    }
    return handleOperation('delete');
  };

  const isOperationAvailable = useCallback((operationType: BatchOperationType): boolean => {
    switch (operationType) {
      case 'tag': return Boolean(onTagItems);
      case 'delete': return Boolean(onDeleteItems);
      case 'download': return Boolean(onDownloadItems);
      case 'archive': return Boolean(onArchiveItems);
      case 'share': return Boolean(onShareItems);
      case 'compress': return Boolean(onCompressItems);
      case 'createGallery': return Boolean(onCreateGallery);
      default: return false;
    }
  }, [
    onTagItems,
    onDeleteItems,
    onDownloadItems,
    onArchiveItems,
    onShareItems,
    onCompressItems,
    onCreateGallery
  ]);

  return {
    selectedItems,
    selectionState,
    processingState,
    toggleSelection,
    clearSelection,
    selectAll,
    handleTagItems,
    handleDeleteItems,
    handleOperation,
    isOperationAvailable
  };
}

import { renderHook, act } from '@testing-library/react';
import { useBatchOperations } from '../../hooks/useBatchOperations';
import type { PhotoAttachment } from '../../types/photo';
import type { BatchOperationResult } from '../../types/batch';

const mockPhotos: PhotoAttachment[] = [
  {
    id: '1',
    url: 'photo1.jpg',
    fileName: 'photo1.jpg',
    fileSize: 1000,
    mimeType: 'image/jpeg',
    uploadedAt: new Date().toISOString(),
    tags: ['tag1', 'tag2']
  },
  {
    id: '2',
    url: 'photo2.jpg',
    fileName: 'photo2.jpg',
    fileSize: 2000,
    mimeType: 'image/jpeg',
    uploadedAt: new Date().toISOString(),
    tags: ['tag2', 'tag3']
  },
  {
    id: '3',
    url: 'photo3.jpg',
    fileName: 'photo3.jpg',
    fileSize: 3000,
    mimeType: 'image/jpeg',
    uploadedAt: new Date().toISOString()
  }
];

const successResult: BatchOperationResult = {
  success: true,
  message: 'Operation successful'
};

const errorResult: BatchOperationResult = {
  success: false,
  message: 'Operation failed',
  error: 'Test error'
};

describe('useBatchOperations', () => {
  const mockOnTagItems = jest.fn().mockResolvedValue(successResult);
  const mockOnDeleteItems = jest.fn().mockResolvedValue(successResult);
  const mockOnDownloadItems = jest.fn().mockResolvedValue(successResult);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with empty selection', () => {
    const { result } = renderHook(() => useBatchOperations({
      items: mockPhotos,
      onTagItems: mockOnTagItems,
      onDeleteItems: mockOnDeleteItems
    }));

    expect(result.current.selectedItems).toHaveLength(0);
    expect(result.current.selectionState.selectedIds).toHaveLength(0);
    expect(result.current.selectionState.selectionMode).toBe('single');
  });

  it('toggles single item selection', () => {
    const { result } = renderHook(() => useBatchOperations({
      items: mockPhotos,
      onTagItems: mockOnTagItems,
      onDeleteItems: mockOnDeleteItems
    }));

    act(() => {
      result.current.toggleSelection(mockPhotos[0]);
    });

    expect(result.current.selectedItems).toHaveLength(1);
    expect(result.current.selectedItems[0].id).toBe('1');

    // Toggle same item should deselect it
    act(() => {
      result.current.toggleSelection(mockPhotos[0]);
    });

    expect(result.current.selectedItems).toHaveLength(0);
  });

  it('handles multiple selection', () => {
    const { result } = renderHook(() => useBatchOperations({
      items: mockPhotos,
      onTagItems: mockOnTagItems,
      onDeleteItems: mockOnDeleteItems
    }));

    act(() => {
      result.current.toggleSelection(mockPhotos[0], true);
      result.current.toggleSelection(mockPhotos[1], true);
    });

    expect(result.current.selectedItems).toHaveLength(2);
    expect(result.current.selectionState.selectionMode).toBe('multiple');
  });

  it('clears selection', () => {
    const { result } = renderHook(() => useBatchOperations({
      items: mockPhotos,
      onTagItems: mockOnTagItems,
      onDeleteItems: mockOnDeleteItems
    }));

    act(() => {
      result.current.toggleSelection(mockPhotos[0], true);
      result.current.toggleSelection(mockPhotos[1], true);
      result.current.clearSelection();
    });

    expect(result.current.selectedItems).toHaveLength(0);
    expect(result.current.selectionState.selectionMode).toBe('single');
  });

  it('selects all items', () => {
    const { result } = renderHook(() => useBatchOperations({
      items: mockPhotos,
      onTagItems: mockOnTagItems,
      onDeleteItems: mockOnDeleteItems
    }));

    act(() => {
      result.current.selectAll();
    });

    expect(result.current.selectedItems).toHaveLength(mockPhotos.length);
    expect(result.current.selectionState.selectionMode).toBe('multiple');
  });

  it('handles tag operation successfully', async () => {
    const { result } = renderHook(() => useBatchOperations({
      items: mockPhotos,
      onTagItems: mockOnTagItems,
      onDeleteItems: mockOnDeleteItems
    }));

    act(() => {
      result.current.selectAll();
    });

    await act(async () => {
      await result.current.handleTagItems(['newtag']);
    });

    expect(mockOnTagItems).toHaveBeenCalledWith(mockPhotos, ['newtag']);
    expect(result.current.processingState.isProcessing).toBe(false);
  });

  it('handles delete operation successfully', async () => {
    const { result } = renderHook(() => useBatchOperations({
      items: mockPhotos,
      onTagItems: mockOnTagItems,
      onDeleteItems: mockOnDeleteItems
    }));

    act(() => {
      result.current.selectAll();
    });

    await act(async () => {
      await result.current.handleDeleteItems();
    });

    expect(mockOnDeleteItems).toHaveBeenCalledWith(mockPhotos);
    expect(result.current.processingState.isProcessing).toBe(false);
  });

  it('handles operation failure', async () => {
    const mockFailedDelete = jest.fn().mockResolvedValue(errorResult);
    const { result } = renderHook(() => useBatchOperations({
      items: mockPhotos,
      onTagItems: mockOnTagItems,
      onDeleteItems: mockFailedDelete
    }));

    act(() => {
      result.current.selectAll();
    });

    const operationResult = await act(async () => {
      return await result.current.handleDeleteItems();
    });

    expect(operationResult.success).toBe(false);
    expect(operationResult.error).toBe('Test error');
    expect(result.current.processingState.isProcessing).toBe(false);
  });

  it('checks operation availability correctly', () => {
    const { result } = renderHook(() => useBatchOperations({
      items: mockPhotos,
      onTagItems: mockOnTagItems,
      // Only provide tag operation
    }));

    expect(result.current.isOperationAvailable('tag')).toBe(true);
    expect(result.current.isOperationAvailable('delete')).toBe(false);
    expect(result.current.isOperationAvailable('download')).toBe(false);
  });

  it('prevents concurrent operations', async () => {
    const slowOperation = jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(successResult), 100))
    );

    const { result } = renderHook(() => useBatchOperations({
      items: mockPhotos,
      onDeleteItems: slowOperation
    }));

    act(() => {
      result.current.selectAll();
    });

    // Start first operation
    const firstOperation = act(async () => {
      return await result.current.handleOperation('delete');
    });

    // Attempt second operation immediately
    const secondOperation = act(async () => {
      return await result.current.handleOperation('delete');
    });

    const [firstResult, secondResult] = await Promise.all([
      firstOperation,
      secondOperation
    ]);

    expect(slowOperation).toHaveBeenCalledTimes(1);
    expect(secondResult.success).toBe(false);
    expect(secondResult.error).toContain('Operation in progress');
  });
});

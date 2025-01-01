import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BatchOperations from '../../components/BatchOperations';
import { BatchOperationResult } from '../../types/batch';
import type { PhotoAttachment } from '../../types/photo';

// Mock MUI components to avoid styling-related issues in tests
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useTheme: () => ({
    breakpoints: {
      down: () => false
    }
  })
}));

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

const renderBatchOperations = (props: any) => {
  return render(
    <BatchOperations
      selectedItems={mockPhotos}
      itemType="photo"
      {...props}
    />
  );
};

describe('BatchOperations', () => {
  const mockOnTagItems = jest.fn().mockResolvedValue(successResult);
  const mockOnDeleteItems = jest.fn().mockResolvedValue(successResult);
  const mockOnDownloadItems = jest.fn().mockResolvedValue(successResult);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders nothing when no items are selected', () => {
    const { container } = render(
      <BatchOperations
        selectedItems={[]}
        itemType="photo"
        onTagItems={mockOnTagItems}
        onDeleteItems={mockOnDeleteItems}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('displays correct number of selected items', () => {
    renderBatchOperations({
      onTagItems: mockOnTagItems,
      onDeleteItems: mockOnDeleteItems
    });
    expect(screen.getByText('2 photos selected')).toBeInTheDocument();
  });

  it('opens tag dialog when tag button is clicked', async () => {
    renderBatchOperations({
      onTagItems: mockOnTagItems,
      onDeleteItems: mockOnDeleteItems
    });
    
    const tagButton = screen.getByRole('button', { name: /add tags/i });
    await userEvent.click(tagButton);
    
    expect(screen.getByText('Add Tags')).toBeInTheDocument();
  });

  it('handles tag operation successfully', async () => {
    renderBatchOperations({
      onTagItems: mockOnTagItems,
      onDeleteItems: mockOnDeleteItems
    });
    
    // Open tag dialog
    const tagButton = screen.getByRole('button', { name: /add tags/i });
    await userEvent.click(tagButton);
    
    // Add a new tag
    const input = screen.getByPlaceholderText('Add a tag');
    await userEvent.type(input, 'newtag');
    const addButton = screen.getByRole('button', { name: /add/i });
    await userEvent.click(addButton);
    
    // Save tags
    const saveButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockOnTagItems).toHaveBeenCalledWith(mockPhotos, ['newtag']);
    });
  });

  it('handles delete operation with confirmation', async () => {
    renderBatchOperations({
      onTagItems: mockOnTagItems,
      onDeleteItems: mockOnDeleteItems
    });
    
    // Click delete button
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);
    
    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /delete$/i });
    await userEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(mockOnDeleteItems).toHaveBeenCalledWith(mockPhotos);
    });
  });

  it('handles download operation', async () => {
    renderBatchOperations({
      onTagItems: mockOnTagItems,
      onDeleteItems: mockOnDeleteItems,
      onDownloadItems: mockOnDownloadItems
    });
    
    const downloadButton = screen.getByRole('button', { name: /download/i });
    await userEvent.click(downloadButton);
    
    await waitFor(() => {
      expect(mockOnDownloadItems).toHaveBeenCalledWith(mockPhotos);
    });
  });

  it('displays error message when operation fails', async () => {
    const mockFailedDelete = jest.fn().mockResolvedValue(errorResult);
    
    renderBatchOperations({
      onTagItems: mockOnTagItems,
      onDeleteItems: mockFailedDelete
    });
    
    // Click delete button
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);
    
    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /delete$/i });
    await userEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });
  });

  it('disables buttons during processing', async () => {
    const mockSlowDelete = jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(successResult), 100))
    );
    
    renderBatchOperations({
      onTagItems: mockOnTagItems,
      onDeleteItems: mockSlowDelete
    });
    
    // Click delete button
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);
    
    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /delete$/i });
    await userEvent.click(confirmButton);
    
    // Check buttons are disabled during processing
    expect(deleteButton).toBeDisabled();
    expect(screen.getByRole('button', { name: /add tags/i })).toBeDisabled();
    
    // Wait for operation to complete
    await waitFor(() => {
      expect(deleteButton).not.toBeDisabled();
    });
  });

  it('clears selection after successful operation', async () => {
    const { rerender } = renderBatchOperations({
      onTagItems: mockOnTagItems,
      onDeleteItems: mockOnDeleteItems
    });

    // Perform delete operation
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);
    const confirmButton = screen.getByRole('button', { name: /delete$/i });
    await userEvent.click(confirmButton);

    // Mock the rerender with cleared selection
    rerender(
      <BatchOperations
        selectedItems={[]}
        itemType="photo"
        onTagItems={mockOnTagItems}
        onDeleteItems={mockOnDeleteItems}
      />
    );

    // Verify component is not rendered when selection is cleared
    expect(screen.queryByText(/photos selected/i)).not.toBeInTheDocument();
  });
});

"use client";

import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Delete as DeleteIcon,
  LocalOffer as TagIcon,
  Download as DownloadIcon,
  Archive as ArchiveIcon,
  Share as ShareIcon,
  PhotoLibrary as GalleryIcon,
  Compress as CompressIcon
} from '@mui/icons-material';
import BatchTagDialog from './BatchTagDialog';
import {
  BatchItem,
  TagUpdate,
  BatchOperationType,
  BatchOperationResult,
  BatchProcessingState
} from '../types/batch';

interface BatchOperationsProps<T extends BatchItem> {
  selectedItems: T[];
  itemType: 'photo' | 'note';
  onTagItems?: (items: T[], tags: string[]) => Promise<BatchOperationResult>;
  onDeleteItems?: (items: T[]) => Promise<BatchOperationResult>;
  onDownloadItems?: (items: T[]) => Promise<BatchOperationResult>;
  onArchiveItems?: (items: T[]) => Promise<BatchOperationResult>;
  onShareItems?: (items: T[]) => Promise<BatchOperationResult>;
  onCompressItems?: (items: T[]) => Promise<BatchOperationResult>;
  onCreateGallery?: (items: T[]) => Promise<BatchOperationResult>;
  className?: string;
}

const BatchOperations = <T extends BatchItem>({
  selectedItems,
  itemType,
  onTagItems,
  onDeleteItems,
  onDownloadItems,
  onArchiveItems,
  onShareItems,
  onCompressItems,
  onCreateGallery,
  className = ""
}: BatchOperationsProps<T>) => {
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [processingState, setProcessingState] = useState<BatchProcessingState>({
    isProcessing: false
  });
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleSaveUpdates = async (updates: TagUpdate) => {
    if (!onTagItems) return;

    try {
      setProcessingState({
        isProcessing: true,
        currentOperation: 'tag'
      });
      const result = await onTagItems(selectedItems, updates.tags);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update tags');
      }
      setIsTagDialogOpen(false);
    } catch (error) {
      console.error('Error updating items:', error);
      setProcessingState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update items'
      }));
    } finally {
      setProcessingState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const handleDeleteItems = async () => {
    if (!onDeleteItems) return;

    try {
      setProcessingState({
        isProcessing: true,
        currentOperation: 'delete'
      });
      const result = await onDeleteItems(selectedItems);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete items');
      }
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting items:', error);
      setProcessingState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete items'
      }));
    } finally {
      setProcessingState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const handleOperation = async (
    operation: ((items: T[]) => Promise<BatchOperationResult>) | undefined,
    operationType: BatchOperationType,
    errorMessage: string
  ) => {
    if (!operation) return;

    try {
      setProcessingState({
        isProcessing: true,
        currentOperation: operationType
      });
      const result = await operation(selectedItems);
      if (!result.success) {
        throw new Error(result.error || errorMessage);
      }
      handleMenuClose();
    } catch (error) {
      console.error(`Error: ${errorMessage}`, error);
      setProcessingState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : errorMessage
      }));
    } finally {
      setProcessingState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  if (selectedItems.length === 0) {
    return null;
  }

  const uniqueExistingTags = Array.from(
    new Set(selectedItems.flatMap(item => item.tags || []))
  );

  return (
    <Box 
      sx={{ 
        p: 2, 
        border: 1, 
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: 'background.paper',
        boxShadow: 1
      }}
      className={className}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1">
          {selectedItems.length} {itemType}s selected
        </Typography>
        
        {processingState.isProcessing && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} />
            <Typography variant="caption" color="text.secondary">
              {processingState.currentOperation}...
            </Typography>
          </Box>
        )}
      </Box>

      {processingState.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {processingState.error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 1 }}>
        {onTagItems && (
          <Tooltip title="Add tags">
            <IconButton
              onClick={() => setIsTagDialogOpen(true)}
              disabled={processingState.isProcessing}
              aria-label="Add tags"
            >
              <TagIcon />
            </IconButton>
          </Tooltip>
        )}

        {itemType === 'photo' && (
          <>
            {onDownloadItems && (
              <Tooltip title="Download">
                <IconButton
                  onClick={() => handleOperation(onDownloadItems, 'download', 'Failed to download items')}
                  disabled={processingState.isProcessing}
                  aria-label="Download"
                >
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            )}

            <Button
              variant="outlined"
              onClick={handleMenuOpen}
              disabled={processingState.isProcessing}
              startIcon={<ArchiveIcon />}
              aria-label="More Actions"
            >
              More Actions
            </Button>

            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={handleMenuClose}
            >
              {onArchiveItems && (
                <MenuItem onClick={() => handleOperation(onArchiveItems, 'archive', 'Failed to archive items')}>
                  <ListItemIcon><ArchiveIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>Archive</ListItemText>
                </MenuItem>
              )}
              {onShareItems && (
                <MenuItem onClick={() => handleOperation(onShareItems, 'share', 'Failed to share items')}>
                  <ListItemIcon><ShareIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>Share</ListItemText>
                </MenuItem>
              )}
              {onCompressItems && (
                <MenuItem onClick={() => handleOperation(onCompressItems, 'compress', 'Failed to compress items')}>
                  <ListItemIcon><CompressIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>Compress</ListItemText>
                </MenuItem>
              )}
              {onCreateGallery && (
                <MenuItem onClick={() => handleOperation(onCreateGallery, 'createGallery', 'Failed to create gallery')}>
                  <ListItemIcon><GalleryIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>Create Gallery</ListItemText>
                </MenuItem>
              )}
            </Menu>
          </>
        )}

        {onDeleteItems && (
          <Tooltip title="Delete">
            <IconButton
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={processingState.isProcessing}
              color="error"
              aria-label="Delete"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Tag Dialog */}
      <BatchTagDialog
        open={isTagDialogOpen}
        onClose={() => setIsTagDialogOpen(false)}
        onSave={handleSaveUpdates}
        isProcessing={processingState.isProcessing}
        existingTags={uniqueExistingTags}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete {itemType}s</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedItems.length} {itemType}s?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsDeleteDialogOpen(false)}
            disabled={processingState.isProcessing}
            aria-label="Cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteItems}
            color="error"
            disabled={processingState.isProcessing}
            startIcon={processingState.isProcessing ? <CircularProgress size={20} /> : <DeleteIcon />}
            aria-label="Delete"
          >
            {processingState.isProcessing ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BatchOperations;

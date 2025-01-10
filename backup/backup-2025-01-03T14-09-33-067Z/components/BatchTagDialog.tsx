"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  Typography,
  Alert
} from '@mui/material';

interface TagUpdate {
  tags: string[];
}

interface BatchTagDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (updates: TagUpdate) => Promise<void>;
  isProcessing?: boolean;
  existingTags?: string[];
  className?: string;
}

const BatchTagDialog: React.FC<BatchTagDialogProps> = ({
  open,
  onClose,
  onSave,
  isProcessing = false,
  existingTags = [],
  className = ""
}) => {
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Reset state when dialog opens
  React.useEffect(() => {
    if (open) {
      setTags([]);
      setNewTag('');
      setError(null);
    }
  }, [open]);

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    if (tags.includes(newTag.trim())) {
      setError('Tag already exists');
      return;
    }
    setTags([...tags, newTag.trim()]);
    setNewTag('');
    setError(null);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    try {
      if (tags.length === 0) {
        setError('Please add at least one tag');
        return;
      }

      await onSave({ tags });
      onClose();
    } catch (error) {
      console.error('Error saving tags:', error);
      setError(error instanceof Error ? error.message : 'Failed to save tags');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      className={className}
    >
      <DialogTitle>Add Tags</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 2 }}>
          {existingTags.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Existing Tags
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {existingTags.map(tag => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      if (!tags.includes(tag)) {
                        setTags([...tags, tag]);
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          <Typography variant="subtitle2" gutterBottom>
            New Tags
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {tags.map(tag => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() => handleRemoveTag(tag)}
              />
            ))}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Add a tag"
              size="small"
              fullWidth
              error={Boolean(error)}
              helperText={error}
            />
            <Button
              onClick={handleAddTag}
              variant="outlined"
              disabled={!newTag.trim() || isProcessing}
            >
              Add
            </Button>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isProcessing}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={isProcessing || tags.length === 0}
        >
          {isProcessing ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BatchTagDialog;

"use client";

import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Paper
} from '@mui/material';
import type { InspectionNote } from '../types/inspection';

interface NoteEditorProps {
  initialNote?: Partial<InspectionNote>;
  onSave: (note: Partial<InspectionNote>) => Promise<void>;
  onCancel?: () => void;
  className?: string;
}

const NOTE_TYPES = [
  { value: 'observation', label: 'Observation' },
  { value: 'recommendation', label: 'Recommendation' },
  { value: 'action', label: 'Action' }
] as const;

const NoteEditor: React.FC<NoteEditorProps> = ({
  initialNote,
  onSave,
  onCancel,
  className = ""
}) => {
  const [editedNote, setEditedNote] = useState<Partial<InspectionNote>>({
    content: '',
    type: 'observation',
    ...initialNote
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof InspectionNote, value: string) => {
    setEditedNote(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editedNote.content?.trim()) {
      setError('Note content is required');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      await onSave(editedNote);
    } catch (error) {
      console.error('Error saving note:', error);
      setError(error instanceof Error ? error.message : 'Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Paper className={`p-6 ${className}`}>
      <Typography variant="h6" gutterBottom>
        {initialNote ? 'Edit Note' : 'Add Note'}
      </Typography>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormControl fullWidth>
          <InputLabel>Note Type</InputLabel>
          <Select
            value={editedNote.type || 'observation'}
            onChange={(e) => handleChange('type', e.target.value)}
            label="Note Type"
          >
            {NOTE_TYPES.map(type => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Note Content"
          multiline
          rows={4}
          value={editedNote.content || ''}
          onChange={(e) => handleChange('content', e.target.value)}
          fullWidth
          required
          error={!!error && !editedNote.content}
          helperText={error && !editedNote.content ? error : ''}
        />

        <Box className="flex justify-end space-x-2">
          {onCancel && (
            <Button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Note'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default NoteEditor;

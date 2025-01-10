"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import type { VoiceNote } from '../types/voice';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  notes: VoiceNote[];
  onExport: (options: ExportOptions) => Promise<void>;
  className?: string;
}

interface ExportOptions {
  includePhotos: boolean;
  includeAnalysis: boolean;
  includeMetadata: boolean;
  format: 'pdf' | 'docx';
}

const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  onClose,
  notes,
  onExport,
  className = ""
}) => {
  const [options, setOptions] = useState<ExportOptions>({
    includePhotos: true,
    includeAnalysis: true,
    includeMetadata: false,
    format: 'pdf'
  });
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOptionChange = (option: keyof ExportOptions) => {
    setOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handleFormatChange = (format: 'pdf' | 'docx') => {
    setOptions(prev => ({
      ...prev,
      format
    }));
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setError(null);
      await onExport(options);
      onClose();
    } catch (error) {
      console.error('Error exporting notes:', error);
      setError(error instanceof Error ? error.message : 'Failed to export notes');
    } finally {
      setIsExporting(false);
    }
  };

  // Calculate stats
  const photoCount = notes.reduce((count, note) =>
    count + (note.photos?.length || 0), 0
  );

  const analysisCount = notes.filter(note =>
    note.analysis?.aiProcessed && (
      note.analysis.keyFindings?.length ||
      note.analysis.criticalIssues?.length ||
      note.analysis.nextSteps?.length
    )
  ).length;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      className={className}
    >
      <DialogTitle>Export Notes</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        <Box className="space-y-4">
          <Typography variant="subtitle2" gutterBottom>
            Export Options
          </Typography>

          <FormControlLabel
            control={
              <Checkbox
                checked={options.includePhotos}
                onChange={() => handleOptionChange('includePhotos')}
                disabled={photoCount === 0}
              />
            }
            label={`Include Photos (${photoCount})`}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={options.includeAnalysis}
                onChange={() => handleOptionChange('includeAnalysis')}
                disabled={analysisCount === 0}
              />
            }
            label={`Include Analysis (${analysisCount})`}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={options.includeMetadata}
                onChange={() => handleOptionChange('includeMetadata')}
              />
            }
            label="Include Metadata"
          />

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Format
            </Typography>
            <Box className="flex gap-2">
              <Button
                variant={options.format === 'pdf' ? 'contained' : 'outlined'}
                onClick={() => handleFormatChange('pdf')}
                disabled={isExporting}
              >
                PDF
              </Button>
              <Button
                variant={options.format === 'docx' ? 'contained' : 'outlined'}
                onClick={() => handleFormatChange('docx')}
                disabled={isExporting}
              >
                DOCX
              </Button>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isExporting}>
          Cancel
        </Button>
        <Button
          onClick={handleExport}
          variant="contained"
          disabled={isExporting}
          startIcon={isExporting ? <CircularProgress size={20} /> : null}
        >
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportDialog;

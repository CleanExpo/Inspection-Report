'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormControlLabel,
  FormGroup,
  Checkbox,
  RadioGroup,
  Radio,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { ExportFormat, ExportOptions, exportService } from '../../services/exportService';
import { useLoading } from '../../app/providers/LoadingProvider';
import dayjs, { Dayjs } from 'dayjs';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  jobNumber: string;
}

export default function ExportDialog({ open, onClose, jobNumber }: ExportDialogProps) {
  const { showError, showSuccess } = useLoading();
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [options, setOptions] = useState({
    includeReadings: true,
    includeLayout: true,
    includeHistory: false,
  });
  const [dateRange, setDateRange] = useState<{
    start: Dayjs | null;
    end: Dayjs | null;
  }>({
    start: null,
    end: null,
  });
  const [importFile, setImportFile] = useState<File | null>(null);

  const handleExport = async () => {
    try {
      setLoading(true);

      const exportOptions: ExportOptions = {
        format,
        ...options,
        ...(dateRange.start && dateRange.end
          ? {
              dateRange: {
                start: dateRange.start.toDate(),
                end: dateRange.end.toDate(),
              },
            }
          : {}),
      };

      const blob = await exportService.exportData(jobNumber, exportOptions);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inspection-${jobNumber}-${format}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showSuccess('Export completed successfully');
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      showError('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;

    try {
      setLoading(true);

      // Import the data
      await exportService.importData(importFile, jobNumber);

      showSuccess('Data imported successfully');
      onClose();
    } catch (error) {
      console.error('Import validation failed:', error);
      showError(error instanceof Error ? error.message : 'Failed to validate import file');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setImportFile(files[0]);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Export/Import Data</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Export Options
          </Typography>

          {/* Format Selection */}
          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Format
            </Typography>
            <RadioGroup
              row
              value={format}
              onChange={(e) => setFormat(e.target.value as ExportFormat)}
            >
              <FormControlLabel value="csv" control={<Radio />} label="CSV" />
              <FormControlLabel value="pdf" control={<Radio />} label="PDF" />
              <FormControlLabel value="json" control={<Radio />} label="JSON" />
            </RadioGroup>
          </FormControl>

          {/* Data Selection */}
          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Include Data
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.includeReadings}
                    onChange={(e) =>
                      setOptions({ ...options, includeReadings: e.target.checked })
                    }
                  />
                }
                label="Moisture Readings"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.includeLayout}
                    onChange={(e) =>
                      setOptions({ ...options, includeLayout: e.target.checked })
                    }
                  />
                }
                label="Room Layout"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.includeHistory}
                    onChange={(e) =>
                      setOptions({ ...options, includeHistory: e.target.checked })
                    }
                  />
                }
                label="Reading History"
              />
            </FormGroup>
          </FormControl>

          {/* Date Range */}
          {options.includeHistory && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Date Range
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <DatePicker
                  label="Start Date"
                  value={dateRange.start}
                  onChange={(date: Dayjs | null) => 
                    setDateRange({ ...dateRange, start: date })
                  }
                />
                <DatePicker
                  label="End Date"
                  value={dateRange.end}
                  onChange={(date: Dayjs | null) => 
                    setDateRange({ ...dateRange, end: date })
                  }
                  minDate={dateRange.start || undefined}
                />
              </Box>
            </Box>
          )}
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Import Data
          </Typography>
          <TextField
            type="file"
            fullWidth
            onChange={handleFileChange}
            inputProps={{
              accept: '.json,.csv',
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Supported formats: JSON, CSV
          </Typography>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleImport}
          disabled={!importFile || loading}
          variant="outlined"
        >
          Import
        </Button>
        <Button
          onClick={handleExport}
          disabled={
            loading ||
            (!options.includeReadings &&
              !options.includeLayout &&
              !options.includeHistory)
          }
          variant="contained"
        >
          Export
        </Button>
      </DialogActions>
    </Dialog>
  );
}

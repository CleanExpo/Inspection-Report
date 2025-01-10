'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  FileDownload as ExportIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useLoading } from '../../app/providers/LoadingProvider';
import { roomLayoutService, RoomLayout, DrawingElement } from '../../services/roomLayoutService';
import SketchTool from './SketchTool';
import ExportDialog from '../ExportDialog/ExportDialog';

interface MoistureMappingSystemProps {
  jobNumber: string;
}

export default function MoistureMappingSystem({ jobNumber }: MoistureMappingSystemProps) {
  const [layout, setLayout] = useState<RoomLayout | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const { showLoading, hideLoading, showError, showSuccess } = useLoading();

  // Load existing layout on mount
  useEffect(() => {
    loadLayout();
  }, [jobNumber]);

  const loadLayout = async () => {
    try {
      showLoading();
      const existingLayout = await roomLayoutService.getLayout(jobNumber);
      if (existingLayout) {
        setLayout(existingLayout);
      }
    } catch (error) {
      console.error('Failed to load layout:', error);
      showError('Failed to load room layout');
    } finally {
      hideLoading();
    }
  };

  const handleSave = async (elements: DrawingElement[]) => {
    try {
      showLoading();

      if (layout) {
        // Update existing layout
        const updatedLayout = await roomLayoutService.updateLayout(jobNumber, elements);
        setLayout(updatedLayout);
      } else {
        // Create new layout
        const newLayout = await roomLayoutService.createLayout({
          jobNumber,
          elements,
        });
        setLayout(newLayout);
      }

      showSuccess('Room layout saved successfully');
    } catch (error) {
      console.error('Failed to save layout:', error);
      showError('Failed to save room layout');
    } finally {
      hideLoading();
    }
  };

  const handleError = (message: string) => {
    setError(message);
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" gutterBottom>
              Room Layout - Job #{jobNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Use the tools below to create a room layout. Draw walls, add doors and windows,
              and mark moisture readings.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Export Data">
              <IconButton
                color="primary"
                onClick={() => setExportDialogOpen(true)}
              >
                <ExportIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <SketchTool
            initialElements={layout?.elements || []}
            onSave={handleSave}
            width={800}
            height={600}
          />
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Last updated: {layout?.updatedAt ? new Date(layout.updatedAt).toLocaleString() : 'Never'}
          </Typography>
        </Box>
      </Paper>

      <ExportDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        jobNumber={jobNumber}
      />
    </Box>
  );
}

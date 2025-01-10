'use client';

import React, { useRef } from 'react';
import {
  Box,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import UploadIcon from '@mui/icons-material/Upload';
import { APIRequest } from '../../types/api-playground';

interface SaveLoadManagerProps {
  currentRequest: APIRequest;
  onLoadRequest: (request: APIRequest) => void;
}

export default function SaveLoadManager({ currentRequest, onLoadRequest }: SaveLoadManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    const requestData = JSON.stringify(currentRequest, null, 2);
    const blob = new Blob([requestData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `request-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const request = JSON.parse(content) as APIRequest;
        
        // Basic validation
        if (
          typeof request === 'object' &&
          'method' in request &&
          'url' in request &&
          'headers' in request
        ) {
          onLoadRequest(request);
        } else {
          throw new Error('Invalid request format');
        }
      } catch (error) {
        console.error('Failed to load request:', error);
        // You might want to show an error message to the user here
      }
    };
    reader.readAsText(file);

    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".json"
        style={{ display: 'none' }}
      />
      
      <Tooltip title="Save request">
        <IconButton
          onClick={handleSave}
          size="small"
          color="primary"
        >
          <SaveIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Load request">
        <IconButton
          onClick={() => fileInputRef.current?.click()}
          size="small"
          color="primary"
        >
          <UploadIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

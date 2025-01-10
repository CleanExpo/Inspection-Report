'use client';

import React, { useMemo } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import { APIRequest } from '../../types/api-playground';
import HeadersEditor from './HeadersEditor';
import RequestBody from './RequestBody';

interface RequestBuilderProps {
  request: APIRequest;
  onRequestChange: (field: keyof APIRequest, value: string | Record<string, string>) => void;
}

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;

export default function RequestBuilder({ request, onRequestChange }: RequestBuilderProps) {
  const handleMethodChange = (event: SelectChangeEvent) => {
    onRequestChange('method', event.target.value as APIRequest['method']);
  };

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onRequestChange('url', event.target.value);
  };

  const isValidUrl = (url: string): boolean => {
    if (!url) return true; // Empty URL is considered valid for UI purposes
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="http-method-label">Method</InputLabel>
          <Select
            labelId="http-method-label"
            value={request.method}
            label="Method"
            onChange={handleMethodChange}
            size="small"
          >
            {HTTP_METHODS.map((method) => (
              <MenuItem key={method} value={method}>
                {method}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <TextField
          fullWidth
          label="URL"
          value={request.url}
          onChange={handleUrlChange}
          error={!isValidUrl(request.url)}
          helperText={!isValidUrl(request.url) ? 'Invalid URL format' : ''}
          placeholder="https://api.example.com/endpoint"
          size="small"
          sx={{ flex: 1 }}
        />
      </Box>

      <HeadersEditor
        headers={request.headers}
        onHeadersChange={(headers) => onRequestChange('headers', headers)}
      />

      {request.method !== 'GET' && (
        <RequestBody
          body={request.body || ''}
          onBodyChange={(body) => onRequestChange('body', body)}
        />
      )}
    </Box>
  );
}

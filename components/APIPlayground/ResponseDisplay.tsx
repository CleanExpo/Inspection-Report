'use client';

import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Skeleton,
} from '@mui/material';
import { APIResponse } from '../../types/api-playground';
import ResponseBody from './ResponseBody';

interface ResponseDisplayProps {
  response?: APIResponse;
  isLoading?: boolean;
}

const getStatusColor = (status: number): 'success' | 'error' | 'warning' | 'default' => {
  if (status >= 200 && status < 300) return 'success';
  if (status >= 400 && status < 500) return 'error';
  if (status >= 500) return 'error';
  return 'warning';
};

export default function ResponseDisplay({ response, isLoading }: ResponseDisplayProps) {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Skeleton variant="rectangular" height={32} width={200} />
        <Skeleton variant="rectangular" height={200} />
      </Box>
    );
  }

  if (!response) {
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        height: '100%'
      }}>
        <Typography color="text.secondary">
          No response data available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Status Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Chip
          label={response.status}
          color={getStatusColor(response.status)}
          size="small"
        />
        <Typography variant="body2" color="text.secondary">
          {response.statusText}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
          {new Date(response.timestamp).toLocaleTimeString()}
        </Typography>
      </Box>

      {/* Headers Section */}
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Response Headers
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Header</TableCell>
                <TableCell>Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(response.headers).map(([key, value]) => (
                <TableRow key={key}>
                  <TableCell 
                    sx={{ 
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {key}
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                      wordBreak: 'break-all'
                    }}
                  >
                    {value}
                  </TableCell>
                </TableRow>
              ))}
              {Object.keys(response.headers).length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No headers received
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Response Body */}
      <ResponseBody
        body={response.body}
        contentType={response.headers['content-type']}
      />
    </Box>
  );
}

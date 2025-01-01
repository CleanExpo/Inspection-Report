'use client';

import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  FormControl,
  TextField,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface ResponseBodyProps {
  body: string;
  contentType?: string;
}

export default function ResponseBody({ body, contentType }: ResponseBodyProps) {
  const formattedBody = useMemo(() => {
    if (!body) return '';
    
    if (contentType?.includes('application/json')) {
      try {
        return JSON.stringify(JSON.parse(body), null, 2);
      } catch {
        return body; // Return raw if parsing fails
      }
    }
    
    return body;
  }, [body, contentType]);

  const byteSize = useMemo(() => {
    return new Blob([body]).size;
  }, [body]);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedBody);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 1
      }}>
        <Typography variant="subtitle2">
          Response Body
          <Typography 
            component="span" 
            variant="caption" 
            color="text.secondary"
            sx={{ ml: 1 }}
          >
            ({formatBytes(byteSize)})
          </Typography>
        </Typography>
        <Button
          size="small"
          startIcon={<ContentCopyIcon />}
          onClick={handleCopy}
          disabled={!body}
        >
          Copy
        </Button>
      </Box>

      <FormControl fullWidth>
        <TextField
          multiline
          rows={12}
          value={formattedBody}
          InputProps={{
            readOnly: true,
          }}
          sx={{
            '& .MuiInputBase-root': {
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              backgroundColor: (theme) => 
                theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.02)',
            },
          }}
        />
      </FormControl>
    </Box>
  );
}

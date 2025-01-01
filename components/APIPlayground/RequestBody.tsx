'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Typography,
  Button,
  FormControl,
  FormHelperText,
} from '@mui/material';

interface RequestBodyProps {
  body: string;
  onBodyChange: (body: string) => void;
}

export default function RequestBody({ body, onBodyChange }: RequestBodyProps) {
  const [isValidJson, setIsValidJson] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const validateAndFormatJson = () => {
    if (!body.trim()) {
      setIsValidJson(true);
      setErrorMessage('');
      return;
    }

    try {
      const parsed = JSON.parse(body);
      const formatted = JSON.stringify(parsed, null, 2);
      onBodyChange(formatted);
      setIsValidJson(true);
      setErrorMessage('');
    } catch (error) {
      setIsValidJson(false);
      setErrorMessage((error as Error).message);
    }
  };

  useEffect(() => {
    // Validate on initial load and when body changes
    if (body.trim()) {
      try {
        JSON.parse(body);
        setIsValidJson(true);
        setErrorMessage('');
      } catch (error) {
        setIsValidJson(false);
        setErrorMessage((error as Error).message);
      }
    } else {
      setIsValidJson(true);
      setErrorMessage('');
    }
  }, [body]);

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2">
          Request Body
        </Typography>
        <Button
          size="small"
          onClick={validateAndFormatJson}
          disabled={!body.trim()}
        >
          Format JSON
        </Button>
      </Box>

      <FormControl fullWidth error={!isValidJson}>
        <TextField
          multiline
          rows={8}
          value={body}
          onChange={(e) => onBodyChange(e.target.value)}
          placeholder="Enter JSON request body"
          error={!isValidJson}
          sx={{
            '& .MuiInputBase-root': {
              fontFamily: 'monospace',
              fontSize: '0.875rem',
            },
          }}
        />
        {!isValidJson && (
          <FormHelperText error>
            Invalid JSON: {errorMessage}
          </FormHelperText>
        )}
      </FormControl>
    </Box>
  );
}

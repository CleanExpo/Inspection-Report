'use client';

import React, { Component, ErrorInfo } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  useTheme,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface Props {
  children: React.ReactNode;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class MobileMenuErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to your error reporting service
    console.error('Mobile Menu Error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorDisplay
          error={this.state.error}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorDisplayProps {
  error: Error | null;
  onRetry: () => void;
}

function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  const theme = useTheme();

  return (
    <Paper
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        height: '100%',
        bgcolor: theme.palette.error.light,
        color: theme.palette.error.contrastText,
      }}
    >
      <ErrorOutlineIcon sx={{ fontSize: 48 }} />
      <Typography variant="h6" align="center" gutterBottom>
        Something went wrong
      </Typography>
      <Typography variant="body2" align="center" color="inherit">
        {error?.message || 'An unexpected error occurred'}
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={onRetry}
          sx={{
            bgcolor: theme.palette.error.dark,
            '&:hover': {
              bgcolor: theme.palette.error.main,
            },
          }}
        >
          Try Again
        </Button>
      </Box>
      {process.env.NODE_ENV === 'development' && error?.stack && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            bgcolor: 'rgba(0, 0, 0, 0.1)',
            borderRadius: 1,
            overflow: 'auto',
            maxHeight: 200,
            width: '100%',
          }}
        >
          <Typography
            variant="caption"
            component="pre"
            sx={{
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              m: 0,
            }}
          >
            {error.stack}
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

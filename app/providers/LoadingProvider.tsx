'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  Backdrop,
  CircularProgress,
  Snackbar,
  Alert,
  AlertColor,
} from '@mui/material';

interface LoadingContextType {
  isLoading: boolean;
  showLoading: () => void;
  hideLoading: () => void;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  showInfo: (message: string) => void;
}

interface AlertState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  showLoading: () => {},
  hideLoading: () => {},
  showError: () => {},
  showSuccess: () => {},
  showInfo: () => {},
});

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: React.ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState>({
    open: false,
    message: '',
    severity: 'info',
  });

  const showLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const showAlert = useCallback((message: string, severity: AlertColor) => {
    setAlert({
      open: true,
      message,
      severity,
    });
  }, []);

  const handleCloseAlert = useCallback(() => {
    setAlert((prev) => ({ ...prev, open: false }));
  }, []);

  const showError = useCallback((message: string) => {
    showAlert(message, 'error');
  }, [showAlert]);

  const showSuccess = useCallback((message: string) => {
    showAlert(message, 'success');
  }, [showAlert]);

  const showInfo = useCallback((message: string) => {
    showAlert(message, 'info');
  }, [showAlert]);

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        showLoading,
        hideLoading,
        showError,
        showSuccess,
        showInfo,
      }}
    >
      {children}
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          flexDirection: 'column',
          gap: 2,
        }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alert.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </LoadingContext.Provider>
  );
}

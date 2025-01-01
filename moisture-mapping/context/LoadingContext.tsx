import React, { createContext, useContext, useReducer, useCallback } from 'react';
import {
  Backdrop,
  CircularProgress,
  Snackbar,
  Alert,
  AlertColor
} from '@mui/material';

interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
  notifications: {
    id: string;
    message: string;
    type: AlertColor;
    timestamp: number;
  }[];
  pendingOperations: Set<string>;
}

type LoadingAction =
  | { type: 'START_LOADING'; payload?: string }
  | { type: 'STOP_LOADING' }
  | { type: 'ADD_NOTIFICATION'; payload: { message: string; type: AlertColor } }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'START_OPERATION'; payload: string }
  | { type: 'COMPLETE_OPERATION'; payload: string };

interface LoadingContextType {
  state: LoadingState;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
  showNotification: (message: string, type?: AlertColor) => void;
  startOperation: (operationId: string) => void;
  completeOperation: (operationId: string) => void;
  isOperationPending: (operationId: string) => boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

const initialState: LoadingState = {
  isLoading: false,
  loadingMessage: undefined,
  notifications: [],
  pendingOperations: new Set()
};

function loadingReducer(state: LoadingState, action: LoadingAction): LoadingState {
  switch (action.type) {
    case 'START_LOADING':
      return {
        ...state,
        isLoading: true,
        loadingMessage: action.payload
      };

    case 'STOP_LOADING':
      return {
        ...state,
        isLoading: false,
        loadingMessage: undefined
      };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [
          ...state.notifications,
          {
            id: `notification-${Date.now()}`,
            message: action.payload.message,
            type: action.payload.type,
            timestamp: Date.now()
          }
        ]
      };

    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };

    case 'START_OPERATION':
      state.pendingOperations.add(action.payload);
      return {
        ...state,
        pendingOperations: new Set(state.pendingOperations)
      };

    case 'COMPLETE_OPERATION':
      state.pendingOperations.delete(action.payload);
      return {
        ...state,
        pendingOperations: new Set(state.pendingOperations)
      };

    default:
      return state;
  }
}

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(loadingReducer, initialState);

  const startLoading = useCallback((message?: string) => {
    dispatch({ type: 'START_LOADING', payload: message });
  }, []);

  const stopLoading = useCallback(() => {
    dispatch({ type: 'STOP_LOADING' });
  }, []);

  const showNotification = useCallback((message: string, type: AlertColor = 'info') => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: { message, type } });
  }, []);

  const startOperation = useCallback((operationId: string) => {
    dispatch({ type: 'START_OPERATION', payload: operationId });
  }, []);

  const completeOperation = useCallback((operationId: string) => {
    dispatch({ type: 'COMPLETE_OPERATION', payload: operationId });
  }, []);

  const isOperationPending = useCallback(
    (operationId: string) => state.pendingOperations.has(operationId),
    [state.pendingOperations]
  );

  const handleNotificationClose = (notificationId: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: notificationId });
  };

  return (
    <LoadingContext.Provider
      value={{
        state,
        startLoading,
        stopLoading,
        showNotification,
        startOperation,
        completeOperation,
        isOperationPending
      }}
    >
      {children}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={state.isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      {state.notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={6000}
          onClose={() => handleNotificationClose(notification.id)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => handleNotificationClose(notification.id)}
            severity={notification.type}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

// Custom hook for managing async operations with loading state
export function useAsyncOperation<T>(
  operationId: string,
  operation: () => Promise<T>,
  options: {
    loadingMessage?: string;
    successMessage?: string;
    errorMessage?: string;
  } = {}
) {
  const {
    startLoading,
    stopLoading,
    showNotification,
    startOperation,
    completeOperation
  } = useLoading();

  const execute = async () => {
    try {
      startOperation(operationId);
      if (options.loadingMessage) {
        startLoading(options.loadingMessage);
      }

      const result = await operation();

      if (options.successMessage) {
        showNotification(options.successMessage, 'success');
      }

      return result;
    } catch (error) {
      showNotification(
        options.errorMessage || (error as Error).message,
        'error'
      );
      throw error;
    } finally {
      stopLoading();
      completeOperation(operationId);
    }
  };

  return execute;
}

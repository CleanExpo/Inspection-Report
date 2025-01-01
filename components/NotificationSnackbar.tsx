'use client';
import React from 'react';
import { Snackbar, Alert as MuiAlert } from '@mui/material';
import { AlertProps } from '@mui/material/Alert';

interface NotificationSnackbarProps {
  notification: {
    message: string;
    severity: AlertProps['severity'];
  } | null;
  onClose: () => void;
}

const NotificationSnackbar: React.FC<NotificationSnackbarProps> = ({
  notification,
  onClose
}) => {
  if (!notification) {
    return null;
  }

  return (
    <Snackbar
      open={true}
      autoHideDuration={3000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <MuiAlert
        onClose={onClose}
        severity={notification.severity}
        elevation={6}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {notification.message}
      </MuiAlert>
    </Snackbar>
  );
};

export default NotificationSnackbar;

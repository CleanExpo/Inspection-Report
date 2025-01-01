import React, { memo } from 'react';
import { Chip, Tooltip } from '@mui/material';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import { useOfflineStorage } from '../hooks/useOfflineStorage';

const OfflineStatus = memo(function OfflineStatus() {
  const { isOnline, isPending, pendingCount } = useOfflineStorage();

  if (!isOnline) {
    return (
      <Tooltip title="Working offline - readings will sync when connection is restored">
        <Chip
          icon={<CloudOffIcon />}
          label="Offline"
          color="warning"
          variant="outlined"
          size="small"
        />
      </Tooltip>
    );
  }

  if (isPending) {
    return (
      <Tooltip title={`${pendingCount} readings pending synchronization`}>
        <Chip
          icon={<CloudSyncIcon />}
          label="Syncing..."
          color="info"
          variant="outlined"
          size="small"
          sx={{
            '& .MuiSvgIcon-root': {
              animation: 'spin 2s linear infinite',
              '@keyframes spin': {
                '0%': {
                  transform: 'rotate(0deg)',
                },
                '100%': {
                  transform: 'rotate(360deg)',
                },
              },
            },
          }}
        />
      </Tooltip>
    );
  }

  return (
    <Tooltip title="All readings synchronized">
      <Chip
        icon={<CloudDoneIcon />}
        label="Online"
        color="success"
        variant="outlined"
        size="small"
      />
    </Tooltip>
  );
});

export default OfflineStatus;

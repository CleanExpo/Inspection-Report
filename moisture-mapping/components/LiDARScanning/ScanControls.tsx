import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  Typography,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Scanner as ScannerIcon,
  Stop as StopIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { LiDARConfig, ScanStatus } from '../../types/lidar';

interface ScanControlsProps {
  config: LiDARConfig;
  status: ScanStatus;
  onConfigChange: (config: Partial<LiDARConfig>) => void;
  onStartScan: () => void;
  onCancelScan: () => void;
}

export const ScanControls: React.FC<ScanControlsProps> = ({
  config,
  status,
  onConfigChange,
  onStartScan,
  onCancelScan,
}) => {
  const handleQualityChange = (event: any) => {
    onConfigChange({ scanQuality: event.target.value });
  };

  const handleToggleChange = (setting: keyof LiDARConfig) => {
    onConfigChange({ [setting]: !config[setting] });
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Scan Configuration
          </Typography>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Scan Quality</InputLabel>
            <Select
              value={config.scanQuality}
              label="Scan Quality"
              onChange={handleQualityChange}
              disabled={status.isScanning}
            >
              <MenuItem value="quick">Quick (30s)</MenuItem>
              <MenuItem value="standard">Standard (60s)</MenuItem>
              <MenuItem value="detailed">Detailed (120s)</MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={config.autoLevel}
                onChange={() => handleToggleChange('autoLevel')}
                disabled={status.isScanning}
              />
            }
            label="Auto-Level Scan"
          />

          <FormControlLabel
            control={
              <Switch
                checked={config.filterOutliers}
                onChange={() => handleToggleChange('filterOutliers')}
                disabled={status.isScanning}
              />
            }
            label="Filter Outliers"
          />

          <FormControlLabel
            control={
              <Switch
                checked={config.alignToGrid}
                onChange={() => handleToggleChange('alignToGrid')}
                disabled={status.isScanning}
              />
            }
            label="Align to Grid"
          />
        </Box>

        {status.isScanning && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              {status.currentOperation.charAt(0).toUpperCase() + 
               status.currentOperation.slice(1)}...
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={status.progress} 
              sx={{ mb: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              Points collected: {status.pointsCollected.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Time remaining: {Math.ceil(status.estimatedTimeRemaining)}s
            </Typography>
          </Box>
        )}

        {status.error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {status.error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2 }}>
          {!status.isScanning ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<ScannerIcon />}
              onClick={onStartScan}
              fullWidth
            >
              Start Scan
            </Button>
          ) : (
            <Button
              variant="contained"
              color="error"
              startIcon={<StopIcon />}
              onClick={onCancelScan}
              fullWidth
            >
              Cancel Scan
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Stack,
  Button,
  Switch,
  TextField,
  Select,
  MenuItem,
  FormControl,
  FormControlLabel,
  InputLabel,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  CloudUpload as SyncIcon
} from '@mui/icons-material';

import { useAppContext } from '../context/AppContext';
import { useLoading } from '../context/LoadingContext';
import ErrorBoundary from '../components/ErrorBoundary';
import { MATERIAL_GUIDELINES } from '../types/moisture';

interface AppSettings {
  general: {
    theme: 'light' | 'dark' | 'system';
    measurementUnit: 'metric' | 'imperial';
    autoSync: boolean;
    syncInterval: number;
  };
  moisture: {
    warningThreshold: number;
    criticalThreshold: number;
    defaultMaterial: string;
  };
  display: {
    defaultView: '3d' | '2d' | 'slice';
    showThermalOverlay: boolean;
    showStructuralOverlay: boolean;
    animationSpeed: number;
  };
  export: {
    defaultFormat: 'pdf' | 'csv' | 'xlsx';
    includeMeasurements: boolean;
    includePhotos: boolean;
    includeNotes: boolean;
  };
}

export default function SettingsPage() {
  const { state, dispatch } = useAppContext();
  const { showNotification, startLoading, stopLoading } = useLoading();

  // Load settings from localStorage or use defaults
  const [settings, setSettings] = useState<AppSettings>(() => {
    const savedSettings = localStorage.getItem('app-settings');
    return savedSettings ? JSON.parse(savedSettings) : {
      general: {
        theme: 'system',
        measurementUnit: 'metric',
        autoSync: true,
        syncInterval: 5
      },
      moisture: {
        warningThreshold: 20,
        criticalThreshold: 25,
        defaultMaterial: 'Drywall'
      },
      display: {
        defaultView: '3d',
        showThermalOverlay: true,
        showStructuralOverlay: true,
        animationSpeed: 1
      },
      export: {
        defaultFormat: 'pdf',
        includeMeasurements: true,
        includePhotos: true,
        includeNotes: true
      }
    };
  });

  const handleSaveSettings = async () => {
    try {
      startLoading('Saving settings...');
      localStorage.setItem('app-settings', JSON.stringify(settings));
      // Apply settings to app state
      dispatch({ 
        type: 'UPDATE_SETTINGS', 
        payload: settings 
      });
      showNotification('Settings saved successfully', 'success');
    } catch (error) {
      showNotification('Failed to save settings', 'error');
      console.error(error);
    } finally {
      stopLoading();
    }
  };

  const handleResetSettings = () => {
    localStorage.removeItem('app-settings');
    window.location.reload();
  };

  const handleSyncNow = async () => {
    try {
      startLoading('Syncing data...');
      // Implement sync logic
      showNotification('Data synchronized successfully', 'success');
    } catch (error) {
      showNotification('Failed to sync data', 'error');
      console.error(error);
    } finally {
      stopLoading();
    }
  };

  return (
    <ErrorBoundary>
      <Box sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h4">Settings</Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleResetSettings}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveSettings}
            >
              Save Changes
            </Button>
          </Stack>
        </Stack>

        <Grid container spacing={3}>
          {/* General Settings */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                General Settings
              </Typography>
              <Stack spacing={3}>
                <FormControl fullWidth>
                  <InputLabel>Theme</InputLabel>
                  <Select
                    value={settings.general.theme}
                    onChange={(e) => setSettings({
                      ...settings,
                      general: {
                        ...settings.general,
                        theme: e.target.value as AppSettings['general']['theme']
                      }
                    })}
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="system">System</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Measurement Unit</InputLabel>
                  <Select
                    value={settings.general.measurementUnit}
                    onChange={(e) => setSettings({
                      ...settings,
                      general: {
                        ...settings.general,
                        measurementUnit: e.target.value as 'metric' | 'imperial'
                      }
                    })}
                  >
                    <MenuItem value="metric">Metric</MenuItem>
                    <MenuItem value="imperial">Imperial</MenuItem>
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.general.autoSync}
                      onChange={(e) => setSettings({
                        ...settings,
                        general: {
                          ...settings.general,
                          autoSync: e.target.checked
                        }
                      })}
                    />
                  }
                  label="Auto Sync"
                />

                <TextField
                  label="Sync Interval (minutes)"
                  type="number"
                  value={settings.general.syncInterval}
                  onChange={(e) => setSettings({
                    ...settings,
                    general: {
                      ...settings.general,
                      syncInterval: parseInt(e.target.value)
                    }
                  })}
                  disabled={!settings.general.autoSync}
                />

                <Button
                  variant="outlined"
                  startIcon={<SyncIcon />}
                  onClick={handleSyncNow}
                >
                  Sync Now
                </Button>
              </Stack>
            </Paper>
          </Grid>

          {/* Moisture Settings */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Moisture Settings
              </Typography>
              <Stack spacing={3}>
                <TextField
                  label="Warning Threshold (%)"
                  type="number"
                  value={settings.moisture.warningThreshold}
                  onChange={(e) => setSettings({
                    ...settings,
                    moisture: {
                      ...settings.moisture,
                      warningThreshold: parseInt(e.target.value)
                    }
                  })}
                />

                <TextField
                  label="Critical Threshold (%)"
                  type="number"
                  value={settings.moisture.criticalThreshold}
                  onChange={(e) => setSettings({
                    ...settings,
                    moisture: {
                      ...settings.moisture,
                      criticalThreshold: parseInt(e.target.value)
                    }
                  })}
                />

                <FormControl fullWidth>
                  <InputLabel>Default Material</InputLabel>
                  <Select
                    value={settings.moisture.defaultMaterial}
                    onChange={(e) => setSettings({
                      ...settings,
                      moisture: {
                        ...settings.moisture,
                        defaultMaterial: e.target.value as string
                      }
                    })}
                  >
                    {Object.keys(MATERIAL_GUIDELINES).map(material => (
                      <MenuItem key={material} value={material}>
                        {material}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Paper>
          </Grid>

          {/* Display Settings */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Display Settings
              </Typography>
              <Stack spacing={3}>
                <FormControl fullWidth>
                  <InputLabel>Default View</InputLabel>
                  <Select
                    value={settings.display.defaultView}
                    onChange={(e) => setSettings({
                      ...settings,
                      display: {
                        ...settings.display,
                        defaultView: e.target.value as '3d' | '2d' | 'slice'
                      }
                    })}
                  >
                    <MenuItem value="3d">3D View</MenuItem>
                    <MenuItem value="2d">2D View</MenuItem>
                    <MenuItem value="slice">Slice View</MenuItem>
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.display.showThermalOverlay}
                      onChange={(e) => setSettings({
                        ...settings,
                        display: {
                          ...settings.display,
                          showThermalOverlay: e.target.checked
                        }
                      })}
                    />
                  }
                  label="Show Thermal Overlay"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.display.showStructuralOverlay}
                      onChange={(e) => setSettings({
                        ...settings,
                        display: {
                          ...settings.display,
                          showStructuralOverlay: e.target.checked
                        }
                      })}
                    />
                  }
                  label="Show Structural Overlay"
                />

                <TextField
                  label="Animation Speed"
                  type="number"
                  value={settings.display.animationSpeed}
                  onChange={(e) => setSettings({
                    ...settings,
                    display: {
                      ...settings.display,
                      animationSpeed: parseFloat(e.target.value)
                    }
                  })}
                  inputProps={{ step: 0.1, min: 0.1, max: 2 }}
                />
              </Stack>
            </Paper>
          </Grid>

          {/* Export Settings */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Export Settings
              </Typography>
              <Stack spacing={3}>
                <FormControl fullWidth>
                  <InputLabel>Default Export Format</InputLabel>
                  <Select
                    value={settings.export.defaultFormat}
                    onChange={(e) => setSettings({
                      ...settings,
                      export: {
                        ...settings.export,
                        defaultFormat: e.target.value as 'pdf' | 'csv' | 'xlsx'
                      }
                    })}
                  >
                    <MenuItem value="pdf">PDF</MenuItem>
                    <MenuItem value="csv">CSV</MenuItem>
                    <MenuItem value="xlsx">Excel</MenuItem>
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.export.includeMeasurements}
                      onChange={(e) => setSettings({
                        ...settings,
                        export: {
                          ...settings.export,
                          includeMeasurements: e.target.checked
                        }
                      })}
                    />
                  }
                  label="Include Measurements"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.export.includePhotos}
                      onChange={(e) => setSettings({
                        ...settings,
                        export: {
                          ...settings.export,
                          includePhotos: e.target.checked
                        }
                      })}
                    />
                  }
                  label="Include Photos"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.export.includeNotes}
                      onChange={(e) => setSettings({
                        ...settings,
                        export: {
                          ...settings.export,
                          includeNotes: e.target.checked
                        }
                      })}
                    />
                  }
                  label="Include Notes"
                />
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </ErrorBoundary>
  );
}

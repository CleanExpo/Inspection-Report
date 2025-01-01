import React from 'react';
import {
  Paper,
  Typography,
  TextField,
  Grid,
  Switch,
  FormControlLabel,
  Box,
  Button,
  Alert,
  CircularProgress,
  Divider,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import SettingsIcon from '@mui/icons-material/Settings';
import DescriptionIcon from '@mui/icons-material/Description';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';
import { useBusinessSettings } from '../hooks/useBusinessSettings';
import { formatABN } from '../utils/businessConfig';

export default function BusinessSettingsForm() {
  const {
    settings,
    errors,
    isLoading,
    updateSettings,
    resetSettings,
    updateBranding,
    updatePreferences,
    updateReporting
  } = useBusinessSettings();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Form data is managed by the hook, just trigger validation
    updateSettings(settings);
  };

  return (
    <Paper component="form" onSubmit={handleSave} sx={{ p: 3 }}>
      {errors.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle2">Please correct the following errors:</Typography>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BusinessIcon />
          Business Details
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Company Name"
              value={settings.companyName}
              onChange={(e) => updateSettings({ companyName: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="ABN"
              value={settings.abn}
              onChange={(e) => updateSettings({ abn: e.target.value })}
              required
              helperText="Format: XX XXX XXX XXX"
              InputProps={{
                onChange: (e) => {
                  e.target.value = formatABN(e.target.value);
                }
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              value={settings.location.address}
              onChange={(e) => updateSettings({ 
                location: { ...settings.location, address: e.target.value } 
              })}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Suburb"
              value={settings.location.suburb}
              onChange={(e) => updateSettings({ 
                location: { ...settings.location, suburb: e.target.value } 
              })}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="State"
              value={settings.location.state}
              onChange={(e) => updateSettings({ 
                location: { ...settings.location, state: e.target.value } 
              })}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Postcode"
              value={settings.location.postcode}
              onChange={(e) => updateSettings({ 
                location: { ...settings.location, postcode: e.target.value } 
              })}
              required
            />
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ColorLensIcon />
          Branding
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Primary Color"
              value={settings.branding.colors.primary}
              onChange={(e) => updateBranding({ primary: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box 
                      sx={{ 
                        width: 20, 
                        height: 20, 
                        bgcolor: settings.branding.colors.primary,
                        borderRadius: 1
                      }} 
                    />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Secondary Color"
              value={settings.branding.colors.secondary}
              onChange={(e) => updateBranding({ secondary: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box 
                      sx={{ 
                        width: 20, 
                        height: 20, 
                        bgcolor: settings.branding.colors.secondary,
                        borderRadius: 1
                      }} 
                    />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon />
          Preferences
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.preferences.autoFinalizeDays}
                  onChange={(e) => updatePreferences({ 
                    autoFinalizeDays: e.target.checked 
                  })}
                />
              }
              label="Auto-finalize inspection days"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.preferences.requirePhotos}
                  onChange={(e) => updatePreferences({ 
                    requirePhotos: e.target.checked 
                  })}
                />
              }
              label="Require photos for readings"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.preferences.requireNotes}
                  onChange={(e) => updatePreferences({ 
                    requireNotes: e.target.checked 
                  })}
                />
              }
              label="Require notes for readings"
            />
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DescriptionIcon />
          Report Settings
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Logo Position</InputLabel>
              <Select
                value={settings.reporting.logo.position}
                label="Logo Position"
                onChange={(e) => updateReporting({ 
                  logo: { ...settings.reporting.logo, position: e.target.value as any } 
                })}
              >
                <MenuItem value="left">Left</MenuItem>
                <MenuItem value="center">Center</MenuItem>
                <MenuItem value="right">Right</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Logo Size</InputLabel>
              <Select
                value={settings.reporting.logo.size}
                label="Logo Size"
                onChange={(e) => updateReporting({ 
                  logo: { ...settings.reporting.logo, size: e.target.value as any } 
                })}
              >
                <MenuItem value="small">Small</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="large">Large</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.reporting.includeGraphs}
                  onChange={(e) => updateReporting({ 
                    includeGraphs: e.target.checked 
                  })}
                />
              }
              label="Include drying progress graphs"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.reporting.includeMaterialLegend}
                  onChange={(e) => updateReporting({ 
                    includeMaterialLegend: e.target.checked 
                  })}
                />
              }
              label="Include material moisture legend"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.reporting.includeIICRCGuidelines}
                  onChange={(e) => updateReporting({ 
                    includeIICRCGuidelines: e.target.checked 
                  })}
                />
              }
              label="Include IICRC guidelines"
            />
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          startIcon={<RestoreIcon />}
          onClick={resetSettings}
        >
          Reset to Defaults
        </Button>
        <Button
          type="submit"
          variant="contained"
          startIcon={<SaveIcon />}
        >
          Save Settings
        </Button>
      </Box>
    </Paper>
  );
}

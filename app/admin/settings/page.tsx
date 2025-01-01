'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  Switch,
  Select,
  MenuItem,
  FormControl,
  FormControlLabel,
  InputLabel,
  Button,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress,
  Grid,
  Divider,
  Tooltip,
  SvgIcon
} from '@mui/material';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';
import InfoIcon from '@mui/icons-material/Info';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import BackupIcon from '@mui/icons-material/Backup';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { SettingsService } from '../../services/settingsService';
import type { SystemSettings, SettingCategory, SettingField } from '../../types/settings';

const settingsService = SettingsService.getInstance();

const categories: { value: SettingCategory; label: string; icon: typeof SvgIcon }[] = [
  { value: 'general', label: 'General', icon: SettingsIcon },
  { value: 'inspection', label: 'Inspection', icon: AssignmentIcon },
  { value: 'notifications', label: 'Notifications', icon: NotificationsIcon },
  { value: 'integration', label: 'Integrations', icon: IntegrationInstructionsIcon },
  { value: 'security', label: 'Security', icon: SecurityIcon },
  { value: 'backup', label: 'Backup', icon: BackupIcon }
];

export default function SystemSettings() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingCategory>('general');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await settingsService.getSettings();
      setSettings(data);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to load settings',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: SettingCategory) => {
    setActiveTab(newValue);
  };

  const handleSettingChange = (category: SettingCategory, key: string, value: any) => {
    if (!settings) return;

    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value
      }
    });

    // Clear error when value changes
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const validateSettings = (category: SettingCategory): boolean => {
    const fields = settingsService.getSettingFields(category);
    const newErrors: Record<string, string> = {};
    
    fields.forEach(field => {
      if (!settings) return;
      const value = settings[category][field.key as keyof typeof settings[typeof category]];
      const error = settingsService.validateSetting(field, value);
      if (error) {
        newErrors[field.key] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!settings || !validateSettings(activeTab)) return;

    setSaving(true);
    try {
      await settingsService.updateSettings(activeTab, settings[activeTab]);
      setSnackbar({
        open: true,
        message: 'Settings saved successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to save settings',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      await settingsService.resetSettings(activeTab);
      await loadSettings();
      setSnackbar({
        open: true,
        message: 'Settings reset successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to reset settings',
        severity: 'error'
      });
    }
  };

  const renderSettingField = (field: SettingField) => {
    if (!settings) return null;

    const value = settings[field.category][field.key as keyof typeof settings[typeof field.category]];
    const error = errors[field.key];

    switch (field.type) {
      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(value)}
                onChange={(e) => handleSettingChange(field.category, field.key, e.target.checked)}
              />
            }
            label={field.label}
          />
        );

      case 'select':
        return (
          <FormControl fullWidth error={Boolean(error)}>
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={value}
              label={field.label}
              onChange={(e) => handleSettingChange(field.category, field.key, e.target.value)}
            >
              {field.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'password':
        return (
          <TextField
            type="password"
            label={field.label}
            value={value || ''}
            onChange={(e) => handleSettingChange(field.category, field.key, e.target.value)}
            error={Boolean(error)}
            helperText={error}
            fullWidth
          />
        );

      default:
        return (
          <TextField
            type={field.type}
            label={field.label}
            value={value || ''}
            onChange={(e) => handleSettingChange(field.category, field.key, e.target.value)}
            error={Boolean(error)}
            helperText={error}
            fullWidth
          />
        );
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ 
        position: 'sticky', 
        top: 0, 
        bgcolor: 'background.default', 
        zIndex: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        py: 1.5,
        mb: 2
      }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Link href="/admin" style={{ textDecoration: 'none', color: 'inherit' }}>
              <IconButton size="small" sx={{ mr: 2 }}>
                <ArrowBackIcon />
              </IconButton>
            </Link>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SettingsIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Box>
                <Typography variant="h5" component="h1">
                  System Settings
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Configure system preferences and defaults
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pb: 4 }}>
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Tab
                  key={category.value}
                  value={category.value}
                  label={category.label}
                  icon={<Icon />}
                  iconPosition="start"
                />
              );
            })}
          </Tabs>
        </Paper>

        {settings && (
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">
                {categories.find(c => c.value === activeTab)?.label} Settings
              </Typography>
              <Box>
                <Button
                  startIcon={<RestoreIcon />}
                  onClick={handleReset}
                  sx={{ mr: 1 }}
                >
                  Reset
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Box>

            <Grid container spacing={3}>
              {settingsService.getSettingFields(activeTab).map((field) => (
                <Grid item xs={12} sm={6} key={field.key}>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      {field.description && (
                        <Tooltip title={field.description}>
                          <InfoIcon sx={{ mr: 1, color: 'action.active', fontSize: 20 }} />
                        </Tooltip>
                      )}
                    </Box>
                    {renderSettingField(field)}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

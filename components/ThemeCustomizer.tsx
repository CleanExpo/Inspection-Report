'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Slider,
  Switch,
  FormControlLabel,
  TextField,
  Tabs,
  Tab,
  useTheme as useMuiTheme,
} from '@mui/material';
import { ColorLens, Close, Palette, TextFields, Animation } from '@mui/icons-material';
import { useTheme } from '../app/providers/ThemeProvider';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const PRIMARY_COLORS = [
  { value: '#1976d2', label: 'Blue' },
  { value: '#2e7d32', label: 'Green' },
  { value: '#d32f2f', label: 'Red' },
  { value: '#ed6c02', label: 'Orange' },
  { value: '#9c27b0', label: 'Purple' },
];

const SECONDARY_COLORS = [
  { value: '#9c27b0', label: 'Purple' },
  { value: '#ed6c02', label: 'Orange' },
  { value: '#2e7d32', label: 'Green' },
  { value: '#d32f2f', label: 'Red' },
  { value: '#0288d1', label: 'Light Blue' },
];

const FONT_FAMILIES = [
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Inter', label: 'Inter' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Poppins', label: 'Poppins' },
];

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`theme-tabpanel-${index}`}
      aria-labelledby={`theme-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ThemeCustomizer() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const muiTheme = useMuiTheme();
  const { mode, settings, updateSettings } = useTheme();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleColorChange = (type: 'primary' | 'secondary', color: string) => {
    updateSettings({
      [type === 'primary' ? 'primaryColor' : 'secondaryColor']: color,
    });
  };

  const handleFontFamilyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ fontFamily: event.target.value });
  };

  const handleFontSizeChange = (event: Event, value: number | number[]) => {
    updateSettings({ fontSize: value as number });
  };

  const handleAnimationSpeedChange = (event: Event, value: number | number[]) => {
    updateSettings({ animationSpeed: value as number });
  };

  const handleAnimationsToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ enableAnimations: event.target.checked });
  };

  return (
    <>
      <IconButton
        onClick={handleOpen}
        color="inherit"
        aria-label="customize theme"
        sx={{
          ml: 1,
          transition: muiTheme.transitions.create(['transform', 'color'], {
            duration: muiTheme.transitions.duration.shorter,
          }),
          '&:hover': {
            transform: 'rotate(12deg)',
          },
        }}
      >
        <ColorLens />
      </IconButton>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Theme Customization</Typography>
            <IconButton edge="end" color="inherit" onClick={handleClose} aria-label="close">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="theme customization tabs">
            <Tab icon={<Palette />} label="Colors" />
            <Tab icon={<TextFields />} label="Typography" />
            <Tab icon={<Animation />} label="Animation" />
          </Tabs>
        </Box>

        <DialogContent>
          <TabPanel value={activeTab} index={0}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Primary Color
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                {PRIMARY_COLORS.map((color) => (
                  <Box
                    key={color.value}
                    onClick={() => handleColorChange('primary', color.value)}
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: color.value,
                      borderRadius: 1,
                      cursor: 'pointer',
                      border: settings.primaryColor === color.value ? '2px solid' : 'none',
                      borderColor: 'primary.main',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'scale(1.1)',
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Secondary Color
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                {SECONDARY_COLORS.map((color) => (
                  <Box
                    key={color.value}
                    onClick={() => handleColorChange('secondary', color.value)}
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: color.value,
                      borderRadius: 1,
                      cursor: 'pointer',
                      border: settings.secondaryColor === color.value ? '2px solid' : 'none',
                      borderColor: 'secondary.main',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'scale(1.1)',
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Font Size Scale
              </Typography>
              <Slider
                value={settings.fontSize}
                onChange={handleFontSizeChange}
                step={0.1}
                min={0.8}
                max={1.2}
                valueLabelDisplay="auto"
                marks={[
                  { value: 0.8, label: 'Small' },
                  { value: 1, label: 'Default' },
                  { value: 1.2, label: 'Large' },
                ]}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Font Family
              </Typography>
              <TextField
                select
                fullWidth
                value={settings.fontFamily}
                onChange={handleFontFamilyChange}
                SelectProps={{
                  native: true,
                }}
              >
                {FONT_FAMILIES.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </TextField>
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Animation Speed
              </Typography>
              <Slider
                value={settings.animationSpeed}
                onChange={handleAnimationSpeedChange}
                step={0.1}
                min={0.5}
                max={2}
                valueLabelDisplay="auto"
                marks={[
                  { value: 0.5, label: 'Fast' },
                  { value: 1, label: 'Default' },
                  { value: 2, label: 'Slow' },
                ]}
              />
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={settings.enableAnimations}
                  onChange={handleAnimationsToggle}
                  name="enableAnimations"
                />
              }
              label="Enable Animations"
            />
          </TabPanel>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Button,
} from '@mui/material';
import { ExpandMore, ColorLens, TextFields, LineWeight } from '@mui/icons-material';
import { 
  ExportTheme, 
  defaultTheme, 
  professionalTheme, 
  minimalTheme, 
  modernTheme,
  validateTheme,
  mergeTheme 
} from './ExportTheme';

interface ThemeCustomizerProps {
  onThemeChange: (theme: ExportTheme) => void;
  initialTheme?: ExportTheme;
}

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({
  onThemeChange,
  initialTheme = defaultTheme,
}) => {
  const [theme, setTheme] = useState<ExportTheme>(initialTheme);
  const [selectedPreset, setSelectedPreset] = useState<string>('custom');
  const [previewKey, setPreviewKey] = useState(0); // For forcing preview refresh

  const handleColorChange = (colorKey: keyof ExportTheme['colors']) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newTheme = {
      ...theme,
      colors: {
        ...theme.colors,
        [colorKey]: event.target.value,
      },
    };
    if (validateTheme(newTheme)) {
      setTheme(newTheme);
      onThemeChange(newTheme);
      setSelectedPreset('custom');
    }
  };

  const handleTypographyChange = (
    category: 'fontFamily' | 'headingFont',
    value: string
  ) => {
    const newTheme = {
      ...theme,
      typography: {
        ...theme.typography,
        [category]: value,
      },
    };
    if (validateTheme(newTheme)) {
      setTheme(newTheme);
      onThemeChange(newTheme);
      setSelectedPreset('custom');
    }
  };

  const handleFontSizeChange = (size: keyof ExportTheme['typography']['fontSize']) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newTheme = {
      ...theme,
      typography: {
        ...theme.typography,
        fontSize: {
          ...theme.typography.fontSize,
          [size]: event.target.value,
        },
      },
    };
    if (validateTheme(newTheme)) {
      setTheme(newTheme);
      onThemeChange(newTheme);
      setSelectedPreset('custom');
    }
  };

  const handleSpacingChange = (spacing: keyof ExportTheme['spacing']) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newTheme = {
      ...theme,
      spacing: {
        ...theme.spacing,
        [spacing]: event.target.value,
      },
    };
    if (validateTheme(newTheme)) {
      setTheme(newTheme);
      onThemeChange(newTheme);
      setSelectedPreset('custom');
    }
  };

  const resetTheme = () => {
    setTheme(defaultTheme);
    onThemeChange(defaultTheme);
    setSelectedPreset('default');
    setPreviewKey(prev => prev + 1);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Theme Customization</Typography>
          <Button variant="outlined" onClick={resetTheme}>Reset to Default</Button>
        </Box>
        
        <FormControl fullWidth>
          <InputLabel>Theme Preset</InputLabel>
          <Select
            value={selectedPreset}
            onChange={(e) => {
              const preset = e.target.value;
              setSelectedPreset(preset);
              let newTheme: ExportTheme;
              
              switch(preset) {
                case 'professional':
                  newTheme = professionalTheme;
                  break;
                case 'minimal':
                  newTheme = minimalTheme;
                  break;
                case 'modern':
                  newTheme = modernTheme;
                  break;
                case 'default':
                  newTheme = defaultTheme;
                  break;
                default:
                  return; // Keep current custom theme
              }
              
              setTheme(newTheme);
              onThemeChange(newTheme);
              setPreviewKey(prev => prev + 1);
            }}
            label="Theme Preset"
          >
            <MenuItem value="custom">Custom</MenuItem>
            <MenuItem value="default">Default</MenuItem>
            <MenuItem value="professional">Professional</MenuItem>
            <MenuItem value="minimal">Minimal</MenuItem>
            <MenuItem value="modern">Modern</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Theme Preview */}
      <Box sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }} key={previewKey}>
        <Typography variant="overline" sx={{ display: 'block', mb: 1 }}>Theme Preview</Typography>
        <Box sx={{ 
          bgcolor: theme.colors.background,
          color: theme.colors.text,
          p: 2,
          borderRadius: theme.borderRadius,
          boxShadow: theme.boxShadow
        }}>
          <Typography variant="h1" sx={{ 
            fontFamily: theme.typography.headingFont,
            fontSize: theme.typography.fontSize.heading1,
            color: theme.colors.primary,
            mb: 1
          }}>
            Heading 1
          </Typography>
          <Typography variant="h2" sx={{ 
            fontFamily: theme.typography.headingFont,
            fontSize: theme.typography.fontSize.heading2,
            color: theme.colors.secondary,
            mb: 1
          }}>
            Heading 2
          </Typography>
          <Typography sx={{ 
            fontFamily: theme.typography.fontFamily,
            fontSize: theme.typography.fontSize.base,
            mb: 2
          }}>
            This is a preview of how your theme will look in the exported document.
          </Typography>
          <Box sx={{ 
            bgcolor: theme.colors.accent,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.borderRadius,
            p: theme.spacing.medium,
            mb: theme.spacing.large
          }}>
            Sample content block with accent background
          </Box>
        </Box>
      </Box>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ColorLens sx={{ mr: 1 }} />
            <Typography>Colors</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {Object.entries(theme.colors).map(([key, value]) => (
              <Grid item xs={12} sm={6} md={4} key={key}>
                <TextField
                  fullWidth
                  label={key.charAt(0).toUpperCase() + key.slice(1)}
                  type="color"
                  value={value}
                  onChange={handleColorChange(key as keyof ExportTheme['colors'])}
                  sx={{ '& input': { height: 40 } }}
                />
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextFields sx={{ mr: 1 }} />
            <Typography>Typography</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Font Family</InputLabel>
                <Select
                  value={theme.typography.fontFamily}
                  onChange={(e) => handleTypographyChange('fontFamily', e.target.value)}
                  label="Font Family"
                >
                  <MenuItem value="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
                    System Default
                  </MenuItem>
                  <MenuItem value="'Arial', sans-serif">Arial</MenuItem>
                  <MenuItem value="'Times New Roman', serif">Times New Roman</MenuItem>
                  <MenuItem value="'Georgia', serif">Georgia</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {Object.entries(theme.typography.fontSize).map(([key, value]) => (
              <Grid item xs={12} sm={6} md={4} key={key}>
                <TextField
                  fullWidth
                  label={`Font Size: ${key}`}
                  value={value}
                  onChange={handleFontSizeChange(key as keyof ExportTheme['typography']['fontSize'])}
                />
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LineWeight sx={{ mr: 1 }} />
            <Typography>Spacing</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {Object.entries(theme.spacing).map(([key, value]) => (
              <Grid item xs={12} sm={6} md={4} key={key}>
                <TextField
                  fullWidth
                  label={`Spacing: ${key}`}
                  value={value}
                  onChange={handleSpacingChange(key as keyof ExportTheme['spacing'])}
                />
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default ThemeCustomizer;

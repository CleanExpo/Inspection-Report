'use client';

import React from 'react';
import { Box, Container, Typography, Paper, Grid, Button } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import TimelineIcon from '@mui/icons-material/Timeline';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import SensorsIcon from '@mui/icons-material/Sensors';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const features = [
  {
    icon: <DeviceThermostatIcon sx={{ fontSize: 40 }} />,
    title: 'Professional Moisture Meters',
    description: 'Support for industry-leading devices: Delmhorst Navigator Pro, Protimeter MMS2, and Tramex ME5',
  },
  {
    icon: <TimelineIcon sx={{ fontSize: 40 }} />,
    title: 'Progress Tracking',
    description: 'Visual charts and analytics to monitor drying progress over time',
  },
  {
    icon: <CameraAltIcon sx={{ fontSize: 40 }} />,
    title: 'Photo Documentation',
    description: 'Capture and document room conditions with built-in camera support',
  },
  {
    icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
    title: 'AI Analysis',
    description: 'Advanced AI-powered analysis of moisture patterns and room conditions',
  },
  {
    icon: <SensorsIcon sx={{ fontSize: 40 }} />,
    title: 'Multiple Reading Types',
    description: 'Support for WME, RH, Temperature, and GPK measurements',
  },
  {
    icon: <WaterDropIcon sx={{ fontSize: 40 }} />,
    title: 'IICRC Compliant',
    description: 'Following industry standards and guidelines for moisture documentation',
  },
];

export default function Landing() {
  return (
    <ThemeProvider theme={theme}>
      <Box 
        sx={{ 
          minHeight: '100vh',
          background: 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)',
          py: 8
        }}
      >
        <Container maxWidth="lg">
          {/* Hero Section */}
          <Box sx={{ textAlign: 'center', color: 'white', mb: 8 }}>
            <Typography variant="h2" component="h1" gutterBottom sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: 2,
              mb: 4
            }}>
              <WaterDropIcon sx={{ fontSize: 60 }} />
              Moisture Mapping System
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, maxWidth: '800px', mx: 'auto' }}>
              Professional-grade moisture tracking and documentation for water damage restoration
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              sx={{ 
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.9)',
                },
                px: 4,
                py: 2
              }}
              href="/page"
            >
              Start Mapping
            </Button>
          </Box>

          {/* Features Grid */}
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper 
                  sx={{ 
                    p: 3, 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                    }
                  }}
                >
                  <Box sx={{ 
                    color: 'primary.main',
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'rgba(25, 118, 210, 0.1)',
                  }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Device Support Section */}
          <Paper sx={{ mt: 8, p: 4, bgcolor: 'rgba(255,255,255,0.9)' }}>
            <Typography variant="h4" gutterBottom textAlign="center">
              Supported Devices
            </Typography>
            <Grid container spacing={4} justifyContent="center">
              <Grid item xs={12} md={4}>
                <Paper 
                  elevation={3}
                  sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}
                >
                  <DeviceThermostatIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Delmhorst Navigator Pro
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Professional moisture meter with advanced navigation features
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper 
                  elevation={3}
                  sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}
                >
                  <DeviceThermostatIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Protimeter MMS2
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Versatile moisture measurement system
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper 
                  elevation={3}
                  sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}
                >
                  <DeviceThermostatIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Tramex ME5
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    High-precision moisture measurement device
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

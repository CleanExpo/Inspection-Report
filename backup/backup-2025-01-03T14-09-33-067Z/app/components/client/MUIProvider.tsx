'use client';

import React from 'react';
import { Box, Container, CircularProgress } from '@mui/material';

// Export commonly used MUI components to reduce bundle size
export const LoadingSpinner = () => (
  <Box 
    sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      height: '200px'
    }}
  >
    <CircularProgress />
  </Box>
);

export const MainContainer = ({ children }: { children: React.ReactNode }) => (
  <Box 
    component="main"
    sx={{ 
      width: '100%',
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      flexDirection: 'column',
      pb: 4,
      willChange: 'transform',
      transform: 'translateZ(0)'
    }}
  >
    <Container 
      maxWidth="lg"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 4, md: 6 },
        pt: { xs: 4, md: 6 },
        flex: 1
      }}
    >
      {children}
    </Container>
  </Box>
);

export const ContentSection = ({ children }: { children: React.ReactNode }) => (
  <Box 
    component="section" 
    sx={{ 
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      flex: 1
    }}
  >
    {children}
  </Box>
);

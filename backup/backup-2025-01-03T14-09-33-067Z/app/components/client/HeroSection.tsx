'use client';

import React, { memo } from 'react';
import { Box, Typography, Paper, Theme } from '@mui/material';
import dynamic from 'next/dynamic';

// Dynamically import icon with loading state
const AssignmentIcon = dynamic(
  () => import('@mui/icons-material/Assignment'),
  { 
    loading: () => <span className="icon-placeholder" />,
    ssr: false 
  }
);

// Pre-defined styles to reduce runtime calculations
const styles = {
  paper: {
    textAlign: 'center',
    p: 4,
    background: 'transparent',
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-2px)'
    }
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    mb: 4,
    color: 'text.primary',
    fontWeight: 500
  },
  subtitle: {
    mb: 4,
    maxWidth: '800px',
    mx: 'auto',
    color: 'text.secondary',
    lineHeight: 1.6
  },
  gradient: {
    width: '100%',
    height: '4px',
    background: (theme: Theme) => 
      `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
    borderRadius: '2px',
    mt: 4
  },
  iconPlaceholder: {
    width: 60,
    height: 60,
    display: 'inline-block',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: '50%'
  }
};

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
}

function HeroSection({
  title = 'Inspection Report System',
  subtitle = 'Professional inspection management system for comprehensive documentation and reporting'
}: HeroSectionProps) {
  return (
    <Paper 
      elevation={0}
      sx={styles.paper}
    >
      <Typography 
        variant="h3" 
        component="h1" 
        gutterBottom 
        sx={styles.title}
      >
        <AssignmentIcon sx={{ fontSize: 60, color: 'primary.main' }} />
        {title}
      </Typography>
      <Typography 
        variant="h5" 
        sx={styles.subtitle}
      >
        {subtitle}
      </Typography>
      <Box sx={styles.gradient} />
    </Paper>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(HeroSection);

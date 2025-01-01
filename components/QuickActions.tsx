'use client';

import React, { memo } from 'react';
import { Paper, Typography, Grid, Button } from '@mui/material';
import dynamic from 'next/dynamic';

// Dynamically import icons with loading states
const AssignmentIcon = dynamic(() => import('@mui/icons-material/Assignment'), { 
  loading: () => <span className="icon-placeholder" />,
  ssr: false 
});
const DescriptionIcon = dynamic(() => import('@mui/icons-material/Description'), { 
  loading: () => <span className="icon-placeholder" />,
  ssr: false 
});
const PhotoLibraryIcon = dynamic(() => import('@mui/icons-material/PhotoLibrary'), { 
  loading: () => <span className="icon-placeholder" />,
  ssr: false 
});

// Define button configurations
const QUICK_ACTIONS = [
  {
    label: 'New Inspection',
    Icon: AssignmentIcon,
    variant: 'contained',
    key: 'new'
  },
  {
    label: 'Recent Reports',
    Icon: DescriptionIcon,
    variant: 'outlined',
    key: 'reports'
  },
  {
    label: 'Photo Gallery',
    Icon: PhotoLibraryIcon,
    variant: 'outlined',
    key: 'gallery'
  }
] as const;

interface QuickActionsProps {
  onNewInspection?: () => void;
  onViewReports?: () => void;
  onViewGallery?: () => void;
}

function QuickActions({ 
  onNewInspection = () => window.location.href = '/inspection/new',
  onViewReports = () => window.location.href = '/inspection/reports',
  onViewGallery = () => window.location.href = '/photos'
}: QuickActionsProps) {
  // Create a map of action handlers
  const actionHandlers = React.useMemo(() => ({
    new: onNewInspection,
    reports: onViewReports,
    gallery: onViewGallery
  }), [onNewInspection, onViewReports, onViewGallery]);

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        mt: 8, 
        p: 4, 
        bgcolor: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(10px)',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)'
        }
      }}
    >
      <Typography 
        variant="h5" 
        gutterBottom 
        textAlign="center"
        sx={{ 
          fontWeight: 500,
          mb: 3
        }}
      >
        Quick Actions
      </Typography>
      <Grid 
        container 
        spacing={2} 
        justifyContent="center"
        sx={{ 
          '& .icon-placeholder': {
            width: 24,
            height: 24,
            display: 'inline-block',
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: '50%'
          }
        }}
      >
        {QUICK_ACTIONS.map(({ label, Icon, variant, key }) => (
          <Grid item key={key}>
            <Button
              variant={variant}
              startIcon={<Icon />}
              onClick={actionHandlers[key]}
              sx={{ 
                minWidth: 160,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)'
                }
              }}
            >
              {label}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(QuickActions);

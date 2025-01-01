import React from 'react';
import { Box, Typography, Paper, SxProps, Theme } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  containerStyles?: SxProps<Theme>;
  titleStyles?: SxProps<Theme>;
  subtitleStyles?: SxProps<Theme>;
}

export default function HeroSection({
  title = 'Inspection Report System',
  subtitle = 'Professional inspection management system for comprehensive documentation and reporting',
  icon = <AssignmentIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
  containerStyles = {},
  titleStyles = {},
  subtitleStyles = {}
}: HeroSectionProps) {
  return (
    <Paper 
      elevation={0}
      sx={{ 
        textAlign: 'center',
        p: 4,
        background: 'transparent',
        ...containerStyles 
      }}
    >
      <Typography 
        variant="h3" 
        component="h1" 
        gutterBottom 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: 2,
          mb: 4,
          color: 'text.primary',
          ...titleStyles
        }}
      >
        {icon}
        {title}
      </Typography>
      <Typography 
        variant="h5" 
        sx={{ 
          mb: 4, 
          maxWidth: '800px', 
          mx: 'auto',
          color: 'text.secondary',
          ...subtitleStyles 
        }}
      >
        {subtitle}
      </Typography>
      <Box 
        sx={{ 
          width: '100%',
          height: '4px',
          background: (theme) => 
            `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          borderRadius: '2px',
          mt: 4
        }} 
      />
    </Paper>
  );
}

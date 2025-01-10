import React from 'react';
import { Paper, Box, Typography } from '@mui/material';

export interface InspectionSection {
  icon: React.ReactNode;
  title: string;
  description: string;
  path: string;
}

interface InspectionSectionCardProps extends InspectionSection {
  onClick?: (path: string) => void;
  customStyles?: React.CSSProperties;
}

export default function InspectionSectionCard({ 
  icon, 
  title, 
  description, 
  path,
  onClick = (path) => window.location.href = path,
  customStyles = {}
}: InspectionSectionCardProps) {
  return (
    <Paper 
      sx={{ 
        p: 3, 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        transition: 'transform 0.2s',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-5px)',
          bgcolor: 'rgba(255,255,255,0.9)',
        },
        ...customStyles
      }}
      onClick={() => onClick(path)}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick(path);
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
        {icon}
      </Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {description}
      </Typography>
    </Paper>
  );
}

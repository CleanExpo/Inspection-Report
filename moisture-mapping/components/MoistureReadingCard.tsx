import React from 'react';
import { Paper, Typography, Box, Tooltip, Alert } from '@mui/material';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import WarningIcon from '@mui/icons-material/Warning';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CategoryIcon from '@mui/icons-material/Category';
import NotesIcon from '@mui/icons-material/Notes';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { MoistureReading } from '../types/moisture';
import { getMoistureColor, getMoistureTextColor } from './MoistureLegend';
import { formatTime } from '../utils/dateUtils';
import { useAustralianTerms } from '../hooks/useAustralianTerms';
import { useIICRCCompliance } from '../hooks/useIICRCCompliance';

interface MoistureReadingCardProps {
  reading: MoistureReading;
  readings: MoistureReading[];
}

export default function MoistureReadingCard({ reading, readings }: MoistureReadingCardProps) {
  const { 
    getMaterialName, 
    getDeviceName, 
    getMeasurementUnit,
    getStatusTerm,
    getAustralianTerm
  } = useAustralianTerms();
  
  const { getReadingValidation } = useIICRCCompliance(readings);
  const validation = getReadingValidation(reading.id);
  
  const severityColor = getMoistureColor(reading.value, reading.materialType);
  const textColor = getMoistureTextColor(reading.value);
  const materialName = getMaterialName(reading.materialType);
  const deviceName = getDeviceName(reading.device.name);
  const unit = getMeasurementUnit('moisture');

  return (
    <Paper 
      sx={{ 
        p: 2, 
        bgcolor: severityColor,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3
        }
      }}
      elevation={validation.isValid ? 2 : 3}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: validation.isValid ? 0 : 1 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            color: textColor,
            fontWeight: 'bold'
          }}
        >
          <WaterDropIcon fontSize="small" />
          {reading.value}{unit}
          {!validation.isValid && (
            <Tooltip title={validation.message} placement="top">
              <WarningIcon 
                sx={{ 
                  ml: 1,
                  color: 'warning.main',
                  fontSize: '1.2rem'
                }} 
              />
            </Tooltip>
          )}
        </Typography>
        <Tooltip title={getAustralianTerm('readingMethod', 'surface')} placement="top">
          <Typography 
            variant="caption" 
            sx={{ 
              bgcolor: 'rgba(0,0,0,0.1)', 
              px: 1, 
              py: 0.5, 
              borderRadius: 1,
              color: textColor
            }}
          >
            {getAustralianTerm('readingMethod', reading.readingMethod.name)}
          </Typography>
        </Tooltip>
      </Box>
      
      {!validation.isValid && (
        <Alert 
          severity="warning" 
          sx={{ 
            py: 0.5,
            mb: 1,
            '& .MuiAlert-message': {
              padding: '0px'
            }
          }}
        >
          {validation.message}
        </Alert>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <DeviceHubIcon fontSize="small" color="action" />
        <Typography variant="body2">
          {deviceName}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LocationOnIcon fontSize="small" color="action" />
        <Typography variant="body2" color="text.secondary">
          {reading.location}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CategoryIcon fontSize="small" color="action" />
        <Typography variant="body2" color="text.secondary">
          {materialName}
        </Typography>
      </Box>

      {reading.notes && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NotesIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {reading.notes}
          </Typography>
        </Box>
      )}

      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        mt: 1,
        pt: 1,
        borderTop: '1px solid rgba(0,0,0,0.1)'
      }}>
        <AccessTimeIcon fontSize="small" color="action" />
        <Typography variant="caption" color="text.secondary">
          {formatTime(reading.timestamp)}
        </Typography>
      </Box>
    </Paper>
  );
}

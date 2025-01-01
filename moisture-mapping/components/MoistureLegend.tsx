import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Tooltip, 
  IconButton,
  Collapse,
  Grid
} from '@mui/material';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { MATERIAL_GUIDELINES } from '../types/moisture';

interface MoistureLegendProps {
  selectedMaterial?: string;
  currentReading?: number;
}

export default function MoistureLegend({ 
  selectedMaterial, 
  currentReading
}: MoistureLegendProps) {
  const [expanded, setExpanded] = React.useState(false);

  const getMaterialGuidelines = (material: string) => {
    return MATERIAL_GUIDELINES[material as keyof typeof MATERIAL_GUIDELINES];
  };

  const getCurrentStatus = (value: number, material: string) => {
    const guidelines = getMaterialGuidelines(material);
    if (!guidelines) return 'unknown';

    if (value <= guidelines.dryStandard) return 'dry';
    if (value <= guidelines.warningThreshold) return 'warning';
    return 'critical';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'dry': return '#4caf50';
      case 'warning': return '#ff9800';
      case 'critical': return '#f44336';
      default: return '#757575';
    }
  };

  const renderMaterialGuidelines = (material: string) => {
    const guidelines = getMaterialGuidelines(material);
    if (!guidelines) return null;

    const levels = [
      { 
        label: 'Dry', 
        value: guidelines.dryStandard,
        color: '#4caf50',
        icon: <CheckCircleIcon />,
        description: `Below ${guidelines.dryStandard}% - Safe level per IICRC S500`
      },
      { 
        label: 'Warning', 
        value: guidelines.warningThreshold,
        color: '#ff9800',
        icon: <WarningIcon />,
        description: `${guidelines.dryStandard}% - ${guidelines.warningThreshold}% - Monitor closely`
      },
      { 
        label: 'Critical', 
        value: guidelines.criticalThreshold,
        color: '#f44336',
        icon: <WaterDropIcon />,
        description: `Above ${guidelines.criticalThreshold}% - ${guidelines.remediation}`
      }
    ];

    return (
      <Box sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          {levels.map((level) => (
            <Grid item xs={12} sm={4} key={level.label}>
              <Tooltip 
                title={
                  <Box>
                    <Typography variant="body2">{level.description}</Typography>
                  </Box>
                }
                arrow
              >
                <Paper
                  elevation={currentReading !== undefined && 
                    getCurrentStatus(currentReading, material) === level.label.toLowerCase() ? 3 : 1}
                  sx={{
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: level.color,
                    position: 'relative',
                    ...(currentReading !== undefined && 
                      getCurrentStatus(currentReading, material) === level.label.toLowerCase() && {
                        bgcolor: `${level.color}10`,
                        boxShadow: `0 0 0 1px ${level.color}`
                      })
                  }}
                >
                  <Box sx={{ color: level.color }}>
                    {level.icon}
                  </Box>
                  <Box>
                    <Typography variant="body2" color={level.color} fontWeight="medium">
                      {level.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {level.description.split(' - ')[0]}
                    </Typography>
                  </Box>
                </Paper>
              </Tooltip>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WaterDropIcon color="primary" />
          Moisture Guidelines
          <Tooltip title="Based on IICRC S500 Standard Guidelines">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Typography>
        <IconButton
          onClick={() => setExpanded(!expanded)}
          sx={{
            transform: expanded ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s'
          }}
        >
          <ExpandMoreIcon />
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        {selectedMaterial ? (
          <>
            {renderMaterialGuidelines(selectedMaterial)}
            
            {currentReading !== undefined && (
              <Box sx={{ mt: 2, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Current Reading: 
                  <Typography
                    component="span"
                    fontWeight="medium"
                    color={getStatusColor(getCurrentStatus(currentReading, selectedMaterial))}
                    sx={{ ml: 1 }}
                  >
                    {currentReading}%
                  </Typography>
                </Typography>
              </Box>
            )}

            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              {getMaterialGuidelines(selectedMaterial)?.description}
            </Typography>
          </>
        ) : (
          <Typography color="text.secondary">
            Select a material type to view guidelines
          </Typography>
        )}
      </Collapse>
    </Paper>
  );
}

export const getMoistureColor = (value: number, material: string): string => {
  const guidelines = MATERIAL_GUIDELINES[material as keyof typeof MATERIAL_GUIDELINES];
  if (!guidelines) return '#757575';

  if (value > guidelines.criticalThreshold) return '#f44336';
  if (value > guidelines.warningThreshold) return '#ff9800';
  if (value > guidelines.dryStandard) return '#fdd835';
  return '#4caf50';
};

export const getMoistureStatus = (value: number, material: string): string => {
  const guidelines = MATERIAL_GUIDELINES[material as keyof typeof MATERIAL_GUIDELINES];
  if (!guidelines) return 'unknown';

  if (value > guidelines.criticalThreshold) return 'critical';
  if (value > guidelines.warningThreshold) return 'warning';
  if (value > guidelines.dryStandard) return 'elevated';
  return 'dry';
};

// Function to determine if a color is light or dark
const isLightColor = (color: string): boolean => {
  // Convert hex to RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
};

export const getMoistureTextColor = (value: number): string => {
  const bgColor = getMoistureColor(value, 'Wood'); // Use Wood as default material
  return isLightColor(bgColor) ? '#000000' : '#ffffff';
};

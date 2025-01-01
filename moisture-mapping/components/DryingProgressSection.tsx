import React from 'react';
import { 
  Paper, 
  Typography, 
  Box,
  Alert,
  Collapse,
  IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useAustralianTerms } from '../hooks/useAustralianTerms';
import { useIICRCCompliance } from '../hooks/useIICRCCompliance';
import { useState } from 'react';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import DryingProgressChart from './DryingProgressChart';
import { MoistureReading } from '../types/moisture';

interface DryingProgressSectionProps {
  progress: any; // Replace with proper type from calculateDryingProgressData
  readings: MoistureReading[];
}

export default function DryingProgressSection({
  progress,
  readings
}: DryingProgressSectionProps) {
  const { getMeasurementUnit, getAustralianTerm } = useAustralianTerms();
  const { dryingValidation } = useIICRCCompliance(readings);
  const [showWarnings, setShowWarnings] = useState(true);
  const moistureUnit = getMeasurementUnit('moisture');
  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WaterDropIcon />
          {getAustralianTerm('status', 'dry')}ing Progress ({moistureUnit})
        </Typography>
        {dryingValidation.warnings.length > 0 && (
          <IconButton 
            size="small" 
            onClick={() => setShowWarnings(!showWarnings)}
            sx={{ ml: 1 }}
          >
            {showWarnings ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        )}
      </Box>

      <Collapse in={showWarnings}>
        {dryingValidation.warnings.map((warning, index) => (
          <Alert 
            key={index}
            severity="warning"
            sx={{ mb: 2 }}
          >
            {warning}
          </Alert>
        ))}
      </Collapse>
      <DryingProgressChart 
        progress={progress} 
        readings={readings}
      />
    </Paper>
  );
}

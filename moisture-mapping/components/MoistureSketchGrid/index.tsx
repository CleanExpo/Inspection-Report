import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { SketchEditor } from './SketchEditor';
import { useAustralianTerms } from '../../hooks/useAustralianTerms';

interface MoistureSketchGridProps {
  roomId: string;
  currentInspectionDay?: number;
}

export const MoistureSketchGrid: React.FC<MoistureSketchGridProps> = ({ 
  roomId,
  currentInspectionDay = 1
}) => {
  const { getAustralianTerm } = useAustralianTerms();

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {getAustralianTerm('measurement', 'moisture')} Sketch Map
      </Typography>
      <Box sx={{ mt: 2 }}>
        <SketchEditor 
          sketchId={`room-${roomId}-sketch`}
          width={800}
          height={600}
          gridSize={20}
          currentInspectionDay={currentInspectionDay}
        />
      </Box>
    </Paper>
  );
};

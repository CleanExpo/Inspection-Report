import React from 'react';
import { Container, Typography, Paper } from '@mui/material';
import { MoistureSketchGrid } from '../components/MoistureSketchGrid';

export default function TestMoistureMap() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Moisture Mapping Test
        </Typography>
        <Typography variant="body1" paragraph>
          Use the tools on the left to draw, add moisture readings, or upload photos.
        </Typography>
      </Paper>
      
      <MoistureSketchGrid 
        roomId="test-room-1"
        currentInspectionDay={1}
      />
    </Container>
  );
}

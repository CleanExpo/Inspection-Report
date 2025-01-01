'use client';

import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import HazardousMaterials from '../../components/HazardousMaterials';

export default function HazardsPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <WarningIcon sx={{ fontSize: 40, color: 'error.main' }} />
          Hazardous Materials Assessment
        </Typography>
        <Typography color="text.secondary" paragraph>
          Identify and assess hazardous materials present at the site
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <HazardousMaterials />
      </Paper>
    </Container>
  );
}

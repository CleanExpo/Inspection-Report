'use client';

import React from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';
import MoistureMappingSystem from '../../../../components/MoistureMappingSystem/MoistureMappingSystem';
import { useLoading } from '../../../providers/LoadingProvider';

interface MoistureMappingPageProps {
  params: {
    jobNumber: string;
  };
}

export default function MoistureMappingPage({ params }: MoistureMappingPageProps) {
  const { jobNumber } = params;
  const { showError } = useLoading();

  // Basic job number validation
  if (!jobNumber || !/^\d{6,}$/.test(jobNumber)) {
    showError('Invalid job number format');
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography color="error" variant="h6">
            Invalid Job Number
          </Typography>
          <Typography color="text.secondary">
            Please provide a valid job number to access the moisture mapping system.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Moisture Mapping
        </Typography>
        <Typography color="text.secondary">
          Create and manage room layouts and moisture readings for job #{jobNumber}.
        </Typography>
      </Box>

      <MoistureMappingSystem jobNumber={jobNumber} />
    </Container>
  );
}

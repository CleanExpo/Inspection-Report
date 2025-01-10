'use client';

import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import PerformanceDashboard from '../../components/PerformanceDashboard/PerformanceDashboard';

export default function PerformancePage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          System Performance
        </Typography>
        <Typography color="text.secondary">
          Monitor application performance metrics, memory usage, and error logs in real-time.
        </Typography>
      </Box>

      <PerformanceDashboard />
    </Container>
  );
}

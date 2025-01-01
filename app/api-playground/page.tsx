import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import APIPlayground from '../../components/APIPlayground/APIPlayground';

export const metadata = {
  title: 'API Playground | Inspection Report',
  description: 'Test and explore the Inspection Report API endpoints',
};

export default function APIPlaygroundPage() {
  return (
    <Container maxWidth={false} sx={{ height: '100vh', py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          API Playground
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Test and explore the Inspection Report API endpoints. Use this interface to send requests,
          view responses, and understand the API functionality.
        </Typography>
      </Box>

      <Box sx={{ height: 'calc(100vh - 200px)' }}>
        <APIPlayground />
      </Box>
    </Container>
  );
}

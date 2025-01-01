import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';

export default function EquipmentPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <BuildIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          Equipment Management
        </Typography>
        <Typography color="text.secondary" paragraph>
          Track and manage equipment recommendations and usage
        </Typography>
      </Box>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Coming Soon
        </Typography>
        <Typography color="text.secondary">
          The equipment management system is currently being integrated. Check back soon for full functionality.
        </Typography>
      </Paper>
    </Container>
  );
}

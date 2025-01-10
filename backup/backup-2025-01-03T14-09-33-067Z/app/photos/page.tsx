import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';

export default function PhotosPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <PhotoLibraryIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          Photos & Documents
        </Typography>
        <Typography color="text.secondary" paragraph>
          Manage and organize inspection photos and documentation
        </Typography>
      </Box>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Coming Soon
        </Typography>
        <Typography color="text.secondary">
          The photo management system is currently being integrated. Check back soon for full functionality.
        </Typography>
      </Paper>
    </Container>
  );
}

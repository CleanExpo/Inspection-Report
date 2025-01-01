'use client';

import dynamic from 'next/dynamic';
import { Box, Container } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Create theme outside of component
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Dynamically import the main content component to avoid SSR issues
const MoistureMappingContent = dynamic(
  () => import('../components/MoistureMappingContent'),
  { ssr: false }
);

export default function Home() {
  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <MoistureMappingContent />
        </Box>
      </Container>
    </ThemeProvider>
  );
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  IconButton,
  Chip,
  Stack,
  CircularProgress
} from '@mui/material';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import BusinessIcon from '@mui/icons-material/Business';
import SecurityIcon from '@mui/icons-material/Security';
import WorkIcon from '@mui/icons-material/Work';
import { templates } from '../../data/templates';
import { Template } from '../../types/templates';

export default function InspectionTemplates() {
  const router = useRouter();
  const [jobNumber, setJobNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const handleTemplateSelect = async (templateId: string) => {
    if (!jobNumber.trim()) {
      setError('Please enter an ASCORA job number');
      return;
    }

    setVerifying(true);
    setError(null);
    setSelectedTemplateId(templateId);

    try {
      // Verify job number with ASCORA
      const response = await fetch(`/api/ascora/verify-job?number=${encodeURIComponent(jobNumber)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid job number');
      }

      // If valid, proceed to inspection form
      setLoading(true);
      router.push(`/inspection/new?template=${templateId}&job=${encodeURIComponent(jobNumber)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify job number');
      setVerifying(false);
      setSelectedTemplateId(null);
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ 
        position: 'sticky', 
        top: 0, 
        bgcolor: 'background.default', 
        zIndex: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        py: 1.5,
        mb: 2
      }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Link href="/admin" style={{ textDecoration: 'none', color: 'inherit' }}>
                <IconButton size="small" sx={{ mr: 2 }}>
                  <ArrowBackIcon />
                </IconButton>
              </Link>
              <Box>
                <Typography variant="h5" component="h1">
                  Inspection Templates
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Select template type for inspection
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* ASCORA Job Number Input */}
        <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <WorkIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">ASCORA Job Details</Typography>
          </Box>
          <Box sx={{ position: 'relative' }}>
            <TextField
              fullWidth
              label="ASCORA Job Number"
              value={jobNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value.toUpperCase();
                setJobNumber(value);
                if (value) {
                  setError(null);
                  setSelectedTemplateId(null);
                }
              }}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter' && jobNumber.trim()) {
                  const template = templates.find(t => t.category === 'Commercial');
                  if (template) {
                    handleTemplateSelect(template.id);
                  }
                }
              }}
              placeholder="Enter ASCORA job number (e.g., ASC-2024-001)"
              error={Boolean(error)}
              helperText={error}
              disabled={verifying || loading}
              sx={{ mb: error ? 0 : 2 }}
              InputProps={{
                endAdornment: verifying && (
                  <Box sx={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
                    <CircularProgress size={20} />
                  </Box>
                ),
              }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Enter the ASCORA job number to auto-populate inspection details
          </Typography>
        </Paper>

        <Grid container spacing={2}>
          {templates.map((template: Template) => (
            <Grid item xs={12} key={template.id}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  border: '1px solid', 
                  borderColor: 'divider',
                  cursor: jobNumber && !verifying && !loading ? 'pointer' : 'not-allowed',
                  opacity: jobNumber && !verifying && !loading ? 1 : 0.7,
                  position: 'relative',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    bgcolor: jobNumber && !verifying && !loading ? 'action.hover' : undefined,
                    transform: jobNumber && !verifying && !loading ? 'translateY(-2px)' : undefined,
                  }
                }}
                onClick={() => jobNumber && !verifying && !loading && handleTemplateSelect(template.id)}
              >
                {(verifying || loading) && selectedTemplateId === template.id && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(255, 255, 255, 0.8)',
                      zIndex: 1,
                      borderRadius: 1,
                    }}
                  >
                    <CircularProgress />
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      {template.category === 'Residential' ? (
                        <HomeIcon sx={{ mr: 1, color: 'primary.main' }} fontSize="small" />
                      ) : (
                        <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} fontSize="small" />
                      )}
                      <Typography variant="h6">
                        {template.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {template.description}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Chip
                        icon={template.category === 'Residential' ? <HomeIcon /> : <BusinessIcon />}
                        label={template.category}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Stack>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {template.sections[0].insuranceTypes.map((insurance: string) => (
                        <Chip
                          key={insurance}
                          icon={<SecurityIcon />}
                          label={insurance}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.75rem', mb: 1 }}
                        />
                      ))}
                    </Stack>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

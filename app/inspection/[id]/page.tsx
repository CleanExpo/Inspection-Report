'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Stack,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ConstructionIcon from '@mui/icons-material/Construction';

interface Inspection {
  id: string;
  createdAt: string;
  status: string;
  templateId: string;
  insurance: {
    selectedTypes: string[];
    policies: Array<{
      type: string;
      policyNumber: string;
    }>;
  };
  propertyDetails: {
    type: string;
    address: {
      street: string;
      suburb: string;
      state: string;
      postcode: string;
    };
    buildingDetails: {
      yearBuilt: string;
      totalFloors: number;
      totalUnits: number;
      constructionType: string;
      lastInspectionDate: string;
    };
  };
  sections: Array<{
    id: string;
    title: string;
    completed: boolean;
    data: any;
  }>;
  autoPopulated: {
    insurance: boolean;
    propertyDetails: boolean;
    buildingDetails: boolean;
  };
  requiredInput: string[];
}

export default function InspectionPage({ params }: { params: { id: string } }) {
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInspection = async () => {
      try {
        const response = await fetch(`/api/inspections/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch inspection');
        }
        const data = await response.json();
        setInspection(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchInspection();
  }, [params.id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !inspection) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          {error || 'Inspection not found'}
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Stack spacing={3}>
          {/* Header */}
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h5" gutterBottom>
              Inspection Report
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Chip
                icon={<BusinessIcon />}
                label={inspection.propertyDetails.type}
                color="primary"
                variant="outlined"
              />
              <Typography variant="body2" color="text.secondary">
                Created: {new Date(inspection.createdAt).toLocaleDateString()}
              </Typography>
              <Chip
                label={inspection.status.toUpperCase()}
                color={inspection.status === 'draft' ? 'warning' : 'success'}
                size="small"
              />
            </Stack>
          </Paper>

          {/* Auto-populated Sections */}
          <Grid container spacing={3}>
            {/* Insurance Section */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Insurance Coverage</Typography>
                </Box>
                <Stack spacing={2}>
                  {inspection.insurance.policies.map((policy) => (
                    <Box key={policy.type}>
                      <Typography variant="subtitle2" gutterBottom>
                        {policy.type}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Policy Number: {policy.policyNumber}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Grid>

            {/* Property Details Section */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationOnIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Property Details</Typography>
                </Box>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Address
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {inspection.propertyDetails.address.street}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {inspection.propertyDetails.address.suburb}, {inspection.propertyDetails.address.state} {inspection.propertyDetails.address.postcode}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            {/* Building Details Section */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ConstructionIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Building Details</Typography>
                </Box>
                <Stack spacing={2}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Year Built
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {inspection.propertyDetails.buildingDetails.yearBuilt}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Construction Type
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {inspection.propertyDetails.buildingDetails.constructionType}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Total Floors
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {inspection.propertyDetails.buildingDetails.totalFloors}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Total Units
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {inspection.propertyDetails.buildingDetails.totalUnits}
                      </Typography>
                    </Grid>
                  </Grid>
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          {/* Auto-population Status */}
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom>
              Auto-Population Status
            </Typography>
            <Stack direction="row" spacing={2}>
              {Object.entries(inspection.autoPopulated).map(([key, value]) => (
                <Chip
                  key={key}
                  label={key.replace(/([A-Z])/g, ' $1').trim()}
                  color={value ? 'success' : 'default'}
                  variant={value ? 'filled' : 'outlined'}
                />
              ))}
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}

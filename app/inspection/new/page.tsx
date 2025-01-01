'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Stack,
  FormControl,
  FormControlLabel,
  Checkbox,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import SecurityIcon from '@mui/icons-material/Security';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';

interface InsurancePolicy {
  type: string;
  policyNumber: string;
  provider: string;
  expiryDate: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: 'Residential' | 'Commercial';
  sections: TemplateSection[];
}

interface TemplateSection {
  id: string;
  title: string;
  description: string;
  insuranceTypes: string[];
}

interface JobDetails {
  jobNumber: string;
  status: string;
  propertyType: string;
  client: {
    name: string;
    contact?: string;
    phone: string;
    email: string;
  };
  property: {
    address: {
      street: string;
      suburb: string;
      state: string;
      postcode: string;
    };
    buildingDetails: {
      yearBuilt: string;
      totalFloors?: number;
      totalUnits?: number;
      constructionType: string;
      lastInspectionDate: string;
    };
  };
  insurance: {
    policies: InsurancePolicy[];
  };
}

export default function NewInspection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams?.get('template') || '';
  const jobNumber = searchParams?.get('job') || '';
  
  const [template, setTemplate] = useState<Template | null>(null);
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [selectedInsurance, setSelectedInsurance] = useState<string[]>([]);
  const [policyNumbers, setPolicyNumbers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!templateId || !jobNumber) {
        setError('Missing template or job number');
        setLoading(false);
        return;
      }

      try {
        // Fetch job details from ASCORA
        const jobResponse = await fetch(`/api/ascora/verify-job?number=${jobNumber}`);
        if (!jobResponse.ok) {
          throw new Error('Failed to fetch job details');
        }
        const { jobDetails } = await jobResponse.json();
        setJobDetails(jobDetails);

        // Auto-select and populate insurance based on ASCORA data
        const selectedTypes: string[] = [];
        const numbers: Record<string, string> = {};
        jobDetails.insurance.policies.forEach((policy: InsurancePolicy) => {
          selectedTypes.push(policy.type);
          numbers[policy.type] = policy.policyNumber;
        });
        setSelectedInsurance(selectedTypes);
        setPolicyNumbers(numbers);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [templateId, jobNumber]);

  const handleInsuranceToggle = (insurance: string) => {
    setSelectedInsurance(prev => {
      if (prev.includes(insurance)) {
        return prev.filter(i => i !== insurance);
      } else {
        return [...prev, insurance];
      }
    });
  };

  const handlePolicyNumberChange = (insurance: string, value: string) => {
    setPolicyNumbers(prev => ({
      ...prev,
      [insurance]: value
    }));
  };

  const handleContinue = async () => {
    if (selectedInsurance.length === 0) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Create new inspection with template, job details, and insurance data
      const response = await fetch('/api/inspections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId,
          jobNumber,
          insuranceData: {
            selectedTypes: selectedInsurance,
            policyNumbers,
          },
          jobDetails,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create inspection');
      }

      const inspection = await response.json();
      router.push(`/inspection/${inspection.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create inspection');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !jobDetails) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          {error || 'Failed to load job details'}
        </Alert>
      </Container>
    );
  }

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
              <Link href="/admin/templates" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Button startIcon={<ArrowBackIcon />} sx={{ mr: 2 }}>
                  Back to Templates
                </Button>
              </Link>
              <Box>
                <Typography variant="h5" component="h1">
                  New Inspection
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <WorkIcon fontSize="small" color="primary" />
                  <Typography variant="body2" color="text.secondary">
                    {jobDetails.jobNumber}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    •
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {jobDetails.client.name}
                  </Typography>
                </Stack>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {/* Property Details */}
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationOnIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Property Details</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Address
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {jobDetails.property.address.street}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {jobDetails.property.address.suburb}, {jobDetails.property.address.state} {jobDetails.property.address.postcode}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Building Details
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      Year Built: {jobDetails.property.buildingDetails.yearBuilt}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Construction: {jobDetails.property.buildingDetails.constructionType}
                    </Typography>
                    {jobDetails.property.buildingDetails.totalFloors && (
                      <Typography variant="body2" color="text.secondary">
                        Total Floors: {jobDetails.property.buildingDetails.totalFloors}
                      </Typography>
                    )}
                    {jobDetails.property.buildingDetails.totalUnits && (
                      <Typography variant="body2" color="text.secondary">
                        Total Units: {jobDetails.property.buildingDetails.totalUnits}
                      </Typography>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Insurance Selection */}
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Insurance Coverage</Typography>
              </Box>
              <Stack spacing={2}>
                {jobDetails.insurance.policies.map((policy) => (
                  <Box key={policy.type}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedInsurance.includes(policy.type)}
                          onChange={() => handleInsuranceToggle(policy.type)}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} fontSize="small" />
                          <Typography>{policy.type}</Typography>
                        </Box>
                      }
                    />
                    {selectedInsurance.includes(policy.type) && (
                      <Box sx={{ ml: 4, mt: 1 }}>
                        <TextField
                          size="small"
                          label="Policy Number"
                          value={policyNumbers[policy.type] || ''}
                          onChange={(e) => handlePolicyNumberChange(policy.type, e.target.value)}
                        />
                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                          Provider: {policy.provider} • Expires: {new Date(policy.expiryDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ))}
              </Stack>
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={selectedInsurance.length === 0 || loading}
                  onClick={handleContinue}
                >
                  {loading ? <CircularProgress size={24} /> : 'Continue'}
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

'use client';

import React, { useState, ChangeEvent } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  Grid,
  Alert,
  Snackbar,
  MenuItem,
  Switch,
  FormControlLabel,
  Stack,
  Divider
} from '@mui/material';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import ImageIcon from '@mui/icons-material/Image';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import BusinessIcon from '@mui/icons-material/Business';
import DescriptionIcon from '@mui/icons-material/Description';

interface CompanyDetailsType {
  name: string;
  address: {
    street: string;
    suburb: string;
    state: string;
    postcode: string;
  };
  phone: string;
  email: string;
  website: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  highlightColor: string;
  useBranding: boolean;
  reportHeader: string;
  reportFooter: string;
  licenseNumber: string;
  abn: string;
  industry: string;
}

const australianStates = [
  'ACT',
  'NSW',
  'NT',
  'QLD',
  'SA',
  'TAS',
  'VIC',
  'WA',
] as const;

const industries = [
  'Property Inspection',
  'Home Inspection',
  'Commercial Inspection',
  'Environmental Inspection',
  'Safety Inspection',
  'Quality Control',
  'Other',
] as const;

const initialCompanyDetails: CompanyDetailsType = {
  name: 'DRQ Inspection Services',
  address: {
    street: '123 Business Street',
    suburb: 'Melbourne',
    state: 'VIC',
    postcode: '3000',
  },
  phone: '(03) 9123 4567',
  email: 'contact@drqinspection.com',
  website: 'www.drqinspection.com',
  logo: '/path/to/logo.png',
  primaryColor: '#1976d2',
  secondaryColor: '#dc004e',
  accentColor: '#ff9800',
  highlightColor: '#4caf50',
  useBranding: true,
  reportHeader: 'Professional Inspection Report',
  reportFooter: '© 2024 DRQ Inspection Services. All rights reserved.',
  licenseNumber: 'LIC-12345-ABC',
  abn: '12 345 678 901',
  industry: 'Property Inspection',
};

export default function CompanyDetails() {
  const [details, setDetails] = useState<CompanyDetailsType>(initialCompanyDetails);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [editMode, setEditMode] = useState(false);

  const handleSave = () => {
    try {
      setSnackbar({
        open: true,
        message: 'Company details saved successfully',
        severity: 'success',
      });
      setEditMode(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error saving company details',
        severity: 'error',
      });
    }
  };

  const handleLogoUpload = () => {
    // Implement logo upload functionality
  };

  return (
    <Box sx={{ bgcolor: 'background.default' }}>
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
                  Company Details
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Update company information and branding
                </Typography>
              </Box>
            </Box>
            <Box>
              {!editMode ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setEditMode(true)}
                  size="small"
                >
                  Edit Details
                </Button>
              ) : (
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setEditMode(false);
                      setDetails(initialCompanyDetails);
                    }}
                    size="small"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    size="small"
                  >
                    Save Changes
                  </Button>
                </Stack>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        <Grid container spacing={2}>
          {/* Basic Information */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 2, height: '100%', border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} fontSize="small" />
                <Typography variant="subtitle1" fontWeight="medium">Basic Information</Typography>
              </Box>
              <Stack spacing={2}>
                <TextField
                  label="Company Name"
                  value={details.name}
                  onChange={(e) => setDetails({ ...details, name: e.target.value })}
                  disabled={!editMode}
                  size="small"
                  fullWidth
                />
                <TextField
                  label="Industry"
                  select
                  value={details.industry}
                  onChange={(e) => setDetails({ ...details, industry: e.target.value })}
                  disabled={!editMode}
                  size="small"
                  fullWidth
                >
                  {industries.map((industry) => (
                    <MenuItem key={industry} value={industry}>
                      {industry}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Street Address"
                  value={details.address.street}
                  onChange={(e) => setDetails({ 
                    ...details, 
                    address: { ...details.address, street: e.target.value }
                  })}
                  disabled={!editMode}
                  size="small"
                  fullWidth
                />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Suburb"
                      value={details.address.suburb}
                      onChange={(e) => setDetails({ 
                        ...details, 
                        address: { ...details.address, suburb: e.target.value }
                      })}
                      disabled={!editMode}
                      size="small"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      label="State"
                      select
                      value={details.address.state}
                      onChange={(e) => setDetails({ 
                        ...details, 
                        address: { ...details.address, state: e.target.value }
                      })}
                      disabled={!editMode}
                      size="small"
                      fullWidth
                    >
                      {australianStates.map((state) => (
                        <MenuItem key={state} value={state}>
                          {state}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      label="Postcode"
                      value={details.address.postcode}
                      onChange={(e) => setDetails({ 
                        ...details, 
                        address: { ...details.address, postcode: e.target.value }
                      })}
                      disabled={!editMode}
                      size="small"
                      fullWidth
                      inputProps={{ maxLength: 4 }}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Phone"
                      value={details.phone}
                      onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                      disabled={!editMode}
                      size="small"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Email"
                      type="email"
                      value={details.email}
                      onChange={(e) => setDetails({ ...details, email: e.target.value })}
                      disabled={!editMode}
                      size="small"
                      fullWidth
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="License Number"
                      value={details.licenseNumber}
                      onChange={(e) => setDetails({ ...details, licenseNumber: e.target.value })}
                      disabled={!editMode}
                      size="small"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="ABN"
                      value={details.abn}
                      onChange={(e) => setDetails({ ...details, abn: e.target.value })}
                      disabled={!editMode}
                      size="small"
                      fullWidth
                    />
                  </Grid>
                </Grid>
                <TextField
                  label="Website"
                  value={details.website}
                  onChange={(e) => setDetails({ ...details, website: e.target.value })}
                  disabled={!editMode}
                  size="small"
                  fullWidth
                />
              </Stack>
            </Paper>
          </Grid>

          {/* Branding and Report Settings */}
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              {/* Branding */}
              <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ColorLensIcon sx={{ mr: 1, color: 'primary.main' }} fontSize="small" />
                  <Typography variant="subtitle1" fontWeight="medium">Branding</Typography>
                </Box>
                <Stack spacing={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={details.useBranding}
                        onChange={(e) => setDetails({ ...details, useBranding: e.target.checked })}
                        disabled={!editMode}
                        size="small"
                      />
                    }
                    label="Use Custom Branding"
                  />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" gutterBottom>Primary Color</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: details.primaryColor,
                            borderRadius: 0.5,
                            border: '1px solid',
                            borderColor: 'divider'
                          }}
                        />
                        <TextField
                          type="color"
                          value={details.primaryColor}
                          onChange={(e) => setDetails({ ...details, primaryColor: e.target.value })}
                          disabled={!editMode || !details.useBranding}
                          size="small"
                          fullWidth
                          sx={{ 
                            '& input': { 
                              cursor: editMode && details.useBranding ? 'pointer' : 'not-allowed',
                              height: '32px',
                              padding: 0.5
                            } 
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" gutterBottom>Secondary Color</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: details.secondaryColor,
                            borderRadius: 0.5,
                            border: '1px solid',
                            borderColor: 'divider'
                          }}
                        />
                        <TextField
                          type="color"
                          value={details.secondaryColor}
                          onChange={(e) => setDetails({ ...details, secondaryColor: e.target.value })}
                          disabled={!editMode || !details.useBranding}
                          size="small"
                          fullWidth
                          sx={{ 
                            '& input': { 
                              cursor: editMode && details.useBranding ? 'pointer' : 'not-allowed',
                              height: '32px',
                              padding: 0.5
                            } 
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" gutterBottom>Accent Color</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: details.accentColor,
                            borderRadius: 0.5,
                            border: '1px solid',
                            borderColor: 'divider'
                          }}
                        />
                        <TextField
                          type="color"
                          value={details.accentColor}
                          onChange={(e) => setDetails({ ...details, accentColor: e.target.value })}
                          disabled={!editMode || !details.useBranding}
                          size="small"
                          fullWidth
                          sx={{ 
                            '& input': { 
                              cursor: editMode && details.useBranding ? 'pointer' : 'not-allowed',
                              height: '32px',
                              padding: 0.5
                            } 
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" gutterBottom>Highlight Color</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: details.highlightColor,
                            borderRadius: 0.5,
                            border: '1px solid',
                            borderColor: 'divider'
                          }}
                        />
                        <TextField
                          type="color"
                          value={details.highlightColor}
                          onChange={(e) => setDetails({ ...details, highlightColor: e.target.value })}
                          disabled={!editMode || !details.useBranding}
                          size="small"
                          fullWidth
                          sx={{ 
                            '& input': { 
                              cursor: editMode && details.useBranding ? 'pointer' : 'not-allowed',
                              height: '32px',
                              padding: 0.5
                            } 
                          }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                  <Button
                    variant="outlined"
                    startIcon={<ImageIcon />}
                    onClick={handleLogoUpload}
                    disabled={!editMode || !details.useBranding}
                    size="small"
                  >
                    Upload Logo
                  </Button>
                </Stack>
              </Paper>

              {/* Report Settings */}
              <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} fontSize="small" />
                  <Typography variant="subtitle1" fontWeight="medium">Report Settings</Typography>
                </Box>
                <Stack spacing={2}>
                  <TextField
                    label="Report Header"
                    value={details.reportHeader}
                    onChange={(e) => setDetails({ ...details, reportHeader: e.target.value })}
                    disabled={!editMode}
                    multiline
                    rows={2}
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label="Report Footer"
                    value={details.reportFooter}
                    onChange={(e) => setDetails({ ...details, reportFooter: e.target.value })}
                    disabled={!editMode}
                    multiline
                    rows={2}
                    size="small"
                    fullWidth
                  />
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

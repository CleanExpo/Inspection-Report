'use client';
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button,
  Alert,
  Chip,
  Stack
} from '@mui/material';
import {
  CleaningServices as CleanIcon,
  Warning as WarningIcon,
  BiotechOutlined as ContaminationIcon,
  Security as SafetyIcon
} from '@mui/icons-material';

interface SanitisationDetails {
  contaminationType: string;
  affectedAreas: string[];
  requiredMethods: string[];
  requiresPPE: boolean;
  hazardLevel: 'low' | 'medium' | 'high';
  notes?: string;
}

interface SanitisationDetailsProps {
  onSave?: (details: SanitisationDetails) => void;
  initialDetails?: SanitisationDetails;
}

const defaultDetails: SanitisationDetails = {
  contaminationType: '',
  affectedAreas: [],
  requiredMethods: [],
  requiresPPE: false,
  hazardLevel: 'low',
  notes: ''
};

const SanitisationDetails: React.FC<SanitisationDetailsProps> = ({
  onSave,
  initialDetails = defaultDetails
}) => {
  const [details, setDetails] = useState<SanitisationDetails>(initialDetails);
  const [error, setError] = useState<string | null>(null);
  const [newArea, setNewArea] = useState('');
  const [newMethod, setNewMethod] = useState('');

  const validateDetails = (details: SanitisationDetails): boolean => {
    if (!details.contaminationType) {
      setError('Contamination type is required');
      return false;
    }
    if (details.affectedAreas.length === 0) {
      setError('At least one affected area must be specified');
      return false;
    }
    if (details.requiredMethods.length === 0) {
      setError('At least one cleaning method must be specified');
      return false;
    }
    return true;
  };

  const handleAddArea = () => {
    if (newArea.trim()) {
      setDetails(prev => ({
        ...prev,
        affectedAreas: [...prev.affectedAreas, newArea.trim()]
      }));
      setNewArea('');
    }
  };

  const handleRemoveArea = (area: string) => {
    setDetails(prev => ({
      ...prev,
      affectedAreas: prev.affectedAreas.filter(a => a !== area)
    }));
  };

  const handleAddMethod = () => {
    if (newMethod.trim()) {
      setDetails(prev => ({
        ...prev,
        requiredMethods: [...prev.requiredMethods, newMethod.trim()]
      }));
      setNewMethod('');
    }
  };

  const handleRemoveMethod = (method: string) => {
    setDetails(prev => ({
      ...prev,
      requiredMethods: prev.requiredMethods.filter(m => m !== method)
    }));
  };

  const handleSave = () => {
    if (validateDetails(details)) {
      if (onSave) {
        onSave(details);
      }
      setError(null);
    }
  };

  const getHazardColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      default:
        return 'success';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CleanIcon color="primary" />
          Sanitisation Requirements
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Contamination Type"
              value={details.contaminationType}
              onChange={(e) => setDetails(prev => ({ ...prev, contaminationType: e.target.value }))}
              margin="normal"
              placeholder="e.g., Water Damage, Mold, Sewage"
              helperText="Specify the type of contamination present"
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Hazard Level</InputLabel>
              <Select
                value={details.hazardLevel}
                onChange={(e) => setDetails(prev => ({ ...prev, hazardLevel: e.target.value as 'low' | 'medium' | 'high' }))}
                label="Hazard Level"
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Affected Areas
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  fullWidth
                  value={newArea}
                  onChange={(e) => setNewArea(e.target.value)}
                  placeholder="e.g., Kitchen Floor, Bathroom Wall"
                />
                <Button onClick={handleAddArea}>Add</Button>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {details.affectedAreas.map((area) => (
                  <Chip
                    key={area}
                    label={area}
                    onDelete={() => handleRemoveArea(area)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Stack>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Required Cleaning Methods
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  fullWidth
                  value={newMethod}
                  onChange={(e) => setNewMethod(e.target.value)}
                  placeholder="e.g., HEPA Vacuum, Antimicrobial Treatment"
                />
                <Button onClick={handleAddMethod}>Add</Button>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {details.requiredMethods.map((method) => (
                  <Chip
                    key={method}
                    label={method}
                    onDelete={() => handleRemoveMethod(method)}
                    color="secondary"
                    variant="outlined"
                  />
                ))}
              </Stack>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={details.requiresPPE}
                  onChange={(e) => setDetails(prev => ({ ...prev, requiresPPE: e.target.checked }))}
                />
              }
              label="Requires Personal Protective Equipment (PPE)"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              value={details.notes}
              onChange={(e) => setDetails(prev => ({ ...prev, notes: e.target.value }))}
              margin="normal"
              multiline
              rows={3}
              placeholder="Additional sanitisation requirements or observations"
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              onClick={handleSave}
              sx={{ mt: 1 }}
            >
              Save Sanitisation Details
            </Button>
          </Grid>
        </Grid>

        {details.contaminationType && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              Summary
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <ContaminationIcon color="error" />
              <Typography variant="body2">
                Contamination Type: {details.contaminationType}
              </Typography>
              <Chip
                label={`Hazard: ${details.hazardLevel}`}
                color={getHazardColor(details.hazardLevel)}
                size="small"
              />
              {details.requiresPPE && (
                <Chip
                  icon={<SafetyIcon />}
                  label="PPE Required"
                  color="warning"
                  size="small"
                />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Affected Areas: {details.affectedAreas.join(', ')}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Required Methods: {details.requiredMethods.join(', ')}
            </Typography>
            {details.notes && (
              <Typography variant="body2" color="text.secondary">
                Notes: {details.notes}
              </Typography>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default SanitisationDetails;

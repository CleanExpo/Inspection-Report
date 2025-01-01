"use client";

import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Grid,
  Paper,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Tooltip,
  Snackbar,
  AlertProps
} from '@mui/material';
import { usePowerReadings } from '../../hooks/usePowerReadings';

export interface PowerReading {
  equipmentId: string;
  equipmentName: string;
  watts: number;
  amps: number;
  voltage: number;
  timestamp: string;
}

interface PowerDetailsProps {
  jobNumber: string;
  totalEquipmentPower: number;
  onSave?: (readings: PowerReading[]) => Promise<void>;
  className?: string;
}

interface Feedback {
  type: 'success' | 'error';
  message: string;
}

// Mock equipment list - should come from API/database
const EQUIPMENT_LIST = [
  { id: 'dehu-1', name: 'Dehumidifier 1', maxWatts: 1500 },
  { id: 'dehu-2', name: 'Dehumidifier 2', maxWatts: 1500 },
  { id: 'fan-1', name: 'Air Mover 1', maxWatts: 200 },
  { id: 'fan-2', name: 'Air Mover 2', maxWatts: 200 },
];

const PowerDetails: React.FC<PowerDetailsProps> = ({
  jobNumber,
  totalEquipmentPower,
  onSave,
  className = ""
}) => {
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const {
    readings,
    fieldErrors,
    error,
    isLoading,
    addReading,
    updateReading,
    removeReading,
    validateAndSaveReadings,
    getTotalPower
  } = usePowerReadings({
    totalEquipmentPower,
    equipmentList: EQUIPMENT_LIST
  });

  // Handle unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSubmit();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Initialize component
  useEffect(() => {
    const initialize = async () => {
      try {
        // Add any initialization logic here
        setIsInitializing(false);
      } catch (error) {
        setFeedback({
          type: 'error',
          message: 'Failed to initialize power readings'
        });
        setIsInitializing(false);
      }
    };

    initialize();
  }, []);

  const validateReading = (reading: PowerReading): string[] => {
    const errors: string[] = [];
    
    // Basic validation
    if (reading.watts < 0) errors.push("Watts cannot be negative");
    if (reading.amps < 0) errors.push("Amps cannot be negative");
    if (reading.voltage < 0) errors.push("Voltage cannot be negative");
    
    // Power calculation validation
    const calculatedWatts = reading.amps * reading.voltage;
    if (Math.abs(calculatedWatts - reading.watts) > 1) {
      errors.push("Power readings are inconsistent (W = A × V)");
    }
    
    // Equipment-specific validation
    const equipment = EQUIPMENT_LIST.find(e => e.id === reading.equipmentId);
    if (equipment && reading.watts > equipment.maxWatts) {
      errors.push(`Exceeds maximum power of ${equipment.maxWatts}W`);
    }
    
    return errors;
  };

  const handleSubmit = async () => {
    if (!onSave) return;

    try {
      setIsSaving(true);
      
      // Validate all readings
      const errors = readings.flatMap((reading, index) => 
        validateReading(reading).map(error => `Reading ${index + 1}: ${error}`)
      );
      
      if (errors.length > 0) {
        setFeedback({
          type: 'error',
          message: errors.join('. ')
        });
        return;
      }

      await validateAndSaveReadings(onSave);
      setFeedback({
        type: 'success',
        message: 'Power readings saved successfully'
      });
      setHasUnsavedChanges(false);
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to save power readings'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveReading = (index: number) => {
    removeReading(index);
    setDeleteIndex(null);
    setHasUnsavedChanges(true);
  };

  const handleUpdateReading = (index: number, field: keyof PowerReading, value: any) => {
    updateReading(index, field, value);
    setHasUnsavedChanges(true);
  };

  const handleAddReading = () => {
    addReading();
    setHasUnsavedChanges(true);
  };

  if (isInitializing) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress aria-label="Loading power readings" />
      </Box>
    );
  }

  const totalPower = getTotalPower();
  const isOverPowerLimit = totalPower > totalEquipmentPower;

  return (
    <Paper className={`p-6 ${className}`} role="region" aria-label="Power readings form">
      <Typography variant="h6" gutterBottom component="h2">
        Power Details - Job #{jobNumber}
      </Typography>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      <Box className="space-y-4">
        {readings.map((reading, index) => (
          <Grid 
            key={reading.equipmentId || index} 
            container 
            spacing={2} 
            className="p-4 border rounded"
            role="group"
            aria-label={`Power reading ${index + 1}`}
          >
            <Grid item xs={12} md={3}>
              <TextField
                select
                label="Equipment"
                value={reading.equipmentId}
                onChange={(e) => {
                  const equipment = EQUIPMENT_LIST.find(eq => eq.id === e.target.value);
                  if (equipment) {
                    handleUpdateReading(index, 'equipmentId', equipment.id);
                    handleUpdateReading(index, 'equipmentName', equipment.name);
                  }
                }}
                fullWidth
                error={!reading.equipmentId}
                helperText={!reading.equipmentId ? 'Equipment selection required' : ''}
                aria-label={`Equipment selection for reading ${index + 1}`}
              >
                {EQUIPMENT_LIST.map((equipment) => (
                  <MenuItem key={equipment.id} value={equipment.id}>
                    {equipment.name} (max {equipment.maxWatts}W)
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Tooltip title={fieldErrors[`${index}-watts`] || ''}>
                <TextField
                  label="Watts"
                  type="number"
                  value={reading.watts}
                  onChange={(e) => handleUpdateReading(index, 'watts', Number(e.target.value))}
                  error={!!fieldErrors[`${index}-watts`]}
                  helperText={fieldErrors[`${index}-watts`]}
                  fullWidth
                  inputProps={{ 
                    min: 0,
                    'aria-label': `Watts for reading ${index + 1}`
                  }}
                />
              </Tooltip>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Tooltip title={fieldErrors[`${index}-amps`] || ''}>
                <TextField
                  label="Amps"
                  type="number"
                  value={reading.amps}
                  onChange={(e) => handleUpdateReading(index, 'amps', Number(e.target.value))}
                  error={!!fieldErrors[`${index}-amps`]}
                  helperText={fieldErrors[`${index}-amps`]}
                  fullWidth
                  inputProps={{ 
                    min: 0,
                    'aria-label': `Amps for reading ${index + 1}`
                  }}
                />
              </Tooltip>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Tooltip title={fieldErrors[`${index}-voltage`] || ''}>
                <TextField
                  label="Voltage"
                  type="number"
                  value={reading.voltage}
                  onChange={(e) => handleUpdateReading(index, 'voltage', Number(e.target.value))}
                  error={!!fieldErrors[`${index}-voltage`]}
                  helperText={fieldErrors[`${index}-voltage`]}
                  fullWidth
                  inputProps={{ 
                    min: 0,
                    'aria-label': `Voltage for reading ${index + 1}`
                  }}
                />
              </Tooltip>
            </Grid>
            <Grid item xs={12} sm={6} md={3} className="flex items-center">
              <Button
                onClick={() => setDeleteIndex(index)}
                color="error"
                variant="outlined"
                fullWidth
                aria-label={`Remove reading ${index + 1}`}
              >
                Remove
              </Button>
            </Grid>
          </Grid>
        ))}

        <Box className="flex justify-between items-center">
          <Button
            onClick={handleAddReading}
            variant="outlined"
            color="primary"
            aria-label="Add new power reading"
          >
            Add Reading
          </Button>

          <Typography 
            variant="body2" 
            color={isOverPowerLimit ? "error" : "textSecondary"}
            role="status"
            aria-live="polite"
          >
            Total Power: {totalPower}W / {totalEquipmentPower}W
            {isOverPowerLimit && ' (Exceeds limit)'}
          </Typography>

          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={readings.length === 0 || isLoading || isSaving}
            aria-label={`Save readings${hasUnsavedChanges ? ' (unsaved changes)' : ''}`}
          >
            {(isLoading || isSaving) ? <CircularProgress size={24} /> : 'Save Readings'}
          </Button>
        </Box>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog
        open={deleteIndex !== null}
        onClose={() => setDeleteIndex(null)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Confirm Deletion</DialogTitle>
        <DialogContent id="delete-dialog-description">
          Are you sure you want to remove this power reading?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteIndex(null)}>Cancel</Button>
          <Button 
            onClick={() => deleteIndex !== null && handleRemoveReading(deleteIndex)} 
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Snackbar */}
      <Snackbar
        open={!!feedback}
        autoHideDuration={6000}
        onClose={() => setFeedback(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setFeedback(null)} 
          severity={feedback?.type || 'info'}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {feedback?.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default PowerDetails;

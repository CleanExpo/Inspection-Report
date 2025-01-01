import React, { useState, useCallback, memo } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Button,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { MoistureReading } from '../types/moisture';

interface MoistureInputProps {
  onAddReading: (reading: MoistureReading) => void;
  currentInspectionDay: number;
  onMaterialSelect?: (material: string) => void;
  onValueChange?: (value: number | undefined) => void;
  disabled?: boolean;
}

const MoistureInput = memo(function MoistureInput({
  onAddReading,
  currentInspectionDay,
  onMaterialSelect,
  onValueChange,
  disabled = false,
}: MoistureInputProps) {
  const [formState, setFormState] = useState({
    device: '',
    readingType: '',
    readingMethod: '',
    location: '',
    materialType: '',
    value: '',
    notes: '',
  });

  const handleChange = useCallback((field: string) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ) => {
    const newValue = event.target.value;
    setFormState(prev => ({ ...prev, [field]: newValue }));

    if (field === 'materialType' && onMaterialSelect) {
      onMaterialSelect(newValue);
    }
    if (field === 'value' && onValueChange) {
      const numValue = newValue ? parseFloat(newValue) : undefined;
      onValueChange(numValue);
    }
  }, [onMaterialSelect, onValueChange]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    const numericValue = parseFloat(formState.value);
    if (isNaN(numericValue)) return;

    const reading: MoistureReading = {
      id: `reading-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      value: numericValue,
      location: formState.location,
      materialType: formState.materialType,
      timestamp: new Date().toISOString(),
      device: {
        id: formState.device,
        name: 'Device Name', // Replace with actual device name
        model: 'Model', // Replace with actual model
      },
      readingType: {
        id: formState.readingType,
        name: 'Reading Type', // Replace with actual reading type
        unit: '%', // Replace with actual unit
      },
      readingMethod: {
        id: formState.readingMethod,
        name: 'Reading Method', // Replace with actual method
      },
      inspectionDay: currentInspectionDay,
      notes: formState.notes || undefined,
    };

    onAddReading(reading);
    
    // Reset form
    setFormState({
      device: '',
      readingType: '',
      readingMethod: '',
      location: '',
      materialType: '',
      value: '',
      notes: '',
    });
  }, [formState, currentInspectionDay, onAddReading]);

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <FormControl required sx={{ minWidth: 200 }} disabled={disabled}>
        <InputLabel>Device</InputLabel>
        <Select
          value={formState.device}
          label="Device"
          onChange={handleChange('device')}
        >
          <MenuItem value="protimeter">Protimeter</MenuItem>
          <MenuItem value="flir">FLIR</MenuItem>
        </Select>
      </FormControl>

      <FormControl required sx={{ minWidth: 200 }} disabled={disabled}>
        <InputLabel>Reading Type</InputLabel>
        <Select
          value={formState.readingType}
          label="Reading Type"
          onChange={handleChange('readingType')}
        >
          <MenuItem value="moisture">Moisture Content</MenuItem>
          <MenuItem value="temperature">Temperature</MenuItem>
        </Select>
      </FormControl>

      <FormControl required sx={{ minWidth: 200 }} disabled={disabled}>
        <InputLabel>Reading Method</InputLabel>
        <Select
          value={formState.readingMethod}
          label="Reading Method"
          onChange={handleChange('readingMethod')}
        >
          <MenuItem value="surface">Surface</MenuItem>
          <MenuItem value="deep">Deep</MenuItem>
        </Select>
      </FormControl>

      <TextField
        required
        label="Location"
        value={formState.location}
        onChange={handleChange('location')}
        sx={{ minWidth: 200 }}
        disabled={disabled}
      />

      <FormControl required sx={{ minWidth: 200 }} disabled={disabled}>
        <InputLabel>Material Type</InputLabel>
        <Select
          value={formState.materialType}
          label="Material Type"
          onChange={handleChange('materialType')}
        >
          <MenuItem value="drywall">Drywall</MenuItem>
          <MenuItem value="wood">Wood</MenuItem>
          <MenuItem value="concrete">Concrete</MenuItem>
        </Select>
      </FormControl>

      <TextField
        required
        label="Value"
        type="number"
        value={formState.value}
        onChange={handleChange('value')}
        InputProps={{
          endAdornment: <InputAdornment position="end">%</InputAdornment>,
        }}
        sx={{ minWidth: 150 }}
        disabled={disabled}
      />

      <TextField
        label="Notes"
        value={formState.notes}
        onChange={handleChange('notes')}
        multiline
        rows={1}
        sx={{ minWidth: 300 }}
        disabled={disabled}
      />

      <Button
        type="submit"
        variant="contained"
        startIcon={<AddIcon />}
        sx={{ height: 56 }}
        disabled={disabled}
      >
        Add Reading
      </Button>
    </Box>
  );
});

export default MoistureInput;

'use client';

import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Popover,
  TextField,
  Typography,
  Button,
  Tooltip,
} from '@mui/material';
import {
  WaterDrop as WaterDropIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import ReadingHistory from './ReadingHistory';

export interface ReadingValue {
  value: number;
  timestamp: string;
}

export interface MoistureReadingData {
  id: string;
  position: { x: number; y: number };
  values: ReadingValue[];
}

interface MoistureReadingProps {
  reading: MoistureReadingData;
  onUpdate: (reading: MoistureReadingData) => void;
  onDelete: (id: string) => void;
  scale?: number;
}

export default function MoistureReading({
  reading,
  onUpdate,
  onDelete,
  scale = 1,
}: MoistureReadingProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [newValue, setNewValue] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setNewValue('');
    setError(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAddReading = () => {
    const value = parseFloat(newValue);
    
    if (isNaN(value)) {
      setError('Please enter a valid number');
      return;
    }

    if (value < 0 || value > 100) {
      setError('Value must be between 0 and 100');
      return;
    }

    const updatedReading = {
      ...reading,
      values: [
        ...reading.values,
        {
          value,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    onUpdate(updatedReading);
    handleClose();
  };

  const getCurrentValue = () => {
    if (reading.values.length === 0) return null;
    return reading.values[reading.values.length - 1].value;
  };

  const getColor = (value: number) => {
    if (value < 15) return '#4caf50'; // Green - Normal
    if (value < 20) return '#ff9800'; // Orange - Warning
    return '#f44336'; // Red - High
  };

  const currentValue = getCurrentValue();
  const open = Boolean(anchorEl);
  const id = open ? `moisture-reading-${reading.id}` : undefined;

  return (
    <>
      <Box
        sx={{
          position: 'absolute',
          left: reading.position.x / scale,
          top: reading.position.y / scale,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <Tooltip
          title={
            currentValue !== null
              ? `Last reading: ${currentValue}%`
              : 'No readings yet'
          }
        >
          <IconButton
            aria-describedby={id}
            onClick={handleClick}
            sx={{
              backgroundColor: currentValue !== null ? getColor(currentValue) : 'grey.400',
              color: 'white',
              '&:hover': {
                backgroundColor: currentValue !== null ? getColor(currentValue) : 'grey.500',
              },
            }}
            size="small"
          >
            <WaterDropIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <Box sx={{ p: 2, width: 250 }}>
            <Typography variant="subtitle2" gutterBottom>
              Moisture Reading
            </Typography>

            {/* Current Value */}
            {currentValue !== null && (
              <Typography variant="h6" gutterBottom>
                {currentValue}%
              </Typography>
            )}

            {/* New Reading Input */}
            <Box sx={{ mt: 2, mb: 1 }}>
              <TextField
                label="New Reading (%)"
                value={newValue}
                onChange={(e) => {
                  setNewValue(e.target.value);
                  setError(null);
                }}
                type="number"
                size="small"
                fullWidth
                error={!!error}
                helperText={error}
                InputProps={{
                  inputProps: {
                    min: 0,
                    max: 100,
                    step: 0.1,
                  },
                }}
              />
            </Box>

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Button
                variant="contained"
                size="small"
                onClick={handleAddReading}
                disabled={!newValue}
              >
                Add Reading
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<HistoryIcon />}
                disabled={reading.values.length === 0}
                onClick={() => {
                  handleClose();
                  setShowHistory(true);
                }}
              >
                History
              </Button>
              <IconButton
                size="small"
                color="error"
                onClick={() => {
                  onDelete(reading.id);
                  handleClose();
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Popover>
      </Box>

      <ReadingHistory
        open={showHistory}
        onClose={() => setShowHistory(false)}
        readings={reading.values}
      />
    </>
  );
}

"use client";

import React, { useState } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import PowerDetails from './PowerDetails/PowerDetails';

interface PowerReading {
  equipmentId: string;
  watts: number;
  amps: number;
  voltage: number;
  timestamp: string;
}

interface AuthorityPowerSanitizationProps {
  jobNumber: string;
  className?: string;
}

const AuthorityPowerSanitization: React.FC<AuthorityPowerSanitizationProps> = ({
  jobNumber,
  className = ""
}) => {
  const [error, setError] = useState<string | null>(null);

  // This would typically come from your equipment configuration or database
  const TOTAL_EQUIPMENT_POWER = 5000; // 5000W example capacity

  const handleSaveReadings = async (readings: PowerReading[]) => {
    try {
      setError(null);

      // Here you would typically:
      // 1. Validate the readings
      // 2. Save to your database
      // 3. Update any related records

      console.log('Power readings saved:', readings);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error('Error saving power readings:', error);
      setError(error instanceof Error ? error.message : 'Failed to save power readings');
    }
  };

  return (
    <Box className={className}>
      <Typography variant="h5" gutterBottom>
        Power & Sanitization Details
      </Typography>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      <PowerDetails
        jobNumber={jobNumber}
        totalEquipmentPower={TOTAL_EQUIPMENT_POWER}
        onSave={handleSaveReadings}
      />
    </Box>
  );
};

export default AuthorityPowerSanitization;

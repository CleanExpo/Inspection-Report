import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';

export interface IICRCValidationProps {
  onValidate: (certification: string) => boolean;
  className?: string;
}

const IICRCValidation: React.FC<IICRCValidationProps> = ({
  onValidate,
  className = ""
}) => {
  const [certification, setCertification] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message: string;
  } | null>(null);

  const handleValidation = () => {
    setIsValidating(true);
    try {
      const isValid = onValidate(certification);
      setValidationResult({
        isValid,
        message: isValid 
          ? 'IICRC certification is valid' 
          : 'Invalid IICRC certification number'
      });
    } catch (error) {
      setValidationResult({
        isValid: false,
        message: 'Failed to validate certification'
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Box className={className}>
      <Box className="flex gap-4 items-start">
        <TextField
          label="IICRC Certification"
          value={certification}
          onChange={(e) => {
            setCertification(e.target.value.toUpperCase());
            setValidationResult(null);
          }}
          placeholder="e.g., L12345678"
          helperText="Enter your IICRC certification number"
          className="flex-1"
        />
        <Button
          onClick={handleValidation}
          disabled={!certification || isValidating}
          variant="contained"
          color="primary"
        >
          {isValidating ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Validate'
          )}
        </Button>
      </Box>

      {validationResult && (
        <Alert 
          severity={validationResult.isValid ? 'success' : 'error'}
          className="mt-4"
        >
          {validationResult.message}
        </Alert>
      )}
    </Box>
  );
};

export default IICRCValidation;

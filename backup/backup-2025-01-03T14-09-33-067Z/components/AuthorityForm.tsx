"use client";

import React from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper
} from '@mui/material';
import SignaturePad from 'react-signature-canvas';
import { useAuthorityForm } from '../hooks/useAuthorityForm';
import type { AuthorityFormData } from '../types/authority';

interface AuthorityFormProps {
  initialData?: Partial<AuthorityFormData>;
  onSubmit: (data: AuthorityFormData) => Promise<void>;
  className?: string;
}

const AuthorityForm: React.FC<AuthorityFormProps> = ({
  initialData,
  onSubmit,
  className = ""
}) => {
  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSignatureEnd,
    handleSubmit,
    handleClear,
    signaturePadRef
  } = useAuthorityForm({
    initialData,
    onSubmit
  });

  return (
    <Paper className={`p-6 ${className}`}>
      <Typography variant="h6" gutterBottom>
        Authority Form
      </Typography>

      {errors.submit && (
        <Alert severity="error" className="mb-4">
          {errors.submit[0]}
        </Alert>
      )}

      <Box component="form" className="space-y-4">
        <TextField
          label="Job Number"
          value={formData.jobNumber}
          onChange={(e) => handleChange('jobNumber', e.target.value)}
          error={!!errors.jobNumber}
          helperText={errors.jobNumber?.[0]}
          fullWidth
          required
        />

        <TextField
          label="Client Name"
          value={formData.clientName}
          onChange={(e) => handleChange('clientName', e.target.value)}
          error={!!errors.clientName}
          helperText={errors.clientName?.[0]}
          fullWidth
          required
        />

        <TextField
          label="Property Address"
          value={formData.propertyAddress}
          onChange={(e) => handleChange('propertyAddress', e.target.value)}
          error={!!errors.propertyAddress}
          helperText={errors.propertyAddress?.[0]}
          fullWidth
          required
        />

        <TextField
          label="Authorized By"
          value={formData.authorizedBy}
          onChange={(e) => handleChange('authorizedBy', e.target.value)}
          error={!!errors.authorizedBy}
          helperText={errors.authorizedBy?.[0]}
          fullWidth
          required
        />

        <TextField
          type="date"
          label="Authorization Date"
          value={formData.authorizedDate}
          onChange={(e) => handleChange('authorizedDate', e.target.value)}
          error={!!errors.authorizedDate}
          helperText={errors.authorizedDate?.[0]}
          fullWidth
          required
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label="Scope of Work"
          value={formData.scope}
          onChange={(e) => handleChange('scope', e.target.value)}
          error={!!errors.scope}
          helperText={errors.scope?.[0]}
          fullWidth
          required
          multiline
          rows={4}
        />

        <TextField
          label="Special Conditions"
          value={formData.conditions}
          onChange={(e) => handleChange('conditions', e.target.value)}
          fullWidth
          multiline
          rows={3}
        />

        <Box className="border rounded p-4">
          <Typography variant="subtitle2" gutterBottom>
            Signature
          </Typography>

          {errors.signature && (
            <Typography color="error" variant="caption" className="mb-2 block">
              {errors.signature[0]}
            </Typography>
          )}

          <Box
            className="border rounded bg-white"
            sx={{ touchAction: 'none' }}
          >
            <SignaturePad
              ref={signaturePadRef}
              onEnd={handleSignatureEnd}
              canvasProps={{
                className: 'w-full h-40'
              }}
            />
          </Box>

          <Button
            onClick={handleClear}
            variant="outlined"
            size="small"
            className="mt-2"
          >
            Clear Signature
          </Button>
        </Box>

        <Box className="flex justify-end space-x-2">
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default AuthorityForm;

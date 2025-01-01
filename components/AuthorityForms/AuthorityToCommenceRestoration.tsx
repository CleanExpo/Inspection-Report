import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  TextField,
  Button,
  Grid,
  Paper,
  Typography,
  Box,
  Alert
} from '@mui/material';
import { AuthorityFormData } from '../../types/authority';

interface AuthorityFormProps {
  onSubmit: (data: AuthorityFormData) => Promise<void>;
  initialData?: Partial<AuthorityFormData>;
  className?: string;
}

const AuthorityToCommenceRestoration: React.FC<AuthorityFormProps> = ({
  onSubmit,
  initialData,
  className = ""
}) => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { control, handleSubmit, formState: { errors } } = useForm<AuthorityFormData>({
    defaultValues: {
      jobNumber: '',
      clientName: '',
      propertyAddress: '',
      authorizedBy: '',
      authorizedDate: new Date().toISOString().split('T')[0],
      scope: '',
      conditions: '',
      ...initialData
    }
  });

  const handleFormSubmit = async (data: AuthorityFormData) => {
    try {
      setSubmitError(null);
      await onSubmit(data);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit form');
    }
  };

  return (
    <Paper className={`p-6 ${className}`}>
      <Typography variant="h5" component="h2" gutterBottom>
        Authority to Commence Restoration
      </Typography>

      {submitError && (
        <Alert severity="error" className="mb-4">
          {submitError}
        </Alert>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Controller
              name="jobNumber"
              control={control}
              rules={{ required: 'Job number is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Job Number"
                  fullWidth
                  error={!!errors.jobNumber}
                  helperText={errors.jobNumber?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="clientName"
              control={control}
              rules={{ required: 'Client name is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Client Name"
                  fullWidth
                  error={!!errors.clientName}
                  helperText={errors.clientName?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="propertyAddress"
              control={control}
              rules={{ required: 'Property address is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Property Address"
                  fullWidth
                  error={!!errors.propertyAddress}
                  helperText={errors.propertyAddress?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="authorizedBy"
              control={control}
              rules={{ required: 'Authorization name is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Authorized By"
                  fullWidth
                  error={!!errors.authorizedBy}
                  helperText={errors.authorizedBy?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="authorizedDate"
              control={control}
              rules={{ required: 'Authorization date is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="date"
                  label="Authorization Date"
                  fullWidth
                  error={!!errors.authorizedDate}
                  helperText={errors.authorizedDate?.message}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="scope"
              control={control}
              rules={{ required: 'Scope of work is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Scope of Work"
                  multiline
                  rows={4}
                  fullWidth
                  error={!!errors.scope}
                  helperText={errors.scope?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="conditions"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Special Conditions"
                  multiline
                  rows={3}
                  fullWidth
                  error={!!errors.conditions}
                  helperText={errors.conditions?.message}
                />
              )}
            />
          </Grid>
        </Grid>

        <Box className="flex justify-end space-x-4">
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
          >
            Submit Authority
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default AuthorityToCommenceRestoration;

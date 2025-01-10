import React from 'react';
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
import { InspectionFormData, InspectionReport, InspectionNote, InspectionImage } from '../types/inspection';
import VoiceInput from './VoiceInput';
import ImageUploader from './ImageUploader';
import IICRCValidation from './IICRCValidation';
import { validateIICRC } from '../utils/validation';

interface AdminSectionProps {
  onSubmit: (data: InspectionFormData) => void;
  initialData?: Partial<InspectionFormData>;
  className?: string;
}

const AdminSection: React.FC<AdminSectionProps> = ({
  onSubmit,
  initialData,
  className = ""
}) => {
  const { control, handleSubmit, formState: { errors } } = useForm<InspectionFormData>({
    defaultValues: {
      jobNumber: '',
      inspectionDate: new Date().toISOString().split('T')[0],
      inspector: '',
      location: '',
      notes: '',
      images: [],
      moistureReadings: [],
      equipmentUsed: [],
      status: 'draft',
      ...initialData
    }
  });

  const handleVoiceInput = (field: keyof InspectionFormData) => (text: string) => {
    // Handle voice input for different fields
    console.log(`Voice input for ${field}:`, text);
  };

  const handleImageUpload = (images: InspectionImage[]) => {
    // Handle image uploads
    console.log('Uploaded images:', images);
  };

  return (
    <Paper className={`p-6 ${className}`}>
      <Typography variant="h5" component="h2" gutterBottom>
        Inspection Details
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              name="inspectionDate"
              control={control}
              rules={{ required: 'Inspection date is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="date"
                  label="Inspection Date"
                  fullWidth
                  error={!!errors.inspectionDate}
                  helperText={errors.inspectionDate?.message}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="inspector"
              control={control}
              rules={{ required: 'Inspector name is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Inspector"
                  fullWidth
                  error={!!errors.inspector}
                  helperText={errors.inspector?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="location"
              control={control}
              rules={{ required: 'Location is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Location"
                  fullWidth
                  error={!!errors.location}
                  helperText={errors.location?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <Box>
                  <TextField
                    {...field}
                    label="Notes"
                    multiline
                    rows={4}
                    fullWidth
                  />
                  <VoiceInput
                    onCapture={handleVoiceInput('notes')}
                    className="mt-2"
                  />
                </Box>
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <ImageUploader
              onUpload={handleImageUpload}
              maxFiles={10}
              acceptedTypes={['image/jpeg', 'image/png']}
              className="mt-2"
            />
          </Grid>

          <Grid item xs={12}>
            <IICRCValidation
              onValidate={(certification: string) => {
                const result = validateIICRC(certification);
                return result.isValid;
              }}
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
            Save Inspection
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default AdminSection;

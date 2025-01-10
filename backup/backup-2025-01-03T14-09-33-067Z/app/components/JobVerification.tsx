import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { useAscoraJob } from '../hooks/useAscoraJob';
import type { AscoraJob } from '../types/ascora';

interface JobVerificationProps {
  onJobVerified?: (job: AscoraJob) => void;
}

export default function JobVerification({ onJobVerified }: JobVerificationProps) {
  const [jobId, setJobId] = useState('');
  const { job, isLoading, error, verifyJob } = useAscoraJob();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobId.trim()) return;

    await verifyJob(jobId);
    if (onJobVerified && job) {
      onJobVerified(job);
    }
  };

  const renderJobDetails = () => {
    if (!job) return null;

    return (
      <Paper elevation={0} sx={{ p: 2, mt: 2, bgcolor: 'background.default' }}>
        <Typography variant="h6" gutterBottom>
          Job Details
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="Property Details"
              secondary={
                <>
                  <Typography component="span" display="block">
                    Address: {job.propertyDetails.address}
                  </Typography>
                  <Typography component="span" display="block">
                    Type: {job.propertyDetails.propertyType}
                  </Typography>
                  <Typography component="span" display="block">
                    Contact: {job.propertyDetails.contactName}
                  </Typography>
                  <Typography component="span" display="block">
                    Phone: {job.propertyDetails.contactPhone}
                  </Typography>
                </>
              }
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="Insurance Details"
              secondary={
                <>
                  <Typography component="span" display="block">
                    Company: {job.insuranceDetails.company}
                  </Typography>
                  <Typography component="span" display="block">
                    Policy: {job.insuranceDetails.policyNumber}
                  </Typography>
                  <Typography component="span" display="block">
                    Claim: {job.insuranceDetails.claimNumber}
                  </Typography>
                </>
              }
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="Status"
              secondary={
                <Typography
                  component="span"
                  sx={{
                    color: job.jobStatus === 'completed'
                      ? 'success.main'
                      : job.jobStatus === 'active'
                      ? 'primary.main'
                      : 'text.secondary',
                  }}
                >
                  {job.jobStatus.charAt(0).toUpperCase() + job.jobStatus.slice(1)}
                </Typography>
              }
            />
          </ListItem>
        </List>
      </Paper>
    );
  };

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 3, mb: 2 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <TextField
              label="Job ID"
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              error={!!error}
              helperText={error?.message}
              disabled={isLoading}
              fullWidth
            />
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading || !jobId.trim()}
              sx={{ minWidth: 120, height: 56 }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Verify Job'}
            </Button>
          </Box>
        </form>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error.message}
          </Alert>
        )}

        {renderJobDetails()}
      </Paper>
    </Box>
  );
}

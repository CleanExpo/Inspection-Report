'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
} from '@mui/icons-material';
import { ReadingValue } from './MoistureReading';

interface ReadingHistoryProps {
  open: boolean;
  onClose: () => void;
  readings: ReadingValue[];
}

export default function ReadingHistory({
  open,
  onClose,
  readings,
}: ReadingHistoryProps) {
  const theme = useTheme();
  const sortedReadings = [...readings].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getTrend = (current: number, previous: number | null) => {
    if (!previous) return null;
    const diff = current - previous;
    if (Math.abs(diff) < 0.1) return 'flat';
    return diff > 0 ? 'up' : 'down';
  };

  const getTrendColor = (trend: 'up' | 'down' | 'flat' | null) => {
    switch (trend) {
      case 'up':
        return theme.palette.error.main;
      case 'down':
        return theme.palette.success.main;
      case 'flat':
        return theme.palette.text.secondary;
      default:
        return theme.palette.text.primary;
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'flat' | null) => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon fontSize="small" sx={{ color: getTrendColor(trend) }} />;
      case 'down':
        return <TrendingDownIcon fontSize="small" sx={{ color: getTrendColor(trend) }} />;
      case 'flat':
        return <TrendingFlatIcon fontSize="small" sx={{ color: getTrendColor(trend) }} />;
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Reading History</Typography>
          <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {readings.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
            No readings recorded yet
          </Typography>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date & Time</TableCell>
                  <TableCell align="right">Reading (%)</TableCell>
                  <TableCell align="center">Trend</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedReadings.map((reading, index) => {
                  const previousReading = sortedReadings[index + 1]?.value || null;
                  const trend = getTrend(reading.value, previousReading);

                  return (
                    <TableRow key={reading.timestamp}>
                      <TableCell>
                        {new Date(reading.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell align="right">{reading.value.toFixed(1)}%</TableCell>
                      <TableCell align="center">
                        {getTrendIcon(trend)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {readings.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              {readings.length} reading{readings.length === 1 ? '' : 's'} recorded
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

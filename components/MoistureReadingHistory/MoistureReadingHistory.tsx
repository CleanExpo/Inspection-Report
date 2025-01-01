"use client";

import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
  MoistureReading,
  DailyReadings,
  MATERIAL_BENCHMARKS,
} from '@/types/moisture';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend
);

interface MoistureReadingHistoryProps {
  jobId: string;
  initialReadings?: MoistureReading[];
  onUpdate?: (readings: DailyReadings) => Promise<void>;
  className?: string;
}

const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Moisture Level (%)',
      },
    },
  },
  plugins: {
    legend: {
      position: 'top' as const,
    },
    tooltip: {
      mode: 'index',
      intersect: false,
    },
  },
};

const MoistureReadingHistory: React.FC<MoistureReadingHistoryProps> = ({
  jobId,
  initialReadings = [],
  onUpdate,
  className = '',
}) => {
  const [readingHistory, setReadingHistory] = useState<DailyReadings[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  // Initialize with readings from sketch
  useEffect(() => {
    if (initialReadings.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      setReadingHistory([
        {
          date: today,
          readings: initialReadings,
        },
      ]);
    }
    setIsLoading(false);
  }, [initialReadings]);

  const getReadingStatus = (reading: MoistureReading) => {
    const benchmark = MATERIAL_BENCHMARKS.find(b => b.materialType === reading.materialType);
    if (!benchmark) return 'unknown';

    if (reading.value <= benchmark.dryValue) return 'dry';
    
    // Find how many days this location has been monitored
    const daysMonitored = readingHistory.filter(day => 
      day.readings.some(r => 
        r.position.x === reading.position.x && 
        r.position.y === reading.position.y
      )
    ).length;

    if (daysMonitored >= benchmark.maxDryingDays) return 'concern';
    return 'drying';
  };

  const generateTrendData = (locationId: string) => {
    const locationReadings = readingHistory.map(day => ({
      date: day.date,
      value: day.readings.find(r => r.id === locationId)?.value || null,
    }));

    const benchmark = MATERIAL_BENCHMARKS.find(b => 
      b.materialType === readingHistory[0]?.readings.find(r => r.id === locationId)?.materialType
    );

    return {
      labels: locationReadings.map(r => r.date),
      datasets: [
        {
          label: 'Moisture Level',
          data: locationReadings.map(r => r.value),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.1,
        },
        benchmark ? {
          label: 'Benchmark',
          data: locationReadings.map(() => benchmark.dryValue),
          borderColor: 'rgba(255, 99, 132, 0.5)',
          borderDash: [5, 5],
          fill: false,
          tension: 0,
        } : null,
      ].filter(Boolean),
    };
  };

  const getLocationProgress = (readings: MoistureReading[]) => {
    const totalLocations = readings.length;
    const dryLocations = readings.filter(r => getReadingStatus(r) === 'dry').length;
    return (dryLocations / totalLocations) * 100;
  };

  const renderTrendDialog = () => {
    if (!selectedLocation) return null;

    const locationReadings = readingHistory.map(day => 
      day.readings.find(r => r.id === selectedLocation)
    ).filter(Boolean);

    if (locationReadings.length === 0) return null;

    const firstReading = locationReadings[0];
    const benchmark = MATERIAL_BENCHMARKS.find(b => b.materialType === firstReading?.materialType);

    return (
      <Dialog
        open={!!selectedLocation}
        onClose={() => setSelectedLocation(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Moisture Level Trend - {firstReading?.locationDescription || 'Location'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ height: 300, mt: 2 }}>
            <Line
              data={generateTrendData(selectedLocation)}
              options={chartOptions}
            />
          </Box>
          <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
            Benchmark for {firstReading?.materialType}: {benchmark?.dryValue}%
            {benchmark && ` (Expected to dry within ${benchmark.maxDryingDays} days)`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedLocation(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" className="m-4">
        {error}
      </Alert>
    );
  }

  return (
    <Paper className={`p-4 ${className}`}>
      <Typography variant="h6" gutterBottom>
        Moisture Reading History
      </Typography>

      {readingHistory.length === 0 ? (
        <Alert severity="info">
          No moisture readings recorded yet. Add readings from the sketch map.
        </Alert>
      ) : (
        <>
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Overall Progress
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Box flexGrow={1} bgcolor="grey.200" borderRadius={1} height={10}>
                <Box
                  bgcolor="primary.main"
                  height="100%"
                  borderRadius={1}
                  style={{
                    width: `${getLocationProgress(readingHistory[readingHistory.length - 1].readings)}%`,
                  }}
                />
              </Box>
              <Typography variant="body2" color="textSecondary">
                {Math.round(getLocationProgress(readingHistory[readingHistory.length - 1].readings))}% Dry
              </Typography>
            </Box>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Material</TableCell>
                  <TableCell align="right">Reading</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Trend</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {readingHistory.map((day) => (
                  day.readings.map((reading) => {
                    const status = getReadingStatus(reading);
                    const statusColors = {
                      dry: 'success',
                      drying: 'warning',
                      concern: 'error',
                      unknown: 'default',
                    };

                    return (
                      <TableRow key={`${day.date}-${reading.id}`}>
                        <TableCell>{day.date}</TableCell>
                        <TableCell>{reading.locationDescription || `Location ${reading.id}`}</TableCell>
                        <TableCell>{reading.materialType}</TableCell>
                        <TableCell align="right">{reading.value}%</TableCell>
                        <TableCell>
                          <Chip
                            label={status.charAt(0).toUpperCase() + status.slice(1)}
                            color={statusColors[status] as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            onClick={() => setSelectedLocation(reading.id)}
                          >
                            View Trend
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {renderTrendDialog()}
        </>
      )}
    </Paper>
  );
};

export default MoistureReadingHistory;

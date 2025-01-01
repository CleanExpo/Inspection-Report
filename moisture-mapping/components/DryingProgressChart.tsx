import React from 'react';
import { Box, Typography, Paper, Grid, Alert } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { DryingProgress, analyzeDryingTrend, MoistureReading } from '../types/moisture';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import WarningIcon from '@mui/icons-material/Warning';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DryingProgressChartProps {
  progress: DryingProgress[];
  readings?: MoistureReading[]; // Made optional
}

export default function DryingProgressChart({ progress = [], readings = [] }: DryingProgressChartProps) {
  // Calculate trend analysis
  const trendAnalysis = analyzeDryingTrend(readings);
  const latestProgress = progress[progress.length - 1];

  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Drying Progress Over Time',
      },
      tooltip: {
        callbacks: {
          afterBody: function(context: any) {
            const index = context[0].dataIndex;
            const data = progress[index];
            return [
              `Dry Locations: ${data.dryLocationsCount}/${data.totalLocations}`,
              `Warning Locations: ${data.warningLocations}`,
              `Critical Locations: ${data.criticalLocations}`,
              `Readings: ${data.readingsCount}`,
              `Range: ${data.lowestReading.toFixed(1)}% - ${data.highestReading.toFixed(1)}%`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Moisture Content (%)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Inspection Day',
        },
      },
    },
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const data = {
    labels: progress.map((p, index) => `Day ${index + 1} (${formatDate(p.date)})`),
    datasets: [
      {
        label: 'Average Moisture Content',
        data: progress.map(p => p.averageReading),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1,
      },
      {
        label: 'Highest Reading',
        data: progress.map(p => p.highestReading),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.1,
      },
      {
        label: 'Lowest Reading',
        data: progress.map(p => p.lowestReading),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.1,
      },
      // Add trend line
      {
        label: 'Drying Trend',
        data: progress.map((_, index) => {
          const firstAvg = progress[0]?.averageReading ?? 0;
          return firstAvg - (trendAnalysis.dryingRate * index);
        }),
        borderColor: 'rgba(128, 128, 128, 0.5)',
        borderDash: [5, 5],
        pointRadius: 0,
        tension: 0,
      },
    ],
  };

  if (progress.length === 0) {
    return (
      <Paper sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="text.secondary">
          No drying progress data available
        </Typography>
      </Paper>
    );
  }

  const getDryingRateStatus = () => {
    if (trendAnalysis.dryingRate <= 0) return 'poor';
    if (trendAnalysis.dryingRate < 1) return 'slow';
    if (trendAnalysis.dryingRate < 2) return 'moderate';
    return 'good';
  };

  const getDryingRateColor = () => {
    const status = getDryingRateStatus();
    switch (status) {
      case 'poor': return 'error.main';
      case 'slow': return 'warning.main';
      case 'moderate': return 'info.main';
      case 'good': return 'success.main';
      default: return 'text.primary';
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box sx={{ height: '400px', position: 'relative' }}>
            <Line options={options} data={data} />
          </Box>
        </Grid>

        {/* Progress Summary */}
        <Grid item xs={12} md={6}>
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Current Progress
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Dry Locations:
                </Typography>
                <Typography variant="h6" color="success.main">
                  {latestProgress.dryLocationsCount}/{latestProgress.totalLocations}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Problem Areas:
                </Typography>
                <Typography variant="h6" color="error.main">
                  {latestProgress.criticalLocations}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Average Moisture: {latestProgress.averageReading.toFixed(1)}%
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Grid>

        {/* Trend Analysis */}
        <Grid item xs={12} md={6}>
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Drying Trend Analysis
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {trendAnalysis.dryingRate > 0 ? (
                    <TrendingUpIcon sx={{ color: getDryingRateColor() }} />
                  ) : (
                    <TrendingDownIcon color="error" />
                  )}
                  <Typography variant="body2">
                    Drying Rate: {trendAnalysis.dryingRate.toFixed(2)}% per day
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2">
                  Estimated Days Until Dry: {
                    trendAnalysis.estimatedDryingDays > 0 
                      ? `${trendAnalysis.estimatedDryingDays} days`
                      : 'Cannot estimate'
                  }
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Grid>

        {/* Problem Areas Alert */}
        {trendAnalysis.problemAreas.length > 0 && (
          <Grid item xs={12}>
            <Alert 
              severity="warning"
              icon={<WarningIcon />}
              sx={{ mt: 2 }}
            >
              Problem Areas Requiring Attention: {trendAnalysis.problemAreas.join(', ')}
            </Alert>
          </Grid>
        )}

        {/* Recommendations */}
        {getDryingRateStatus() === 'poor' && (
          <Grid item xs={12}>
            <Alert 
              severity="error"
              sx={{ mt: 2 }}
            >
              <Box>
                <Typography variant="body2" gutterBottom>
                  Drying rate is insufficient. Consider:
                </Typography>
                <Box component="div" sx={{ pl: 2 }}>
                  <Typography variant="body2">• Increasing air movement in problem areas</Typography>
                  <Typography variant="body2">• Checking dehumidifier placement and operation</Typography>
                  <Typography variant="body2">• Investigating potential hidden moisture sources</Typography>
                </Box>
              </Box>
            </Alert>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
}

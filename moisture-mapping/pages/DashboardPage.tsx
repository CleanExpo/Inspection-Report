import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Box,
  Stack,
  IconButton,
  Tooltip,
  Button
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Add as AddIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Schedule as PendingIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';

import { useAppContext } from '../context/AppContext';
import { useLoading } from '../context/LoadingContext';
import ErrorBoundary from '../components/ErrorBoundary';
import LidarMoistureMap from '../components/LidarMoistureMap';
import AdvancedReporting from '../components/AdvancedReporting';
import { 
  Report, 
  AppState 
} from '../types/shared';
import { 
  TimeSeriesData, 
  LidarScan,
  StructuralRisk 
} from '../types/lidar';
import { MoistureReading } from '../types/moisture';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <Card>
    <CardContent>
      <Stack direction="row" spacing={2} alignItems="center">
        <Box sx={{ color: color || 'primary.main' }}>{icon}</Box>
        <Box>
          <Typography variant="h4">{value}</Typography>
          <Typography color="text.secondary">{title}</Typography>
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const { state } = useAppContext();
  const { showNotification } = useLoading();

  // Calculate statistics
  const stats = {
    activeInspections: state.reports.filter((r: Report) => r.status === 'pending').length,
    criticalReadings: state.moistureReadings.filter((r: MoistureReading) => r.value > 25).length,
    completedInspections: state.reports.filter((r: Report) => r.status === 'approved').length,
    totalReadings: state.moistureReadings.length
  };

  // Get recent activity
  const recentActivity = state.reports
    .sort((a: Report, b: Report) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, 5);

  // Prepare time series data
  const timeSeriesData: TimeSeriesData[] = state.lidarScans.map((scan: LidarScan) => ({
    timestamp: scan.timestamp,
    moistureReadings: scan.moisturePoints,
    thermalData: scan.thermalPoints,
    structuralChanges: scan.structuralRisks?.map((risk: StructuralRisk) => ({
      location: risk.location,
      type: 'moisture-damage',
      value: 1
    }))
  }));

  return (
    <ErrorBoundary>
      <Box sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h4">Dashboard</Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {/* Handle new inspection */}}
            >
              New Inspection
            </Button>
            <Tooltip title="Refresh Data">
              <IconButton onClick={() => {/* Handle refresh */}}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        <Grid container spacing={3}>
          {/* Statistics */}
          <Grid item xs={12} md={3}>
            <StatCard
              title="Active Inspections"
              value={stats.activeInspections}
              icon={<PendingIcon fontSize="large" />}
              color="#1976d2"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard
              title="Critical Readings"
              value={stats.criticalReadings}
              icon={<WarningIcon fontSize="large" />}
              color="#d32f2f"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard
              title="Completed Inspections"
              value={stats.completedInspections}
              icon={<CheckIcon fontSize="large" />}
              color="#2e7d32"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard
              title="Total Readings"
              value={stats.totalReadings}
              icon={<TimelineIcon fontSize="large" />}
              color="#ed6c02"
            />
          </Grid>

          {/* Map Overview */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Active Moisture Map
              </Typography>
              <LidarMoistureMap
                readings={state.moistureReadings}
                onMoistureReading={() => {}}
              />
            </Paper>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <Stack spacing={2}>
                {recentActivity.map((report: Report) => (
                  <Card key={report.id} variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1">
                        {report.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(report.timestamp).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2">
                        Status: {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Paper>
          </Grid>

          {/* Analytics Overview */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Analytics Overview
              </Typography>
              <AdvancedReporting
                reports={state.reports}
                moistureReadings={state.moistureReadings}
                timeSeriesData={timeSeriesData}
                onExport={() => {}}
                onPrint={() => {}}
                onShare={() => {}}
              />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </ErrorBoundary>
  );
}

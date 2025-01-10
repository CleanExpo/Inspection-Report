import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { MonthlyStats, PerformanceMetrics } from '../../types/analytics';

interface MonthlyTrendsChartProps {
  monthlyData: MonthlyStats[];
  performanceMetrics: PerformanceMetrics;
}

export default function MonthlyTrendsChart({ 
  monthlyData,
  performanceMetrics 
}: MonthlyTrendsChartProps) {
  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" gutterBottom align="center">
        Monthly Trends & Performance
      </Typography>
      <Grid container spacing={2}>
        {/* Monthly Trends Line Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="subtitle1" gutterBottom>
              Monthly Activity Trends
            </Typography>
            <ResponsiveContainer>
              <LineChart
                data={monthlyData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="newClaims"
                  stroke="#8884d8"
                  name="New Claims"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="closedClaims"
                  stroke="#82ca9d"
                  name="Closed Claims"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="activeEquipment"
                  stroke="#ffc658"
                  name="Active Equipment"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Performance Metrics */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Performance Metrics
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Avg. Resolution Time
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {performanceMetrics.averageResolutionTime}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Days
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Client Satisfaction
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {performanceMetrics.clientSatisfactionRate}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Rating
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Equipment Utilization
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {performanceMetrics.equipmentUtilizationRate}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Rate
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Inspection Completion
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {performanceMetrics.inspectionCompletionRate}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Rate
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

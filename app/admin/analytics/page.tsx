'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssessmentIcon from '@mui/icons-material/Assessment';
import {
  ClaimTypeChart,
  ClaimAgeChart,
  EquipmentStatsChart,
  MonthlyTrendsChart
} from '../../components/analytics';
import { AnalyticsService } from '../../services/analyticsService';
import { AnalyticsDashboardData } from '../../types/analytics';

const analyticsService = AnalyticsService.getInstance();

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const dashboardData = await analyticsService.getDashboardData();
      setData(dashboardData);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          {error || 'Failed to load analytics data'}
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ 
        position: 'sticky', 
        top: 0, 
        bgcolor: 'background.default', 
        zIndex: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        py: 1.5,
        mb: 2
      }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Link href="/admin" style={{ textDecoration: 'none', color: 'inherit' }}>
              <IconButton size="small" sx={{ mr: 2 }}>
                <ArrowBackIcon />
              </IconButton>
            </Link>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AssessmentIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Box>
                <Typography variant="h5" component="h1">
                  Reports & Analytics
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Visual insights into claims, equipment, and performance metrics
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pb: 4 }}>
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Claims
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {data.claimStats.totalClaims}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Open Claims
                  </Typography>
                  <Typography variant="h4" sx={{ color: 'warning.main' }}>
                    {data.claimStats.openClaims}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Average Claim Age
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {data.claimStats.averageAge}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Days
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Equipment Utilization
                  </Typography>
                  <Typography variant="h4" sx={{ color: 'success.main' }}>
                    {data.equipmentStats.utilizationRate}%
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          {/* Claims Distribution */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <ClaimTypeChart data={data.claimsByType} />
            </Paper>
          </Grid>

          {/* Claims Age Distribution */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <ClaimAgeChart data={data.claimsByAge} />
            </Paper>
          </Grid>

          {/* Equipment Statistics */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <EquipmentStatsChart data={data.equipmentStats} />
            </Paper>
          </Grid>

          {/* Monthly Trends and Performance */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <MonthlyTrendsChart 
                monthlyData={data.monthlyStats}
                performanceMetrics={data.performanceMetrics}
              />
            </Paper>
          </Grid>

          {/* Regional Statistics */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Regional Performance
              </Typography>
              <Grid container spacing={2}>
                {data.regionalStats.map((region) => (
                  <Grid item xs={12} sm={6} md={4} key={region.region}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 2, 
                        bgcolor: 'background.default',
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <Typography variant="subtitle1" gutterBottom>
                        {region.region}
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Claims
                          </Typography>
                          <Typography variant="h6">
                            {region.claimCount}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Equipment
                          </Typography>
                          <Typography variant="h6">
                            {region.equipmentCount}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">
                            Avg. Resolution Time
                          </Typography>
                          <Typography variant="h6">
                            {region.averageResolutionTime} days
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

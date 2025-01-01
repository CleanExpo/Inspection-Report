'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from '@mui/material';
import { performanceMonitor } from '../../utils/performance';
import { roomLayoutCache, moistureReadingCache } from '../../services/cacheService';

interface MetricDisplay {
  label: string;
  value: number;
  unit: string;
}

export default function PerformanceDashboard() {
  const theme = useTheme();
  const [metrics, setMetrics] = useState<MetricDisplay[]>([]);
  const [memory, setMemory] = useState<{ used: number; total: number }>({ used: 0, total: 0 });
  const [errors, setErrors] = useState<{ message: string; timestamp: string }[]>([]);
  const [cacheStats, setCacheStats] = useState({
    layouts: { size: 0 },
    readings: { size: 0 },
  });

  useEffect(() => {
    const updateMetrics = () => {
      // Collect performance metrics
      const layoutLoadTime = performanceMonitor.getAverageMetric('get_layout');
      const saveTime = performanceMonitor.getAverageMetric('save_layouts');
      const validationTime = performanceMonitor.getAverageMetric('validate_layout');
      const cacheHitTime = performanceMonitor.getAverageMetric('cache_get');

      setMetrics([
        { label: 'Layout Load Time', value: layoutLoadTime, unit: 'ms' },
        { label: 'Save Operation', value: saveTime, unit: 'ms' },
        { label: 'Validation', value: validationTime, unit: 'ms' },
        { label: 'Cache Access', value: cacheHitTime, unit: 'ms' },
      ]);

      // Collect memory usage
      const memoryUsage = performanceMonitor.getMemoryUsage();
      if (memoryUsage.usedJSHeapSize && memoryUsage.totalJSHeapSize) {
        setMemory({
          used: Math.round(memoryUsage.usedJSHeapSize / 1024 / 1024),
          total: Math.round(memoryUsage.totalJSHeapSize / 1024 / 1024),
        });
      }

      // Collect error logs
      const errorLogs = performanceMonitor.getErrorLogs();
      setErrors(
        errorLogs.map(log => ({
          message: log.message,
          timestamp: log.timestamp,
        }))
      );

      // Collect cache stats
      setCacheStats({
        layouts: { size: roomLayoutCache.size() },
        readings: { size: moistureReadingCache.size() },
      });
    };

    // Initial update
    updateMetrics();

    // Update every 5 seconds
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  const getMemoryUsageColor = (used: number, total: number): string => {
    const usage = (used / total) * 100;
    if (usage > 90) return theme.palette.error.main;
    if (usage > 70) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Performance Metrics
      </Typography>

      <Grid container spacing={3}>
        {/* Performance Metrics */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Operation Times
            </Typography>
            {metrics.map((metric) => (
              <Box key={metric.label} sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {metric.label}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((metric.value / 1000) * 100, 100)}
                    sx={{ flexGrow: 1 }}
                  />
                  <Typography variant="body2" sx={{ minWidth: 60 }}>
                    {metric.value.toFixed(1)} {metric.unit}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Memory Usage */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Memory Usage
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Heap Usage
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={(memory.used / memory.total) * 100}
                  sx={{
                    flexGrow: 1,
                    '& .MuiLinearProgress-bar': {
                      bgcolor: getMemoryUsageColor(memory.used, memory.total),
                    },
                  }}
                />
                <Typography variant="body2" sx={{ minWidth: 100 }}>
                  {memory.used} / {memory.total} MB
                </Typography>
              </Box>
            </Box>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Cache Statistics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Layout Cache
                </Typography>
                <Typography variant="h4">{cacheStats.layouts.size}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Reading Cache
                </Typography>
                <Typography variant="h4">{cacheStats.readings.size}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Error Logs */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Errors
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Error Message</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {errors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} align="center">
                        No errors recorded
                      </TableCell>
                    </TableRow>
                  ) : (
                    errors.map((error, index) => (
                      <TableRow key={index}>
                        <TableCell>{new Date(error.timestamp).toLocaleString()}</TableCell>
                        <TableCell>{error.message}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

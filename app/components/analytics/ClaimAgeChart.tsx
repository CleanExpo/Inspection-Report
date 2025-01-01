import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Box, Typography } from '@mui/material';
import { ClaimByAge } from '../../types/analytics';

interface ClaimAgeChartProps {
  data: ClaimByAge[];
}

export default function ClaimAgeChart({ data }: ClaimAgeChartProps) {
  return (
    <Box sx={{ width: '100%', height: 300 }}>
      <Typography variant="h6" gutterBottom align="center">
        Claims by Age
      </Typography>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="range" />
          <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
          <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
          <Tooltip
            formatter={(value: any, name: string) => [
              name === 'count' ? value : `${value}%`,
              name === 'count' ? 'Claims' : 'Percentage'
            ]}
          />
          <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="Claims" />
          <Bar yAxisId="right" dataKey="percentage" fill="#82ca9d" name="Percentage" />
        </BarChart>
      </ResponsiveContainer>
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Distribution of claims by age range
        </Typography>
      </Box>
    </Box>
  );
}

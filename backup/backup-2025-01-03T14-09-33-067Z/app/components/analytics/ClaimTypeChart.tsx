import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Box, Typography } from '@mui/material';
import { ClaimByType } from '../../types/analytics';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface ClaimTypeChartProps {
  data: ClaimByType[];
}

export default function ClaimTypeChart({ data }: ClaimTypeChartProps) {
  const totalClaims = data.reduce((sum, item) => sum + item.count, 0);
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Box sx={{ width: '100%', height: 300 }}>
      <Typography variant="h6" gutterBottom align="center">
        Claims by Type
      </Typography>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
            nameKey="type"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: any, name: any, props: any) => [
              `Count: ${value}`,
              `Value: $${props.payload.value.toLocaleString()}`
            ]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Total Claims: {totalClaims}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total Value: ${totalValue.toLocaleString()}
        </Typography>
      </Box>
    </Box>
  );
}

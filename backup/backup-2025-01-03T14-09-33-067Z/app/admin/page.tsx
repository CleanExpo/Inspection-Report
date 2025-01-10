'use client';

import React from 'react';
import { Box, Container, Typography, Paper, Grid } from '@mui/material';
import Link from 'next/link';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import SettingsIcon from '@mui/icons-material/Settings';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupIcon from '@mui/icons-material/Group';
import AnalyticsIcon from '@mui/icons-material/Analytics';

const adminFeatures = [
  {
    icon: <PersonIcon sx={{ fontSize: 40 }} />,
    title: 'User Management',
    description: 'Manage technicians, inspectors, and admin access',
    path: '/admin/users'
  },
  {
    icon: <BusinessIcon sx={{ fontSize: 40 }} />,
    title: 'Company Details',
    description: 'Update company information and branding',
    path: '/admin/company'
  },
  {
    icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
    title: 'Inspection Templates',
    description: 'Create and manage inspection templates',
    path: '/admin/templates'
  },
  {
    icon: <GroupIcon sx={{ fontSize: 40 }} />,
    title: 'Client Management',
    description: 'Manage client information and history',
    path: '/admin/clients'
  },
  {
    icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
    title: 'Reports & Analytics',
    description: 'View inspection statistics and reports',
    path: '/admin/analytics'
  },
  {
    icon: <SettingsIcon sx={{ fontSize: 40 }} />,
    title: 'System Settings',
    description: 'Configure system preferences and defaults',
    path: '/admin/settings'
  }
];

export default function AdminPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Administration
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Manage inspection details and administrative tasks
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {adminFeatures.map((feature, index) => (
          <Grid item xs={12} md={6} lg={4} key={index}>
            <Link href={feature.path} style={{ textDecoration: 'none' }}>
              <Paper
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  }
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2,
                  color: 'primary.main'
                }}>
                  {feature.icon}
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    {feature.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

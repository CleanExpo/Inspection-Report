'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Dashboard as DashboardIcon,
  Description as DescriptionIcon,
  Menu as MenuIcon,
  PhotoCamera as PhotoCameraIcon,
  Settings as SettingsIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon,
  WaterDrop as WaterDropIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import MobileMenu from './MobileMenu';

export interface NavigationItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  description?: string;
}

export const navigationItems: NavigationItem[] = [
  {
    label: 'Dashboard',
    path: '/',
    icon: <DashboardIcon />,
    description: 'Overview and quick actions',
  },
  {
    label: 'Moisture Mapping',
    path: '/moisture',
    icon: <WaterDropIcon />,
    description: 'Create and manage moisture readings',
  },
  {
    label: 'Reports',
    path: '/reports',
    icon: <DescriptionIcon />,
    description: 'Generate and view reports',
  },
  {
    label: 'Photos',
    path: '/photos',
    icon: <PhotoCameraIcon />,
    description: 'Manage inspection photos',
  },
  {
    label: 'Hazards',
    path: '/hazards',
    icon: <WarningIcon />,
    description: 'Document hazardous conditions',
  },
  {
    label: 'Analytics',
    path: '/analytics',
    icon: <AssessmentIcon />,
    description: 'View data analytics and insights',
  },
  {
    label: 'Performance',
    path: '/performance',
    icon: <SpeedIcon />,
    description: 'Monitor system performance',
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: <SettingsIcon />,
    description: 'Configure application settings',
  },
];

const DRAWER_WIDTH = 240;

export default function Navigation() {
  const theme = useTheme();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Inspection Report
        </Typography>
      </Toolbar>
      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              onClick={() => {
                router.push(item.path);
                if (mobileOpen) handleDrawerToggle();
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                secondary={item.description}
                secondaryTypographyProps={{
                  sx: { display: { xs: 'none', sm: 'block' } },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Inspection Report
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile drawer */}
        <MobileMenu open={mobileOpen} onClose={handleDrawerToggle} />

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content wrapper */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: ['48px', '56px', '64px'],
        }}
      >
        <Toolbar />
      </Box>
    </Box>
  );
}

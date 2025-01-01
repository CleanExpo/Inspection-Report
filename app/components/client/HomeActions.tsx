'use client';

import React, { memo } from 'react';
import { useRouter } from 'next/navigation';
import { Box } from '@mui/material';
import dynamic from 'next/dynamic';

// Dynamically import QuickActions to reduce initial bundle size
const QuickActions = dynamic(
  () => import('../../../components/QuickActions'),
  { 
    ssr: true,
    loading: () => null 
  }
);

function HomeActions() {
  const router = useRouter();

  // Memoize handlers to prevent recreating on each render
  const handleQuickActions = React.useMemo(() => ({
    onNewInspection: () => router.push('/inspection/new'),
    onViewReports: () => router.push('/inspection/reports'),
    onViewGallery: () => router.push('/photos')
  }), [router]);

  return (
    <Box sx={{ mt: 'auto' }}>
      <QuickActions {...handleQuickActions} />
    </Box>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(HomeActions);

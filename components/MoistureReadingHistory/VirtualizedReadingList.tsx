import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Box,
  TableCell,
  TableRow,
  Chip,
  Button,
  Typography,
} from '@mui/material';
import { createVirtualWindow, debounce } from '@/utils/performance';
import { MoistureReading } from '@/types/moisture';
import styles from '@/styles/MoistureMapping.module.css';

interface VirtualizedReadingListProps {
  readings: MoistureReading[];
  getReadingStatus: (reading: MoistureReading) => 'dry' | 'drying' | 'concern' | 'unknown';
  onViewTrend: (readingId: string) => void;
  className?: string;
}

const ITEM_HEIGHT = 56; // Height of each row in pixels
const OVERSCAN = 5; // Number of items to render beyond visible area

export const VirtualizedReadingList: React.FC<VirtualizedReadingListProps> = ({
  readings,
  getReadingStatus,
  onViewTrend,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  const virtualizer = createVirtualWindow(
    readings.length,
    ITEM_HEIGHT,
    containerHeight
  );

  // Update container height on resize
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };

    const debouncedUpdate = debounce(updateHeight, 100);

    updateHeight();
    window.addEventListener('resize', debouncedUpdate);

    return () => window.removeEventListener('resize', debouncedUpdate);
  }, []);

  // Handle scroll
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  // Get visible range
  const { start, end } = virtualizer.getVisibleRange(scrollTop);
  const visibleReadings = readings.slice(
    Math.max(0, start - OVERSCAN),
    Math.min(readings.length, end + OVERSCAN)
  );

  // Status colors for readings
  const statusColors = {
    dry: 'success',
    drying: 'warning',
    concern: 'error',
    unknown: 'default',
  };

  return (
    <Box
      ref={containerRef}
      onScroll={handleScroll}
      className={`${styles.virtualList} ${className}`}
      sx={{
        height: '100%',
        overflow: 'auto',
        position: 'relative',
      }}
    >
      {/* Spacer for total content height */}
      <Box sx={{ height: virtualizer.getTotalHeight() }} />

      {/* Rendered items */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          transform: `translateY(${virtualizer.getOffsetForIndex(
            Math.max(0, start - OVERSCAN)
          )}px)`,
        }}
      >
        {visibleReadings.map((reading) => {
          const status = getReadingStatus(reading);
          return (
            <Box
              key={reading.id}
              className={styles.readingRow}
              sx={{ height: ITEM_HEIGHT }}
            >
              <Box className={styles.readingContent}>
                <Typography variant="body2" className={styles.readingLocation}>
                  {reading.locationDescription || `Location ${reading.id}`}
                </Typography>
                <Typography variant="body2" className={styles.readingMaterial}>
                  {reading.materialType}
                </Typography>
                <Typography variant="body2" className={styles.readingValue}>
                  {reading.value}%
                </Typography>
                <Chip
                  label={status.charAt(0).toUpperCase() + status.slice(1)}
                  color={statusColors[status] as any}
                  size="small"
                  className={styles.readingStatus}
                />
                <Button
                  size="small"
                  onClick={() => onViewTrend(reading.id)}
                  className={styles.trendButton}
                >
                  View Trend
                </Button>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Loading indicator for large datasets */}
      {readings.length > 1000 && (
        <Box
          className={styles.loadingIndicator}
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            background: 'rgba(255, 255, 255, 0.8)',
            padding: '4px 8px',
            borderRadius: 1,
          }}
        >
          <Typography variant="caption" color="textSecondary">
            Showing {start + 1}-{Math.min(end, readings.length)} of{' '}
            {readings.length} readings
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default VirtualizedReadingList;

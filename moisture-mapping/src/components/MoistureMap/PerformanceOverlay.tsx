import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { PerformanceMonitor } from '../../services/performance-monitor';

interface PerformanceMetrics {
    fps: number;
    frameTime: number;
    drawCalls: number;
    dirtyRegions: number;
}

interface PerformanceOverlayProps {
    enabled?: boolean;
    className?: string;
}

export const PerformanceOverlay: React.FC<PerformanceOverlayProps> = ({
    enabled = true,
    className
}) => {
    const [metrics, setMetrics] = useState<PerformanceMetrics>({
        fps: 0,
        frameTime: 0,
        drawCalls: 0,
        dirtyRegions: 0
    });

    useEffect(() => {
        const monitor = PerformanceMonitor.getInstance();
        
        if (enabled) {
            monitor.enable();
        } else {
            monitor.disable();
            return;
        }

        const handleMetricsUpdate = (newMetrics: PerformanceMetrics) => {
            setMetrics(newMetrics);
        };

        monitor.addListener(handleMetricsUpdate);

        return () => {
            monitor.removeListener(handleMetricsUpdate);
            monitor.disable();
        };
    }, [enabled]);

    if (!enabled) return null;

    const getColorForFPS = (fps: number): string => {
        if (fps >= 55) return 'success.main';
        if (fps >= 30) return 'warning.main';
        return 'error.main';
    };

    return (
        <Paper
            elevation={3}
            className={className}
            sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                p: 2,
                bgcolor: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                borderRadius: 1,
                minWidth: 200,
                pointerEvents: 'none'
            }}
        >
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                Performance Metrics
            </Typography>
            <Box sx={{ display: 'grid', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>FPS:</Typography>
                    <Typography color={getColorForFPS(metrics.fps)}>
                        {metrics.fps.toFixed(0)}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Frame Time:</Typography>
                    <Typography>
                        {metrics.frameTime.toFixed(1)}ms
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Draw Calls:</Typography>
                    <Typography>
                        {metrics.drawCalls}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Dirty Regions:</Typography>
                    <Typography>
                        {metrics.dirtyRegions}
                    </Typography>
                </Box>
            </Box>
        </Paper>
    );
};

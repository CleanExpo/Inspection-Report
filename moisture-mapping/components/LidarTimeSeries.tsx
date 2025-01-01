import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Slider,
  IconButton,
  Stack,
  Tooltip
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  SkipNext as NextIcon,
  SkipPrevious as PrevIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import {
  TimeSeriesData,
  MoisturePoint3D,
  ThermalPoint,
  Point3D
} from '../types/lidar';
import { getMoistureColor } from '../types/moisture';

interface LidarTimeSeriesProps {
  data: TimeSeriesData[];
  currentIndex: number;
  onTimeChange: (index: number) => void;
  width?: number;
  height?: number;
  showMoisture?: boolean;
  showThermal?: boolean;
  showStructural?: boolean;
}

interface TimelinePoint {
  timestamp: string;
  moistureAvg: number;
  temperatureAvg?: number;
  structuralChanges?: number;
}

export default function LidarTimeSeries({
  data,
  currentIndex,
  onTimeChange,
  width = 800,
  height = 200,
  showMoisture = true,
  showThermal = false,
  showStructural = false
}: LidarTimeSeriesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [timelineData, setTimelineData] = useState<TimelinePoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Process time series data
  useEffect(() => {
    setIsLoading(true);
    try {
      const processedData = data.map(timePoint => {
        const moistureReadings = timePoint.moistureReadings.map(r => r.reading.value);
        const moistureAvg = moistureReadings.length > 0
          ? moistureReadings.reduce((a, b) => a + b, 0) / moistureReadings.length
          : 0;

        const temperatureAvg = timePoint.thermalData?.length
          ? timePoint.thermalData.reduce((sum, point) => sum + point.temperature, 0) / timePoint.thermalData.length
          : undefined;

        const structuralChanges = timePoint.structuralChanges?.length || 0;

        return {
          timestamp: timePoint.timestamp,
          moistureAvg,
          temperatureAvg,
          structuralChanges
        };
      });

      setTimelineData(processedData);
    } catch (err) {
      console.error('Error processing time series data:', err);
      setError('Failed to process time series data');
    } finally {
      setIsLoading(false);
    }
  }, [data]);

  // Draw timeline
  useEffect(() => {
    if (!canvasRef.current || !timelineData.length) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate scales
    const xScale = (width - 40) / (timelineData.length - 1);
    const yScale = (height - 40) / 100; // Assuming percentage values 0-100

    // Draw grid
    drawGrid(ctx, width, height);

    // Draw moisture line
    if (showMoisture) {
      ctx.beginPath();
      ctx.strokeStyle = '#2196f3';
      ctx.lineWidth = 2;

      timelineData.forEach((point, i) => {
        const x = 20 + i * xScale;
        const y = height - 20 - (point.moistureAvg * yScale);
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    }

    // Draw thermal line
    if (showThermal && timelineData.some(d => d.temperatureAvg !== undefined)) {
      ctx.beginPath();
      ctx.strokeStyle = '#f44336';
      ctx.lineWidth = 2;

      timelineData.forEach((point, i) => {
        if (point.temperatureAvg === undefined) return;
        const x = 20 + i * xScale;
        const y = height - 20 - ((point.temperatureAvg / 50) * (height - 40)); // Scale temperature to 0-50°C
        if (i === 0 || !timelineData[i-1].temperatureAvg) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    }

    // Draw structural changes markers
    if (showStructural) {
      timelineData.forEach((point, i) => {
        if (!point.structuralChanges) return;
        const x = 20 + i * xScale;
        ctx.beginPath();
        ctx.fillStyle = '#ff9800';
        ctx.arc(x, 20, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Draw current time marker
    const currentX = 20 + currentIndex * xScale;
    ctx.beginPath();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.moveTo(currentX, 0);
    ctx.lineTo(currentX, height);
    ctx.stroke();
    ctx.setLineDash([]);

  }, [timelineData, currentIndex, width, height, showMoisture, showThermal, showStructural]);

  // Playback control
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      onTimeChange((currentIndex + 1) % data.length);
    }, 1000 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, currentIndex, data.length, playbackSpeed, onTimeChange]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !timelineData.length) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left - 20;
    const xScale = (width - 40) / (timelineData.length - 1);
    const index = Math.round(x / xScale);

    if (index >= 0 && index < timelineData.length) {
      onTimeChange(index);
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Time Series Analysis
      </Typography>

      <Box sx={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onClick={handleCanvasClick}
          style={{
            border: '1px solid #ddd',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        />

        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(255, 255, 255, 0.8)'
            }}
          >
            <CircularProgress size={24} />
          </Box>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
        <IconButton onClick={() => onTimeChange(Math.max(0, currentIndex - 1))}>
          <PrevIcon />
        </IconButton>
        <IconButton onClick={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </IconButton>
        <IconButton onClick={() => onTimeChange(Math.min(data.length - 1, currentIndex + 1))}>
          <NextIcon />
        </IconButton>
        <Tooltip title="Playback Speed">
          <Box sx={{ width: 100 }}>
            <Slider
              size="small"
              value={playbackSpeed}
              min={0.5}
              max={3}
              step={0.5}
              onChange={(_, value) => setPlaybackSpeed(value as number)}
              valueLabelDisplay="auto"
              valueLabelFormat={x => `${x}x`}
            />
          </Box>
        </Tooltip>
      </Stack>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        {new Date(data[currentIndex].timestamp).toLocaleString()}
      </Typography>

      {timelineData[currentIndex] && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2">
            Average Moisture: {timelineData[currentIndex].moistureAvg.toFixed(1)}%
            {timelineData[currentIndex].temperatureAvg !== undefined && 
              ` | Temperature: ${timelineData[currentIndex].temperatureAvg.toFixed(1)}°C`}
            {timelineData[currentIndex].structuralChanges !== undefined &&
              ` | Changes Detected: ${timelineData[currentIndex].structuralChanges}`}
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

// Helper function to draw grid
const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  ctx.strokeStyle = '#f0f0f0';
  ctx.lineWidth = 1;

  // Vertical lines
  for (let x = 20; x < width; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Horizontal lines
  for (let y = 20; y < height; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Axes
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  
  // X axis
  ctx.beginPath();
  ctx.moveTo(20, height - 20);
  ctx.lineTo(width, height - 20);
  ctx.stroke();

  // Y axis
  ctx.beginPath();
  ctx.moveTo(20, 0);
  ctx.lineTo(20, height - 20);
  ctx.stroke();
};

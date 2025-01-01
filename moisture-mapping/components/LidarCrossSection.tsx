import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import * as THREE from 'three';
import { MoistureReading, getMoistureColor } from '../types/moisture';
import {
  CrossSection,
  Point3D,
  MoisturePoint3D,
  ThermalPoint
} from '../types/lidar';

interface LidarCrossSectionProps {
  crossSection: CrossSection;
  width?: number;
  height?: number;
  showMoisture?: boolean;
  showThermal?: boolean;
  onPointClick?: (point: Point3D) => void;
}

interface ColorScale {
  min: number;
  max: number;
  getColor: (value: number) => string;
}

const thermalColorScale: ColorScale = {
  min: 0,
  max: 40,
  getColor: (temp: number) => {
    // Color scale from cool (blue) to hot (red)
    const normalized = (temp - thermalColorScale.min) / (thermalColorScale.max - thermalColorScale.min);
    if (normalized <= 0.25) {
      return `rgb(0, 0, ${Math.round(255 * (normalized * 4))})`;
    } else if (normalized <= 0.5) {
      return `rgb(0, ${Math.round(255 * ((normalized - 0.25) * 4))}, 255)`;
    } else if (normalized <= 0.75) {
      return `rgb(${Math.round(255 * ((normalized - 0.5) * 4))}, 255, ${Math.round(255 * (1 - ((normalized - 0.5) * 4)))})`;
    } else {
      return `rgb(255, ${Math.round(255 * (1 - ((normalized - 0.75) * 4)))}, 0)`;
    }
  }
};

export default function LidarCrossSection({
  crossSection,
  width = 800,
  height = 400,
  showMoisture = true,
  showThermal = false,
  onPointClick
}: LidarCrossSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [scale, setScale] = useState({ x: 1, y: 1 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    canvasRef.current.width = width;
    canvasRef.current.height = height;
    setContext(ctx);

    // Calculate scale and offset to fit all points
    const bounds = calculateBounds(crossSection.points);
    const xScale = (width - 40) / (bounds.max.x - bounds.min.x);
    const yScale = (height - 40) / (bounds.max.y - bounds.min.y);
    const scale = Math.min(xScale, yScale);

    setScale({ x: scale, y: scale });
    setOffset({
      x: 20 - bounds.min.x * scale,
      y: 20 - bounds.min.y * scale
    });
  }, [width, height, crossSection]);

  // Draw cross section
  useEffect(() => {
    if (!context || !canvasRef.current) return;

    setIsLoading(true);
    try {
      // Clear canvas
      context.clearRect(0, 0, width, height);

      // Draw grid
      drawGrid(context, width, height);

      // Draw points
      crossSection.points.forEach(point => {
        const screenX = point.x * scale.x + offset.x;
        const screenY = point.y * scale.y + offset.y;

        context.beginPath();
        context.arc(screenX, screenY, 2, 0, Math.PI * 2);
        context.fillStyle = '#888';
        context.fill();
      });

      // Draw moisture readings
      if (showMoisture) {
        crossSection.moistureReadings.forEach(point => {
          const screenX = point.x * scale.x + offset.x;
          const screenY = point.y * scale.y + offset.y;

          context.beginPath();
          context.arc(screenX, screenY, 5, 0, Math.PI * 2);
          context.fillStyle = getMoistureColor(point.reading.value, point.reading.materialType);
          context.fill();
          context.strokeStyle = '#000';
          context.stroke();

          // Draw value
          context.fillStyle = '#000';
          context.font = '10px Arial';
          context.textAlign = 'center';
          context.fillText(`${point.reading.value}%`, screenX, screenY - 8);
        });
      }

      // Draw thermal data
      if (showThermal && crossSection.thermalData) {
        crossSection.thermalData.forEach(point => {
          const screenX = point.x * scale.x + offset.x;
          const screenY = point.y * scale.y + offset.y;

          context.beginPath();
          context.arc(screenX, screenY, 3, 0, Math.PI * 2);
          context.fillStyle = thermalColorScale.getColor(point.temperature);
          context.fill();
        });
      }

      // Draw axes
      drawAxes(context, width, height);

    } catch (err) {
      console.error('Error drawing cross section:', err);
      setError('Failed to render cross section');
    } finally {
      setIsLoading(false);
    }
  }, [context, crossSection, scale, offset, showMoisture, showThermal]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !onPointClick) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left - offset.x) / scale.x;
    const y = (event.clientY - rect.top - offset.y) / scale.y;

    // Find nearest point
    const point = findNearestPoint(x, y, crossSection.points);
    if (point) {
      onPointClick(point);
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Cross Section - {crossSection.plane.toUpperCase()} Plane
      </Typography>

      <Box sx={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          style={{
            border: '1px solid #ddd',
            borderRadius: 4,
            cursor: onPointClick ? 'crosshair' : 'default'
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

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Position: {crossSection.position.toFixed(2)} units along {getPerpendicularAxis(crossSection.plane)}
      </Typography>
    </Paper>
  );
}

// Helper functions
const calculateBounds = (points: Point3D[]) => {
  const bounds = {
    min: { x: Infinity, y: Infinity },
    max: { x: -Infinity, y: -Infinity }
  };

  points.forEach(point => {
    bounds.min.x = Math.min(bounds.min.x, point.x);
    bounds.min.y = Math.min(bounds.min.y, point.y);
    bounds.max.x = Math.max(bounds.max.x, point.x);
    bounds.max.y = Math.max(bounds.max.y, point.y);
  });

  return bounds;
};

const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  ctx.strokeStyle = '#f0f0f0';
  ctx.lineWidth = 1;

  // Draw vertical lines
  for (let x = 0; x < width; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Draw horizontal lines
  for (let y = 0; y < height; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
};

const drawAxes = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;

  // X axis
  ctx.beginPath();
  ctx.moveTo(0, height - 20);
  ctx.lineTo(width, height - 20);
  ctx.stroke();

  // Y axis
  ctx.beginPath();
  ctx.moveTo(20, 0);
  ctx.lineTo(20, height);
  ctx.stroke();
};

const findNearestPoint = (x: number, y: number, points: Point3D[]): Point3D | null => {
  let nearest: Point3D | null = null;
  let minDistance = Infinity;

  points.forEach(point => {
    const distance = Math.sqrt(
      Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearest = point;
    }
  });

  return minDistance < 0.1 ? nearest : null;
};

const getPerpendicularAxis = (plane: 'xy' | 'yz' | 'xz'): string => {
  switch (plane) {
    case 'xy': return 'Z';
    case 'yz': return 'X';
    case 'xz': return 'Y';
  }
};

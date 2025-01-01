import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Divider,
  Button,
  Stack
} from '@mui/material';
import {
  Straighten as DistanceIcon,
  SquareFoot as AreaIcon,
  ViewInAr as VolumeIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Save as SaveIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import { Point3D } from '../types/lidar';

interface Measurement {
  id: string;
  type: 'distance' | 'area' | 'volume';
  points: Point3D[];
  value: number;
  unit: string;
  timestamp: string;
  label?: string;
}

interface LidarMeasurementsProps {
  onMeasurementStart: (type: 'distance' | 'area' | 'volume') => void;
  onMeasurementComplete: (measurement: Measurement) => void;
  activePoints?: Point3D[];
  isMetric?: boolean;
}

export default function LidarMeasurements({
  onMeasurementStart,
  onMeasurementComplete,
  activePoints = [],
  isMetric = true
}: LidarMeasurementsProps) {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [activeMeasurement, setActiveMeasurement] = useState<'distance' | 'area' | 'volume' | null>(null);
  const [selectedMeasurement, setSelectedMeasurement] = useState<string | null>(null);

  useEffect(() => {
    if (!activeMeasurement || activePoints.length === 0) return;

    const points = [...activePoints];
    let measurement: Measurement | null = null;

    switch (activeMeasurement) {
      case 'distance':
        if (points.length === 2) {
          const distance = calculateDistance(points[0], points[1]);
          measurement = {
            id: `m-${Date.now()}`,
            type: 'distance',
            points,
            value: isMetric ? distance : distance * 3.28084, // Convert to feet
            unit: isMetric ? 'm' : 'ft',
            timestamp: new Date().toISOString()
          };
        }
        break;

      case 'area':
        if (points.length >= 3) {
          const area = calculateArea(points);
          measurement = {
            id: `m-${Date.now()}`,
            type: 'area',
            points,
            value: isMetric ? area : area * 10.7639, // Convert to sq ft
            unit: isMetric ? 'm²' : 'ft²',
            timestamp: new Date().toISOString()
          };
        }
        break;

      case 'volume':
        if (points.length >= 4) {
          const volume = calculateVolume(points);
          measurement = {
            id: `m-${Date.now()}`,
            type: 'volume',
            points,
            value: isMetric ? volume : volume * 35.3147, // Convert to cu ft
            unit: isMetric ? 'm³' : 'ft³',
            timestamp: new Date().toISOString()
          };
        }
        break;
    }

    if (measurement) {
      setMeasurements(prev => [...prev, measurement!]);
      onMeasurementComplete(measurement);
      setActiveMeasurement(null);
    }
  }, [activePoints, activeMeasurement, isMetric]);

  const handleMeasurementStart = (type: 'distance' | 'area' | 'volume') => {
    setActiveMeasurement(type);
    onMeasurementStart(type);
  };

  const handleDeleteMeasurement = (id: string) => {
    setMeasurements(prev => prev.filter(m => m.id !== id));
    if (selectedMeasurement === id) {
      setSelectedMeasurement(null);
    }
  };

  const handleCopyMeasurement = (measurement: Measurement) => {
    const text = `${measurement.type.charAt(0).toUpperCase() + measurement.type.slice(1)}: ${measurement.value.toFixed(2)}${measurement.unit}`;
    navigator.clipboard.writeText(text);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Measurements
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Tooltip title="Measure Distance">
          <IconButton
            color={activeMeasurement === 'distance' ? 'primary' : 'default'}
            onClick={() => handleMeasurementStart('distance')}
          >
            <DistanceIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Measure Area">
          <IconButton
            color={activeMeasurement === 'area' ? 'primary' : 'default'}
            onClick={() => handleMeasurementStart('area')}
          >
            <AreaIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Measure Volume">
          <IconButton
            color={activeMeasurement === 'volume' ? 'primary' : 'default'}
            onClick={() => handleMeasurementStart('volume')}
          >
            <VolumeIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      {activeMeasurement && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {getInstructions(activeMeasurement, activePoints.length)}
        </Typography>
      )}

      <List dense>
        {measurements.map((measurement, index) => (
          <React.Fragment key={measurement.id}>
            {index > 0 && <Divider />}
            <ListItemButton
              selected={selectedMeasurement === measurement.id}
              onClick={() => setSelectedMeasurement(measurement.id)}
            >
              <ListItemIcon>
                {measurement.type === 'distance' && <DistanceIcon />}
                {measurement.type === 'area' && <AreaIcon />}
                {measurement.type === 'volume' && <VolumeIcon />}
              </ListItemIcon>
              <ListItemText
                primary={`${measurement.value.toFixed(2)}${measurement.unit}`}
                secondary={new Date(measurement.timestamp).toLocaleString()}
              />
              <Stack direction="row" spacing={1}>
                <Tooltip title="Copy Value">
                  <IconButton edge="end" onClick={(e) => {
                    e.stopPropagation();
                    handleCopyMeasurement(measurement);
                  }}>
                    <CopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton edge="end" onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteMeasurement(measurement.id);
                  }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </ListItemButton>
          </React.Fragment>
        ))}
      </List>

      {measurements.length > 0 && (
        <Button
          startIcon={<SaveIcon />}
          variant="outlined"
          size="small"
          fullWidth
          sx={{ mt: 2 }}
          onClick={() => {
            const text = measurements
              .map(m => `${m.type}: ${m.value.toFixed(2)}${m.unit}`)
              .join('\n');
            navigator.clipboard.writeText(text);
          }}
        >
          Copy All Measurements
        </Button>
      )}
    </Paper>
  );
}

// Helper functions
const calculateDistance = (p1: Point3D, p2: Point3D): number => {
  return Math.sqrt(
    Math.pow(p2.x - p1.x, 2) +
    Math.pow(p2.y - p1.y, 2) +
    Math.pow(p2.z - p1.z, 2)
  );
};

const calculateArea = (points: Point3D[]): number => {
  // Using shoelace formula for polygon area
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].z;
    area -= points[j].x * points[i].z;
  }
  return Math.abs(area) / 2;
};

const calculateVolume = (points: Point3D[]): number => {
  // Simplified volume calculation using base area * height
  const baseArea = calculateArea(points.slice(0, -1));
  const height = Math.abs(points[points.length - 1].y - points[0].y);
  return baseArea * height;
};

const getInstructions = (type: 'distance' | 'area' | 'volume', pointCount: number): string => {
  switch (type) {
    case 'distance':
      return pointCount === 0
        ? 'Click to set start point'
        : 'Click to set end point';

    case 'area':
      return pointCount < 3
        ? `Click to add point ${pointCount + 1}/3`
        : 'Click to add more points or complete measurement';

    case 'volume':
      return pointCount < 4
        ? `Click to add point ${pointCount + 1}/4`
        : 'Click to set height point';
  }
};

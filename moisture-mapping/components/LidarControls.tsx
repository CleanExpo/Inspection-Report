import React from 'react';
import {
  Box,
  Paper,
  IconButton,
  Tooltip,
  ButtonGroup,
  Typography,
  Switch,
  FormControlLabel,
  Slider,
  Stack,
  Divider
} from '@mui/material';
import {
  ThreeDRotation as ThreeDIcon,
  Timeline as TimelineIcon,
  Architecture as ArchitectureIcon,
  Layers as LayersIcon,
  Thermostat as ThermalIcon,
  Warning as RiskIcon,
  Straighten as MeasureIcon,
  CropLandscape as SliceIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  SkipNext as NextIcon,
  SkipPrevious as PrevIcon,
} from '@mui/icons-material';

interface LidarControlsProps {
  onViewChange: (view: '3d' | '2d' | 'slice') => void;
  onToggleOverlay: (overlay: 'thermal' | 'moisture' | 'risk') => void;
  onSlicePositionChange: (position: number) => void;
  onTimeChange: (time: number) => void;
  activeOverlays: {
    thermal: boolean;
    moisture: boolean;
    risk: boolean;
  };
  timeSeriesData?: {
    startTime: string;
    endTime: string;
    currentTime: string;
  };
  isPlaying?: boolean;
  onPlayPause?: () => void;
}

export default function LidarControls({
  onViewChange,
  onToggleOverlay,
  onSlicePositionChange,
  onTimeChange,
  activeOverlays,
  timeSeriesData,
  isPlaying,
  onPlayPause
}: LidarControlsProps) {
  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={2}>
        {/* View Controls */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>View</Typography>
          <ButtonGroup size="small">
            <Tooltip title="3D View">
              <IconButton onClick={() => onViewChange('3d')}>
                <ThreeDIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Floor Plan">
              <IconButton onClick={() => onViewChange('2d')}>
                <ArchitectureIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Cross Section">
              <IconButton onClick={() => onViewChange('slice')}>
                <SliceIcon />
              </IconButton>
            </Tooltip>
          </ButtonGroup>
        </Box>

        <Divider />

        {/* Overlay Controls */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>Overlays</Typography>
          <Stack>
            <FormControlLabel
              control={
                <Switch
                  checked={activeOverlays.moisture}
                  onChange={() => onToggleOverlay('moisture')}
                  size="small"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LayersIcon fontSize="small" />
                  <Typography variant="body2">Moisture Data</Typography>
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={activeOverlays.thermal}
                  onChange={() => onToggleOverlay('thermal')}
                  size="small"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ThermalIcon fontSize="small" />
                  <Typography variant="body2">Thermal Map</Typography>
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={activeOverlays.risk}
                  onChange={() => onToggleOverlay('risk')}
                  size="small"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <RiskIcon fontSize="small" />
                  <Typography variant="body2">Structural Risks</Typography>
                </Box>
              }
            />
          </Stack>
        </Box>

        <Divider />

        {/* Cross Section Controls */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <SliceIcon fontSize="small" />
              <span>Slice Position</span>
            </Box>
          </Typography>
          <Slider
            size="small"
            min={0}
            max={100}
            onChange={(_, value) => onSlicePositionChange(value as number)}
            valueLabelDisplay="auto"
            valueLabelFormat={value => `${value}%`}
          />
        </Box>

        <Divider />

        {/* Time Controls */}
        {timeSeriesData && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TimelineIcon fontSize="small" />
                <span>Time Series</span>
              </Box>
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton size="small" onClick={() => onTimeChange(-1)}>
                <PrevIcon />
              </IconButton>
              <IconButton size="small" onClick={onPlayPause}>
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </IconButton>
              <IconButton size="small" onClick={() => onTimeChange(1)}>
                <NextIcon />
              </IconButton>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {new Date(timeSeriesData.currentTime).toLocaleString()}
            </Typography>
          </Box>
        )}

        {/* Measurement Tools */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <MeasureIcon fontSize="small" />
              <span>Tools</span>
            </Box>
          </Typography>
          <ButtonGroup size="small">
            <Tooltip title="Measure Distance">
              <IconButton>
                <MeasureIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Analyze Area">
              <IconButton>
                <TimelineIcon />
              </IconButton>
            </Tooltip>
          </ButtonGroup>
        </Box>
      </Stack>
    </Paper>
  );
}

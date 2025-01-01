import React, { useRef, useState, useEffect } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Tooltip,
  ButtonGroup,
  Button,
  Typography,
  Slider,
  Stack,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Draw as DrawIcon,
  PanTool as PanIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Straighten as RulerIcon,
  WaterDrop as WaterDropIcon,
  GridOn as GridIcon,
} from '@mui/icons-material';
import { MoistureReading, getMoistureColor } from '../types/moisture';

interface Point {
  x: number;
  y: number;
}

interface WallSegment {
  start: Point;
  end: Point;
}

interface MoistureMarker {
  position: Point;
  reading: MoistureReading;
}

interface HistoryState {
  walls: WallSegment[];
  markers: MoistureMarker[];
}

interface MoistureSketchMapProps {
  readings: MoistureReading[];
  onSave?: (imageData: string) => void;
}

type Tool = 'wall' | 'pan' | 'marker' | 'eraser';

export default function MoistureSketchMap({ readings, onSave }: MoistureSketchMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [tool, setTool] = useState<Tool>('wall');
  const [isDrawing, setIsDrawing] = useState(false);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [walls, setWalls] = useState<WallSegment[]>([]);
  const [markers, setMarkers] = useState<MoistureMarker[]>([]);
  const [showGrid, setShowGrid] = useState(true);
  const [history, setHistory] = useState<HistoryState[]>([{ walls: [], markers: [] }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedMarker, setSelectedMarker] = useState<MoistureMarker | null>(null);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    setContext(ctx);
    drawCanvas(ctx);
  }, []);

  // Redraw canvas when data changes
  useEffect(() => {
    if (!context) return;
    drawCanvas(context);
  }, [walls, markers, scale, offset, showGrid]);

  const drawCanvas = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Apply transformation
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    // Draw grid
    if (showGrid) {
      drawGrid(ctx);
    }

    // Draw walls
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    walls.forEach(wall => {
      ctx.beginPath();
      ctx.moveTo(wall.start.x, wall.start.y);
      ctx.lineTo(wall.end.x, wall.end.y);
      ctx.stroke();
    });

    // Draw markers
    markers.forEach(marker => {
      drawMoistureMarker(ctx, marker);
    });

    ctx.restore();
  };

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    const gridSize = 50;
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 0.5;

    for (let x = 0; x < ctx.canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, ctx.canvas.height);
      ctx.stroke();
    }

    for (let y = 0; y < ctx.canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(ctx.canvas.width, y);
      ctx.stroke();
    }
  };

  const drawMoistureMarker = (ctx: CanvasRenderingContext2D, marker: MoistureMarker) => {
    const radius = 15;
    ctx.beginPath();
    ctx.arc(marker.position.x, marker.position.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = getMoistureColor(marker.reading.value, marker.reading.materialType);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw reading value
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      `${marker.reading.value}%`,
      marker.position.x,
      marker.position.y
    );
  };

  const getCanvasPoint = (event: React.MouseEvent): Point => {
    if (!canvasRef.current) return { x: 0, y: 0 };

    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left - offset.x) / scale,
      y: (event.clientY - rect.top - offset.y) / scale
    };
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    const point = getCanvasPoint(event);
    setIsDrawing(true);
    setStartPoint(point);

    if (tool === 'marker') {
      const nearestReading = readings.find(r => !markers.some(m => m.reading.id === r.id));
      if (nearestReading) {
        const newMarker: MoistureMarker = {
          position: point,
          reading: nearestReading
        };
        const newMarkers = [...markers, newMarker];
        addToHistory({ walls, markers: newMarkers });
        setMarkers(newMarkers);
      }
    }
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isDrawing || !startPoint) return;

    const point = getCanvasPoint(event);

    if (tool === 'wall') {
      if (context) {
        drawCanvas(context);
        // Draw preview line
        context.save();
        context.translate(offset.x, offset.y);
        context.scale(scale, scale);
        context.beginPath();
        context.moveTo(startPoint.x, startPoint.y);
        context.lineTo(point.x, point.y);
        context.strokeStyle = '#000';
        context.lineWidth = 2;
        context.stroke();
        context.restore();
      }
    } else if (tool === 'pan') {
      setOffset(prev => ({
        x: prev.x + event.movementX,
        y: prev.y + event.movementY
      }));
    }
  };

  const handleMouseUp = (event: React.MouseEvent) => {
    if (!isDrawing || !startPoint) return;

    const point = getCanvasPoint(event);

    if (tool === 'wall') {
      const newWall: WallSegment = {
        start: startPoint,
        end: point
      };
      const newWalls = [...walls, newWall];
      addToHistory({ walls: newWalls, markers });
      setWalls(newWalls);
    }

    setIsDrawing(false);
    setStartPoint(null);
  };

  const addToHistory = (newState: HistoryState) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setWalls(prevState.walls);
      setMarkers(prevState.markers);
      setHistoryIndex(prev => prev - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setWalls(nextState.walls);
      setMarkers(nextState.markers);
      setHistoryIndex(prev => prev + 1);
    }
  };

  const handleSave = () => {
    if (!canvasRef.current) return;
    const imageData = canvasRef.current.toDataURL('image/png');
    onSave?.(imageData);
  };

  const handleMarkerContextMenu = (event: React.MouseEvent, marker: MoistureMarker) => {
    event.preventDefault();
    setSelectedMarker(marker);
    setMenuAnchor(event.currentTarget as HTMLElement);
  };

  const handleDeleteMarker = () => {
    if (!selectedMarker) return;
    const newMarkers = markers.filter(m => m !== selectedMarker);
    addToHistory({ walls, markers: newMarkers });
    setMarkers(newMarkers);
    setMenuAnchor(null);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <ButtonGroup>
          <Tooltip title="Draw Walls">
            <IconButton 
              color={tool === 'wall' ? 'primary' : 'default'}
              onClick={() => setTool('wall')}
            >
              <DrawIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Pan">
            <IconButton
              color={tool === 'pan' ? 'primary' : 'default'}
              onClick={() => setTool('pan')}
            >
              <PanIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add Moisture Marker">
            <IconButton
              color={tool === 'marker' ? 'primary' : 'default'}
              onClick={() => setTool('marker')}
            >
              <WaterDropIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eraser">
            <IconButton
              color={tool === 'eraser' ? 'primary' : 'default'}
              onClick={() => setTool('eraser')}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </ButtonGroup>

        <ButtonGroup>
          <Tooltip title="Undo">
            <IconButton onClick={undo} disabled={historyIndex <= 0}>
              <UndoIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Redo">
            <IconButton onClick={redo} disabled={historyIndex >= history.length - 1}>
              <RedoIcon />
            </IconButton>
          </Tooltip>
        </ButtonGroup>

        <ButtonGroup>
          <Tooltip title="Zoom In">
            <IconButton onClick={() => setScale(prev => prev * 1.1)}>
              <AddIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom Out">
            <IconButton onClick={() => setScale(prev => prev / 1.1)}>
              <RemoveIcon />
            </IconButton>
          </Tooltip>
        </ButtonGroup>

        <Tooltip title="Toggle Grid">
          <IconButton 
            color={showGrid ? 'primary' : 'default'}
            onClick={() => setShowGrid(prev => !prev)}
          >
            <GridIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Save">
          <IconButton onClick={handleSave}>
            <SaveIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Box
        sx={{
          position: 'relative',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          overflow: 'hidden'
        }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => setIsDrawing(false)}
          onContextMenu={(e) => {
            e.preventDefault();
            if (tool === 'marker') {
              const point = getCanvasPoint(e);
              const marker = markers.find(m => {
                const dx = m.position.x - point.x;
                const dy = m.position.y - point.y;
                return Math.sqrt(dx * dx + dy * dy) < 15;
              });
              if (marker) {
                handleMarkerContextMenu(e, marker);
              }
            }
          }}
          style={{ 
            cursor: tool === 'pan' ? 'grab' : 'crosshair',
            touchAction: 'none'
          }}
        />
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={handleDeleteMarker}>
          <DeleteIcon sx={{ mr: 1 }} /> Delete Marker
        </MenuItem>
      </Menu>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Tip: Right-click on markers to delete them. Use the grid for scale reference.
      </Typography>
    </Paper>
  );
}

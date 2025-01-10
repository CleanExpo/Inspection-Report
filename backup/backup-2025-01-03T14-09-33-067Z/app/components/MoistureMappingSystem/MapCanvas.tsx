import React, { useRef, useEffect, useState } from 'react';
import type { MapLayout, Point, Wall, Door, Window } from '../../types/moisture';

interface MapCanvasProps {
  layout: MapLayout;
  width?: number;
  height?: number;
  onLayoutChange?: (layout: MapLayout) => void;
  readOnly?: boolean;
}

const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 600;
const GRID_SIZE = 20;
const WALL_WIDTH = 4;
const DOOR_COLOR = '#8B4513';
const WINDOW_COLOR = '#87CEEB';
const WALL_COLOR = '#2C3E50';
const GRID_COLOR = '#E0E0E0';

export const MapCanvas: React.FC<MapCanvasProps> = ({
  layout,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  onLayoutChange,
  readOnly = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setContext(ctx);
  }, []);

  useEffect(() => {
    if (!context) return;
    drawCanvas();
  }, [context, layout]);

  const drawGrid = () => {
    if (!context) return;

    context.strokeStyle = GRID_COLOR;
    context.lineWidth = 1;

    // Draw vertical lines
    for (let x = 0; x <= width; x += GRID_SIZE) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= height; y += GRID_SIZE) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }
  };

  const drawWalls = () => {
    if (!context) return;

    context.strokeStyle = WALL_COLOR;
    context.lineWidth = WALL_WIDTH;

    layout.walls.forEach((wall: Wall) => {
      context.beginPath();
      context.moveTo(wall.start.x, wall.start.y);
      context.lineTo(wall.end.x, wall.end.y);
      context.stroke();
    });
  };

  const drawDoors = () => {
    if (!context) return;

    context.strokeStyle = DOOR_COLOR;
    context.lineWidth = WALL_WIDTH;

    layout.doors.forEach((door: Door) => {
      context.beginPath();
      context.rect(
        door.position.x,
        door.position.y,
        door.width,
        door.height
      );
      context.stroke();
    });
  };

  const drawWindows = () => {
    if (!context) return;

    context.strokeStyle = WINDOW_COLOR;
    context.lineWidth = WALL_WIDTH;

    layout.windows.forEach((window: Window) => {
      context.beginPath();
      context.rect(
        window.position.x,
        window.position.y,
        window.width,
        window.height
      );
      context.stroke();
    });
  };

  const drawCanvas = () => {
    if (!context) return;

    // Clear canvas
    context.clearRect(0, 0, width, height);

    // Draw elements
    drawGrid();
    drawWalls();
    drawDoors();
    drawWindows();
  };

  const getMousePosition = (event: React.MouseEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.round((event.clientX - rect.left) / GRID_SIZE) * GRID_SIZE,
      y: Math.round((event.clientY - rect.top) / GRID_SIZE) * GRID_SIZE,
    };
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    if (readOnly) return;

    const point = getMousePosition(event);
    setIsDragging(true);
    setStartPoint(point);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isDragging || !startPoint || !context || readOnly) return;

    const currentPoint = getMousePosition(event);

    // Clear canvas and redraw
    drawCanvas();

    // Draw preview line
    context.strokeStyle = WALL_COLOR;
    context.lineWidth = WALL_WIDTH;
    context.beginPath();
    context.moveTo(startPoint.x, startPoint.y);
    context.lineTo(currentPoint.x, currentPoint.y);
    context.stroke();
  };

  const handleMouseUp = (event: React.MouseEvent) => {
    if (!isDragging || !startPoint || readOnly) return;

    const endPoint = getMousePosition(event);

    // Only add wall if start and end points are different
    if (startPoint.x !== endPoint.x || startPoint.y !== endPoint.y) {
      const newWall: Wall = {
        start: startPoint,
        end: endPoint,
      };

      const newLayout: MapLayout = {
        ...layout,
        walls: [...layout.walls, newWall],
      };

      onLayoutChange?.(newLayout);
    }

    setIsDragging(false);
    setStartPoint(null);
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        border: '1px solid #ccc',
        cursor: readOnly ? 'default' : 'crosshair',
      }}
    />
  );
};

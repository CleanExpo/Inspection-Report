'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Box, Paper, IconButton, Tooltip } from '@mui/material';
import {
  Straighten as WallIcon,
  MeetingRoom as DoorIcon,
  AspectRatio as WindowIcon,
  Delete as EraseIcon,
  Undo as UndoIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

type Point = {
  x: number;
  y: number;
};

type DrawingMode = 'wall' | 'door' | 'window' | 'erase';

type DrawingElement = {
  type: DrawingMode;
  startPoint: Point;
  endPoint: Point;
  id: string;
};

interface SketchToolProps {
  width?: number;
  height?: number;
  onSave?: (elements: DrawingElement[]) => void;
  initialElements?: DrawingElement[];
}

export default function SketchTool({
  width = 800,
  height = 600,
  onSave,
  initialElements = [],
}: SketchToolProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<DrawingMode>('wall');
  const [isDrawing, setIsDrawing] = useState(false);
  const [elements, setElements] = useState<DrawingElement[]>(initialElements);
  const [currentElement, setCurrentElement] = useState<DrawingElement | null>(null);
  const [scale, setScale] = useState(1);

  // Initialize canvas and load initial elements
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up canvas
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    // Draw initial elements
    drawElements(ctx, elements);
  }, [elements]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const container = canvas.parentElement;
      if (!container) return;

      const newScale = Math.min(
        container.clientWidth / width,
        container.clientHeight / height
      );
      setScale(newScale);

      canvas.style.transform = `scale(${newScale})`;
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [width, height]);

  const drawElements = (ctx: CanvasRenderingContext2D, elements: DrawingElement[]) => {
    ctx.clearRect(0, 0, width, height);

    elements.forEach((element) => {
      ctx.beginPath();
      
      switch (element.type) {
        case 'wall':
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 4;
          break;
        case 'door':
          ctx.strokeStyle = '#4CAF50';
          ctx.lineWidth = 3;
          break;
        case 'window':
          ctx.strokeStyle = '#2196F3';
          ctx.lineWidth = 2;
          break;
        case 'erase':
          return; // Skip erased elements
      }

      ctx.moveTo(element.startPoint.x, element.startPoint.y);
      ctx.lineTo(element.endPoint.x, element.endPoint.y);
      ctx.stroke();
    });
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    const newElement: DrawingElement = {
      type: mode,
      startPoint: { x, y },
      endPoint: { x, y },
      id: crypto.randomUUID(),
    };

    setCurrentElement(newElement);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentElement || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    const updatedElement = {
      ...currentElement,
      endPoint: { x, y },
    };

    // Draw all elements including the current one
    drawElements(ctx, [...elements, updatedElement]);
  };

  const stopDrawing = () => {
    if (!isDrawing || !currentElement) return;

    if (mode === 'erase') {
      // Remove elements that intersect with the eraser line
      const newElements = elements.filter((element) => !intersects(element, currentElement));
      setElements(newElements);
    } else {
      setElements([...elements, currentElement]);
    }

    setCurrentElement(null);
    setIsDrawing(false);
  };

  const intersects = (element1: DrawingElement, element2: DrawingElement): boolean => {
    // Simple line intersection check
    const x1 = element1.startPoint.x;
    const y1 = element1.startPoint.y;
    const x2 = element1.endPoint.x;
    const y2 = element1.endPoint.y;
    const x3 = element2.startPoint.x;
    const y3 = element2.startPoint.y;
    const x4 = element2.endPoint.x;
    const y4 = element2.endPoint.y;

    const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (denominator === 0) return false;

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denominator;

    return t >= 0 && t <= 1 && u >= 0 && u <= 1;
  };

  const handleUndo = () => {
    setElements(elements.slice(0, -1));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(elements);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: 'fit-content',
      }}
    >
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Tooltip title="Draw Wall">
          <IconButton
            color={mode === 'wall' ? 'primary' : 'default'}
            onClick={() => setMode('wall')}
          >
            <WallIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Add Door">
          <IconButton
            color={mode === 'door' ? 'primary' : 'default'}
            onClick={() => setMode('door')}
          >
            <DoorIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Add Window">
          <IconButton
            color={mode === 'window' ? 'primary' : 'default'}
            onClick={() => setMode('window')}
          >
            <WindowIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Erase">
          <IconButton
            color={mode === 'erase' ? 'primary' : 'default'}
            onClick={() => setMode('erase')}
          >
            <EraseIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Undo">
          <span>
            <IconButton
              onClick={handleUndo}
              disabled={elements.length === 0}
            >
              <UndoIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Save">
          <IconButton onClick={handleSave} disabled={elements.length === 0}>
            <SaveIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Box
        sx={{
          position: 'relative',
          width: `${width}px`,
          height: `${height}px`,
          transformOrigin: 'top left',
        }}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          style={{
            border: '1px solid #ccc',
            position: 'absolute',
            top: 0,
            left: 0,
            cursor: isDrawing ? 'crosshair' : 'default',
          }}
        />
      </Box>
    </Paper>
  );
}

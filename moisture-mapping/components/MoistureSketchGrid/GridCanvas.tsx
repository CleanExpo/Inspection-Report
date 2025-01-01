import React, { useRef, useEffect, useState } from 'react';
import { Box, Paper } from '@mui/material';

import { DrawingElement } from '../../types/sketch';

interface TouchState {
  touches: React.Touch[];
  initialDistance?: number;
  initialAngle?: number;
}

interface GridCanvasProps {
  elements?: DrawingElement[];
  width?: number;
  height?: number;
  gridSize?: number;
  onCanvasReady?: (context: CanvasRenderingContext2D) => void;
  onMouseDown?: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseMove?: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp?: () => void;
  onTouchStart?: (e: React.TouchEvent<HTMLCanvasElement>) => void;
  onTouchMove?: (e: React.TouchEvent<HTMLCanvasElement>) => void;
  onTouchEnd?: () => void;
  onPencilInput?: (pressure: number) => void;
  onGesture?: (type: 'pinch' | 'rotate', value: number) => void;
}

export const GridCanvas: React.FC<GridCanvasProps> = ({
  width = 800,
  height = 600,
  gridSize = 20,
  elements = [],
  onCanvasReady,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onPencilInput,
  onGesture,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [touchState, setTouchState] = useState<TouchState>({ touches: [] });

  const drawGrid = () => {
    if (!context) return;

    context.beginPath();
    context.strokeStyle = '#e0e0e0';
    context.lineWidth = 0.5;

    // Vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      context.moveTo(x, 0);
      context.lineTo(x, height);
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      context.moveTo(0, y);
      context.lineTo(width, y);
    }

    context.stroke();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas resolution for sharp rendering
    const scale = window.devicePixelRatio;
    canvas.width = width * scale;
    canvas.height = height * scale;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(scale, scale);

    setContext(ctx);
    if (onCanvasReady) onCanvasReady(ctx);

    drawGrid();
    renderElements();
  }, [width, height, gridSize, onCanvasReady, elements]);

  const renderElements = () => {
    if (!context) return;

    // Clear canvas
    context.clearRect(0, 0, width, height);
    drawGrid();

    // Render each element
    elements.forEach(element => {
      switch (element.type) {
        case 'pen':
          drawPenStrokes(element);
          break;
        case 'line':
          drawLine(element);
          break;
        case 'rectangle':
          drawRectangle(element);
          break;
        case 'text':
          drawText(element);
          break;
        case 'moisture':
          drawMoistureReading(element);
          break;
        case 'photo':
          drawPhoto(element);
          break;
      }
    });
  };

  const drawPenStrokes = (element: DrawingElement) => {
    if (!context || element.points.length < 2) return;

    context.beginPath();
    context.strokeStyle = element.color;
    context.lineWidth = element.width;
    context.lineCap = 'round';
    context.lineJoin = 'round';

    context.moveTo(element.points[0].x, element.points[0].y);
    for (let i = 1; i < element.points.length; i++) {
      context.lineTo(element.points[i].x, element.points[i].y);
    }
    context.stroke();
  };

  const drawLine = (element: DrawingElement) => {
    if (!context || element.points.length < 2) return;

    context.beginPath();
    context.strokeStyle = element.color;
    context.lineWidth = element.width;
    context.moveTo(element.points[0].x, element.points[0].y);
    context.lineTo(
      element.points[element.points.length - 1].x,
      element.points[element.points.length - 1].y
    );
    context.stroke();
  };

  const drawRectangle = (element: DrawingElement) => {
    if (!context || element.points.length < 2) return;

    const startPoint = element.points[0];
    const endPoint = element.points[element.points.length - 1];
    const width = endPoint.x - startPoint.x;
    const height = endPoint.y - startPoint.y;

    context.strokeStyle = element.color;
    context.lineWidth = element.width;
    context.strokeRect(startPoint.x, startPoint.y, width, height);
  };

  const drawText = (element: DrawingElement) => {
    if (!context || !element.data?.text) return;

    context.font = '14px Arial';
    context.fillStyle = element.color;
    context.fillText(element.data.text, element.points[0].x, element.points[0].y);
  };

  const drawMoistureReading = (element: DrawingElement) => {
    if (!context || !element.data?.moisture) return;

    const x = element.points[0].x;
    const y = element.points[0].y;
    const reading = element.data.moisture.toString();

    // Draw circle background
    context.beginPath();
    context.fillStyle = element.color;
    context.arc(x, y, 15, 0, Math.PI * 2);
    context.fill();

    // Draw reading
    context.font = 'bold 12px Arial';
    context.fillStyle = '#ffffff';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(reading, x, y);
  };

  const drawPhoto = (element: DrawingElement) => {
    if (!context || !element.data?.photoUrl) return;

    const x = element.points[0].x;
    const y = element.points[0].y;

    // Draw photo icon placeholder
    context.beginPath();
    context.fillStyle = element.color;
    context.fillRect(x - 15, y - 15, 30, 30);
    
    // Draw camera icon
    context.font = '16px Arial';
    context.fillStyle = '#ffffff';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('📷', x, y);
  };

  const getTouchPoint = (touch: React.Touch) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
    const y = (touch.clientY - rect.top) * (canvas.height / rect.height);
    return { x, y };
  };

  const handlePencilInput = (e: TouchEvent) => {
    // Access force/pressure from the native touch event
    if (e.touches[0]) {
      const touch = e.touches[0] as any;
      if (touch.force) {
        onPencilInput?.(touch.force);
      }
    }
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2,
        bgcolor: '#ffffff',
        display: 'inline-block'
      }}
    >
      <Box
        sx={{
          position: 'relative',
          '& canvas': {
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            touchAction: 'none',
            WebkitUserSelect: 'none',
            userSelect: 'none'
          }
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            cursor: 'crosshair'
          }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onTouchStart={(e: React.TouchEvent<HTMLCanvasElement>) => {
            e.preventDefault();
            const touches = Array.from(e.touches);
            setTouchState({ touches });

            // Handle Apple Pencil
            handlePencilInput(e.nativeEvent);

            // Handle multi-touch gestures
            if (touches.length === 2) {
              const [t1, t2] = touches;
              const distance = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
              const angle = Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX);
              setTouchState(prev => ({
                ...prev,
                initialDistance: distance,
                initialAngle: angle
              }));
            }

            onTouchStart?.(e);
          }}
          onTouchMove={(e: React.TouchEvent<HTMLCanvasElement>) => {
            e.preventDefault();
            const touches = Array.from(e.touches);
            
            // Handle Apple Pencil
            handlePencilInput(e.nativeEvent);

            // Handle multi-touch gestures
            if (touches.length === 2 && touchState.initialDistance && touchState.initialAngle) {
              const [t1, t2] = touches;
              const currentDistance = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
              const currentAngle = Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX);

              // Pinch gesture
              const scale = currentDistance / touchState.initialDistance;
              onGesture?.('pinch', scale);

              // Rotate gesture
              const rotation = currentAngle - touchState.initialAngle;
              onGesture?.('rotate', rotation);
            }

            setTouchState(prev => ({ ...prev, touches }));
            onTouchMove?.(e);
          }}
          onTouchEnd={(e: React.TouchEvent<HTMLCanvasElement>) => {
            e.preventDefault();
            setTouchState({ touches: [] });
            onTouchEnd?.();
          }}
        />
      </Box>
    </Paper>
  );
};

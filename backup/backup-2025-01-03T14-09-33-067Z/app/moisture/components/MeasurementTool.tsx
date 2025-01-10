'use client';

import { useEffect, useRef, useState } from 'react';

interface Point {
  x: number;
  y: number;
}

interface MeasurementToolProps {
  scale: number;
  containerWidth: number;
  containerHeight: number;
  isActive: boolean;
  onMeasurementComplete: (distance: number) => void;
}

export default function MeasurementTool({
  scale,
  containerWidth,
  containerHeight,
  isActive,
  onMeasurementComplete
}: MeasurementToolProps) {
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [endPoint, setEndPoint] = useState<Point | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = containerWidth;
    canvas.height = containerHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, containerWidth, containerHeight);

    if (!startPoint) return;

    // Draw start point
    ctx.beginPath();
    ctx.arc(startPoint.x, startPoint.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#2c5282';
    ctx.fill();

    // Draw line and end point if available
    if (endPoint) {
      // Draw line
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(endPoint.x, endPoint.y);
      ctx.strokeStyle = '#3182ce';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw end point
      ctx.beginPath();
      ctx.arc(endPoint.x, endPoint.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#3182ce';
      ctx.fill();

      // Calculate and display distance
      const distance = calculateDistance(startPoint, endPoint, scale);
      const midPoint = {
        x: (startPoint.x + endPoint.x) / 2,
        y: (startPoint.y + endPoint.y) / 2
      };

      // Draw measurement text with background
      ctx.font = '14px Arial';
      const text = `${distance.toFixed(2)} m`;
      const textMetrics = ctx.measureText(text);
      const padding = 4;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillRect(
        midPoint.x - textMetrics.width / 2 - padding,
        midPoint.y - 8 - padding,
        textMetrics.width + padding * 2,
        16 + padding * 2
      );

      ctx.fillStyle = '#2d3748';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, midPoint.x, midPoint.y);
    }
  }, [startPoint, endPoint, containerWidth, containerHeight, scale]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (!startPoint) {
      setStartPoint({ x, y });
      setIsDrawing(true);
    } else if (isDrawing) {
      setEndPoint({ x, y });
      setIsDrawing(false);
      const distance = calculateDistance(startPoint, { x, y }, scale);
      onMeasurementComplete(distance);
      setStartPoint(null);
      setEndPoint(null);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isActive || !isDrawing || !startPoint) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setEndPoint({ x, y });
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setStartPoint(null);
      setEndPoint(null);
      setIsDrawing(false);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 cursor-crosshair"
      onClick={handleCanvasClick}
      onMouseMove={handleMouseMove}
    />
  );
}

function calculateDistance(point1: Point, point2: Point, scale: number): number {
  const pixelDistance = Math.sqrt(
    Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
  );
  
  // Convert from pixels to meters using scale
  const pixelsToMeters = scale / 100; // Assuming scale is in meters per 100 pixels
  return pixelDistance * pixelsToMeters;
}

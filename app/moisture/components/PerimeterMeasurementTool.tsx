'use client';

import { useEffect, useRef, useState } from 'react';

interface Point {
  x: number;
  y: number;
}

interface PerimeterMeasurementToolProps {
  scale: number;
  containerWidth: number;
  containerHeight: number;
  isActive: boolean;
  onMeasurementComplete: (perimeter: number) => void;
}

export default function PerimeterMeasurementTool({
  scale,
  containerWidth,
  containerHeight,
  isActive,
  onMeasurementComplete
}: PerimeterMeasurementToolProps) {
  const [points, setPoints] = useState<Point[]>([]);
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

    if (points.length === 0) return;

    // Draw perimeter path
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach(point => {
      ctx.lineTo(point.x, point.y);
    });
    if (points.length > 2) {
      ctx.closePath();
    }

    // Draw border
    ctx.strokeStyle = '#3182ce';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw points
    points.forEach((point, index) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = index === 0 ? '#2c5282' : '#3182ce';
      ctx.fill();
    });

    // Draw temporary line while drawing
    if (isDrawing && points.length > 0) {
      const rect = canvas.getBoundingClientRect();
      const mouseX = points[points.length - 1].x;
      const mouseY = points[points.length - 1].y;

      ctx.beginPath();
      ctx.moveTo(points[points.length - 1].x, points[points.length - 1].y);
      ctx.lineTo(mouseX, mouseY);
      ctx.strokeStyle = '#3182ce';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw segment measurements
    if (points.length > 1) {
      for (let i = 0; i < points.length - 1; i++) {
        const start = points[i];
        const end = points[i + 1];
        const midPoint = {
          x: (start.x + end.x) / 2,
          y: (start.y + end.y) / 2
        };

        const distance = calculateDistance(start, end, scale);

        // Draw measurement text with background
        ctx.font = '12px Arial';
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

      // Draw total perimeter if path is closed
      if (points.length > 2) {
        const perimeter = calculatePerimeter(points, scale);
        const centerPoint = calculatePolygonCenter(points);

        ctx.font = '14px Arial';
        const text = `Total: ${perimeter.toFixed(2)} m`;
        const textMetrics = ctx.measureText(text);
        const padding = 6;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(
          centerPoint.x - textMetrics.width / 2 - padding,
          centerPoint.y - 10 - padding,
          textMetrics.width + padding * 2,
          20 + padding * 2
        );

        ctx.fillStyle = '#2d3748';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, centerPoint.x, centerPoint.y);
      }
    }
  }, [points, isDrawing, containerWidth, containerHeight, scale]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if clicking near the start point to close the polygon
    if (points.length > 2) {
      const startPoint = points[0];
      const distance = Math.sqrt(
        Math.pow(x - startPoint.x, 2) + Math.pow(y - startPoint.y, 2)
      );

      if (distance < 20) {
        setIsDrawing(false);
        const perimeter = calculatePerimeter(points, scale);
        onMeasurementComplete(perimeter);
        setPoints([]);
        return;
      }
    }

    setPoints([...points, { x, y }]);
    setIsDrawing(true);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isActive || !isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Force re-render to update the temporary line
    setPoints([...points]);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setPoints([]);
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

function calculatePerimeter(points: Point[], scale: number): number {
  if (points.length < 3) return 0;

  let perimeter = 0;
  for (let i = 0; i < points.length; i++) {
    const nextIndex = (i + 1) % points.length;
    perimeter += calculateDistance(points[i], points[nextIndex], scale);
  }

  return perimeter;
}

function calculatePolygonCenter(points: Point[]): Point {
  const center = points.reduce(
    (acc, point) => ({
      x: acc.x + point.x / points.length,
      y: acc.y + point.y / points.length
    }),
    { x: 0, y: 0 }
  );

  return center;
}

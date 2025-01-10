'use client';

import { useEffect, useRef, useState } from 'react';

interface Point {
  x: number;
  y: number;
}

interface AreaMeasurementToolProps {
  scale: number;
  containerWidth: number;
  containerHeight: number;
  isActive: boolean;
  onMeasurementComplete: (area: number) => void;
}

export default function AreaMeasurementTool({
  scale,
  containerWidth,
  containerHeight,
  isActive,
  onMeasurementComplete
}: AreaMeasurementToolProps) {
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

    // Draw polygon
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach(point => {
      ctx.lineTo(point.x, point.y);
    });
    if (points.length > 2) {
      ctx.closePath();
    }

    // Fill with semi-transparent color
    ctx.fillStyle = 'rgba(66, 153, 225, 0.2)';
    ctx.fill();

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

    // Draw area measurement if polygon is complete
    if (points.length > 2) {
      const area = calculateArea(points, scale);
      const centerPoint = calculatePolygonCenter(points);

      ctx.font = '14px Arial';
      ctx.fillStyle = '#2d3748';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${area.toFixed(2)} m²`, centerPoint.x, centerPoint.y);
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
        const area = calculateArea(points, scale);
        onMeasurementComplete(area);
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

function calculateArea(points: Point[], scale: number): number {
  if (points.length < 3) return 0;

  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }

  area = Math.abs(area) / 2;
  
  // Convert from pixels to meters using scale
  const pixelsToMeters = scale / 100; // Assuming scale is in meters per 100 pixels
  return area * Math.pow(pixelsToMeters, 2);
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

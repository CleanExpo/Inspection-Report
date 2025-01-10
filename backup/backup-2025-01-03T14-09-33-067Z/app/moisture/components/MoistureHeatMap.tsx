'use client';

import { useEffect, useRef } from 'react';

interface MoistureReading {
  locationX: number;
  locationY: number;
  dataPoints: {
    value: number;
    unit: string;
  }[];
}

interface MoistureHeatMapProps {
  readings: MoistureReading[];
  width: number;
  height: number;
  opacity: number;
}

export default function MoistureHeatMap({
  readings,
  width,
  height,
  opacity
}: MoistureHeatMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width === 0 || height === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Create gradient data
    const gradientData = ctx.createImageData(width, height);
    const data = gradientData.data;

    // Initialize heat map data
    const heatMapData = new Float32Array(width * height);

    // Process readings
    readings.forEach(reading => {
      const x = Math.floor((reading.locationX / 100) * width);
      const y = Math.floor((reading.locationY / 100) * height);
      const value = reading.dataPoints[0]?.value || 0;
      
      // Normalize value (assuming typical moisture range 0-30)
      const normalizedValue = Math.min(value / 30, 1);

      // Add gaussian distribution around each point
      const radius = Math.min(width, height) * 0.1; // 10% of smaller dimension
      for (let i = -radius; i <= radius; i++) {
        for (let j = -radius; j <= radius; j++) {
          const distance = Math.sqrt(i * i + j * j);
          if (distance > radius) continue;

          const px = x + i;
          const py = y + j;
          if (px < 0 || px >= width || py < 0 || py >= height) continue;

          const intensity = Math.exp(-(distance * distance) / (2 * (radius * 0.3) * (radius * 0.3)));
          const index = py * width + px;
          heatMapData[index] += normalizedValue * intensity;
        }
      }
    });

    // Normalize heat map data
    let maxValue = 0;
    for (let i = 0; i < heatMapData.length; i++) {
      maxValue = Math.max(maxValue, heatMapData[i]);
    }

    // Convert heat map data to colors
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const value = heatMapData[y * width + x] / maxValue;

        // Use a blue (low) to red (high) gradient
        const r = Math.floor(value * 255);
        const b = Math.floor((1 - value) * 255);
        const g = Math.floor(Math.max(0, 1 - 2 * Math.abs(value - 0.5)) * 255);

        data[index] = r;     // Red
        data[index + 1] = g; // Green
        data[index + 2] = b; // Blue
        data[index + 3] = Math.floor(opacity * 255); // Alpha
      }
    }

    // Draw the heat map
    ctx.putImageData(gradientData, 0, 0);

    // Apply smoothing
    ctx.filter = 'blur(10px)';
    ctx.drawImage(canvas, 0, 0);
    ctx.filter = 'none';

  }, [readings, width, height, opacity]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{
        width: '100%',
        height: '100%'
      }}
    />
  );
}

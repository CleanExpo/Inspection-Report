import { MoistureReading } from './types';
import { ViewportState, DrawContext } from './types';
import { viewportToCanvas, clearCanvas } from './canvasUtils';

/**
 * Maps moisture value to a color
 */
const getMoistureColor = (value: number): string => {
  // Normalize value to 0-1 range
  const normalized = Math.min(Math.max(value / 100, 0), 1);
  
  if (normalized < 0.5) {
    // Blue to Green (0-50%)
    const ratio = normalized * 2;
    return `rgb(0, ${Math.floor(255 * ratio)}, ${Math.floor(255 * (1 - ratio))})`;
  } else {
    // Green to Red (50-100%)
    const ratio = (normalized - 0.5) * 2;
    return `rgb(${Math.floor(255 * ratio)}, ${Math.floor(255 * (1 - ratio))}, 0)`;
  }
};

/**
 * Draws a single moisture reading point
 */
const drawReadingPoint = (
  ctx: CanvasRenderingContext2D,
  reading: MoistureReading,
  viewport: ViewportState,
  radius: number = 5
) => {
  const [x, y] = viewportToCanvas(reading.locationX, reading.locationY, viewport);

  // Draw point
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = getMoistureColor(reading.value);
  ctx.fill();

  // Draw border
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.lineWidth = 1;
  ctx.stroke();
};

/**
 * Draws all moisture readings
 */
export const drawReadings = (
  context: DrawContext,
  readings: MoistureReading[],
  selectedReading?: MoistureReading
) => {
  const { ctx, viewport } = context;

  clearCanvas(ctx);

  // Draw all readings
  readings.forEach(reading => {
    drawReadingPoint(ctx, reading, viewport);
  });

  // Highlight selected reading if any
  if (selectedReading) {
    const [x, y] = viewportToCanvas(
      selectedReading.locationX,
      selectedReading.locationY,
      viewport
    );

    // Draw highlight circle
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw value label
    ctx.font = '12px Arial';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(
      `${selectedReading.value.toFixed(1)}%`,
      x,
      y - 10
    );
  }
};

/**
 * Finds the reading closest to given coordinates
 */
export const findNearestReading = (
  x: number,
  y: number,
  readings: MoistureReading[],
  viewport: ViewportState,
  threshold: number = 10
): MoistureReading | undefined => {
  let nearest: MoistureReading | undefined;
  let minDistance = threshold;

  readings.forEach(reading => {
    const [readingX, readingY] = viewportToCanvas(
      reading.locationX,
      reading.locationY,
      viewport
    );

    const distance = Math.sqrt(
      Math.pow(readingX - x, 2) + Math.pow(readingY - y, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearest = reading;
    }
  });

  return nearest;
};

/**
 * Creates a heatmap visualization of moisture readings
 */
export const drawHeatmap = (
  context: DrawContext,
  readings: MoistureReading[]
) => {
  const { ctx, viewport } = context;
  const { width, height } = ctx.canvas;

  clearCanvas(ctx);

  // Create gradient data
  const gradientData = ctx.createImageData(width, height);
  const data = gradientData.data;

  // For each pixel
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      
      // Convert pixel coordinates to viewport coordinates
      const [vpX, vpY] = viewportToCanvas(x, y, viewport);
      
      // Calculate weighted value based on nearby readings
      let totalWeight = 0;
      let weightedValue = 0;

      readings.forEach(reading => {
        const distance = Math.sqrt(
          Math.pow(reading.locationX - vpX, 2) +
          Math.pow(reading.locationY - vpY, 2)
        );

        // Use inverse square for weight calculation
        const weight = 1 / (1 + distance * distance);
        totalWeight += weight;
        weightedValue += reading.value * weight;
      });

      const value = totalWeight > 0 ? weightedValue / totalWeight : 0;
      const color = getMoistureColor(value);
      
      // Parse RGB values from color string
      const rgb = color.match(/\d+/g)!.map(Number);
      
      data[i] = rgb[0];     // R
      data[i + 1] = rgb[1]; // G
      data[i + 2] = rgb[2]; // B
      data[i + 3] = 128;    // A (semi-transparent)
    }
  }

  ctx.putImageData(gradientData, 0, 0);
};

import { ViewportState, DrawContext, GridConfig, ScaleConfig } from './types';

/**
 * Converts viewport coordinates to canvas coordinates
 */
export const viewportToCanvas = (
  x: number,
  y: number,
  viewport: ViewportState
): [number, number] => {
  const rotatedX = x * Math.cos(viewport.rotation) - y * Math.sin(viewport.rotation);
  const rotatedY = x * Math.sin(viewport.rotation) + y * Math.cos(viewport.rotation);

  return [
    (rotatedX * viewport.scale) + viewport.offsetX,
    (rotatedY * viewport.scale) + viewport.offsetY
  ];
};

/**
 * Converts canvas coordinates to viewport coordinates
 */
export const canvasToViewport = (
  x: number,
  y: number,
  viewport: ViewportState
): [number, number] => {
  const translatedX = (x - viewport.offsetX) / viewport.scale;
  const translatedY = (y - viewport.offsetY) / viewport.scale;

  const rotationInverse = -viewport.rotation;
  return [
    translatedX * Math.cos(rotationInverse) - translatedY * Math.sin(rotationInverse),
    translatedX * Math.sin(rotationInverse) + translatedY * Math.cos(rotationInverse)
  ];
};

/**
 * Clears a canvas context
 */
export const clearCanvas = (ctx: CanvasRenderingContext2D) => {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.restore();
};

/**
 * Draws the grid overlay
 */
export const drawGrid = (context: DrawContext) => {
  const { ctx, viewport, config } = context;
  const { cellSize, color, opacity, showLabels } = config.grid;

  clearCanvas(ctx);
  ctx.save();
  
  // Set grid style
  ctx.strokeStyle = color;
  ctx.globalAlpha = opacity;
  ctx.lineWidth = 1;

  // Calculate grid bounds
  const [startX, startY] = canvasToViewport(0, 0, viewport);
  const [endX, endY] = canvasToViewport(ctx.canvas.width, ctx.canvas.height, viewport);

  // Draw vertical lines
  for (let x = Math.floor(startX / cellSize) * cellSize; x <= endX; x += cellSize) {
    ctx.beginPath();
    const [canvasX, canvasStartY] = viewportToCanvas(x, startY, viewport);
    const [, canvasEndY] = viewportToCanvas(x, endY, viewport);
    ctx.moveTo(canvasX, canvasStartY);
    ctx.lineTo(canvasX, canvasEndY);
    ctx.stroke();

    // Draw labels
    if (showLabels) {
      ctx.fillStyle = color;
      ctx.fillText(x.toString(), canvasX + 2, 10);
    }
  }

  // Draw horizontal lines
  for (let y = Math.floor(startY / cellSize) * cellSize; y <= endY; y += cellSize) {
    ctx.beginPath();
    const [canvasStartX, canvasY] = viewportToCanvas(startX, y, viewport);
    const [canvasEndX] = viewportToCanvas(endX, y, viewport);
    ctx.moveTo(canvasStartX, canvasY);
    ctx.lineTo(canvasEndX, canvasY);
    ctx.stroke();

    // Draw labels
    if (showLabels) {
      ctx.fillStyle = color;
      ctx.fillText(y.toString(), 2, canvasY - 2);
    }
  }

  ctx.restore();
};

/**
 * Draws the scale ruler
 */
export const drawScale = (context: DrawContext) => {
  const { ctx, config } = context;
  const { pixelsPerMeter, unit, showRuler } = config.scale;

  if (!showRuler) return;

  ctx.save();
  ctx.strokeStyle = '#000';
  ctx.fillStyle = '#000';
  ctx.lineWidth = 2;

  // Draw ruler
  const rulerLength = pixelsPerMeter; // 1 meter
  const margin = 20;
  
  ctx.beginPath();
  ctx.moveTo(margin, ctx.canvas.height - margin);
  ctx.lineTo(margin + rulerLength, ctx.canvas.height - margin);
  
  // Draw ticks
  for (let i = 0; i <= 10; i++) {
    const x = margin + (i * rulerLength / 10);
    const tickHeight = i % 5 === 0 ? 10 : 5;
    ctx.moveTo(x, ctx.canvas.height - margin - tickHeight);
    ctx.lineTo(x, ctx.canvas.height - margin);
  }
  ctx.stroke();

  // Draw label
  ctx.fillText(
    `1 ${unit}`,
    margin + rulerLength / 2 - 10,
    ctx.canvas.height - margin + 15
  );

  ctx.restore();
};

/**
 * Creates a new canvas layer
 */
export const createCanvasLayer = (
  width: number,
  height: number
): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

/**
 * Gets a 2D rendering context from a canvas
 */
export const getContext = (canvas: HTMLCanvasElement): CanvasRenderingContext2D => {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context');
  return ctx;
};

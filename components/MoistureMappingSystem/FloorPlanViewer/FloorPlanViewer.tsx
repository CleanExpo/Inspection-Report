'use client';

import React, { useEffect, useRef, useState } from 'react';
import { FloorPlanViewerProps, CanvasLayers, ViewportState, DrawContext, MoistureReading } from './types';
import { createCanvasLayer, getContext, drawGrid, drawScale, clearCanvas, canvasToViewport } from './canvasUtils';
import { drawReadings, findNearestReading, drawHeatmap } from './readingUtils';

const defaultViewport: ViewportState = {
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  rotation: 0
};

const defaultConfig = {
  grid: {
    cellSize: 50,
    color: '#666',
    opacity: 0.5,
    showLabels: true
  },
  scale: {
    pixelsPerMeter: 100,
    showRuler: true,
    unit: 'meters' as const
  }
};

export const FloorPlanViewer: React.FC<FloorPlanViewerProps> = ({
  floorPlanUrl,
  readings,
  width = 800,
  height = 600,
  onPointSelect,
  showGrid = true,
  showScale = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<CanvasLayers | null>(null);
  const [viewport, setViewport] = useState<ViewportState>(defaultViewport);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReading, setSelectedReading] = useState<MoistureReading | undefined>();
  const [showHeatmap, setShowHeatmap] = useState(false);

  // Initialize canvas layers
  useEffect(() => {
    if (!containerRef.current) return;

    const layers: CanvasLayers = {
      background: createCanvasLayer(width, height),
      grid: createCanvasLayer(width, height),
      readings: createCanvasLayer(width, height),
      measurements: createCanvasLayer(width, height),
      interaction: createCanvasLayer(width, height)
    };

    // Position layers
    Object.values(layers).forEach(canvas => {
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      containerRef.current?.appendChild(canvas);
    });

    layersRef.current = layers;

    return () => {
      // Cleanup layers
      Object.values(layers).forEach(canvas => {
        canvas.remove();
      });
    };
  }, [width, height]);

  // Load floor plan image
  useEffect(() => {
    if (!layersRef.current) return;

    const image = new Image();
    image.src = floorPlanUrl;

    image.onload = () => {
      const ctx = getContext(layersRef.current!.background);
      
      // Calculate scale to fit image
      const scale = Math.min(
        width / image.width,
        height / image.height
      );

      // Center image
      const offsetX = (width - image.width * scale) / 2;
      const offsetY = (height - image.height * scale) / 2;

      // Update viewport
      setViewport(prev => ({
        ...prev,
        scale,
        offsetX,
        offsetY
      }));

      // Draw image
      ctx.drawImage(image, offsetX, offsetY, image.width * scale, image.height * scale);
      setIsLoading(false);
    };

    image.onerror = () => {
      console.error('Failed to load floor plan image');
      setIsLoading(false);
    };
  }, [floorPlanUrl, width, height]);

  // Draw grid overlay
  useEffect(() => {
    if (!layersRef.current || !showGrid) return;

    const ctx = getContext(layersRef.current.grid);
    const drawContext: DrawContext = {
      canvas: layersRef.current.grid,
      ctx,
      viewport,
      config: defaultConfig
    };

    drawGrid(drawContext);
  }, [viewport, showGrid]);

  // Draw scale
  useEffect(() => {
    if (!layersRef.current || !showScale) return;

    const ctx = getContext(layersRef.current.measurements);
    const drawContext: DrawContext = {
      canvas: layersRef.current.measurements,
      ctx,
      viewport,
      config: defaultConfig
    };

    clearCanvas(ctx);
    drawScale(drawContext);
  }, [viewport, showScale]);

  // Draw readings
  useEffect(() => {
    if (!layersRef.current) return;

    const ctx = getContext(layersRef.current.readings);
    const drawContext: DrawContext = {
      canvas: layersRef.current.readings,
      ctx,
      viewport,
      config: defaultConfig
    };

    if (showHeatmap) {
      drawHeatmap(drawContext, readings);
    } else {
      drawReadings(drawContext, readings, selectedReading);
    }
  }, [readings, selectedReading, viewport, showHeatmap]);

  // Handle reading selection
  const handleClick = (e: React.MouseEvent) => {
    if (!layersRef.current) return;

    const rect = layersRef.current.interaction.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const nearest = findNearestReading(x, y, readings, viewport);
    
    if (nearest) {
      setSelectedReading(nearest);
      onPointSelect?.(nearest);
    } else {
      setSelectedReading(undefined);
    }
  };

  // Handle pan/zoom interactions
  useEffect(() => {
    if (!containerRef.current) return;

    let isDragging = false;
    let lastX = 0;
    let lastY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - lastX;
      const deltaY = e.clientY - lastY;

      setViewport(prev => ({
        ...prev,
        offsetX: prev.offsetX + deltaX,
        offsetY: prev.offsetY + deltaY
      }));

      lastX = e.clientX;
      lastY = e.clientY;
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const rect = containerRef.current!.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      setViewport(prev => {
        const newScale = prev.scale * scaleFactor;
        const scaleRatio = 1 - scaleFactor;

        return {
          ...prev,
          scale: newScale,
          offsetX: prev.offsetX + (mouseX - prev.offsetX) * scaleRatio,
          offsetY: prev.offsetY + (mouseY - prev.offsetY) * scaleRatio
        };
      });
    };

    const container = containerRef.current;
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mouseleave', handleMouseUp);
    container.addEventListener('wheel', handleWheel);

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mouseleave', handleMouseUp);
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'relative',
        width,
        height,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0'
      }}
      onClick={handleClick}
    >
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 1000,
          display: 'flex',
          gap: '10px'
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowHeatmap(!showHeatmap);
          }}
          style={{
            padding: '5px 10px',
            backgroundColor: showHeatmap ? '#007bff' : '#fff',
            color: showHeatmap ? '#fff' : '#000',
            border: '1px solid #007bff',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {showHeatmap ? 'Show Points' : 'Show Heatmap'}
        </button>
      </div>
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#666'
          }}
        >
          Loading floor plan...
        </div>
      )}
    </div>
  );
};

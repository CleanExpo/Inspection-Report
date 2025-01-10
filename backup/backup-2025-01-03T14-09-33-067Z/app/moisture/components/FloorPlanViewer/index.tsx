'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { CanvasManager } from './canvas';
import { Controls } from './controls';
import type { FloorPlanViewerProps, ViewportConfig, TooltipInfo } from './types';

export default function FloorPlanViewer({
  floorPlan,
  config,
  controls,
  viewport,
  overlays = [],
  onMeasurementClick,
  onMeasurementHover,
  onViewportChange,
  onConfigChange
}: FloorPlanViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const managerRef = useRef<CanvasManager>();

  // Initialize canvas manager
  useEffect(() => {
    if (!canvasRef.current) return;

    try {
      const canvas = canvasRef.current;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      managerRef.current = new CanvasManager(
        canvas,
        {
          width: floorPlan.width,
          height: floorPlan.height,
          scale: floorPlan.scale,
          ...config
        },
        viewport,
        controls
      );

      // Set viewport change callback
      managerRef.current.setViewportChangeCallback((newViewport) => {
        onViewportChange?.(newViewport);
      });

      // Load floor plan image
      if (floorPlan.imageUrl) {
        setIsLoading(true);
        setError(null);
        managerRef.current.loadImage(floorPlan.imageUrl)
          .then(() => setIsLoading(false))
          .catch((err) => {
            console.error('Failed to load floor plan image:', err);
            setError('Failed to load floor plan image');
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }

      // Handle cleanup
      return () => {
        managerRef.current?.dispose();
      };
    } catch (err) {
      console.error('Failed to initialize canvas:', err);
      setError('Failed to initialize floor plan viewer');
      setIsLoading(false);
    }
  }, [config, viewport, floorPlan, onViewportChange]);

  // Update overlays when they change
  useEffect(() => {
    if (!managerRef.current) return;
    managerRef.current.setOverlays(overlays);
  }, [overlays]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !managerRef.current) return;

      const canvas = canvasRef.current;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      managerRef.current.render();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle measurement click
  const handleClick = useCallback((e: MouseEvent) => {
    if (!managerRef.current || !onMeasurementClick) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert screen coordinates to world coordinates
    const worldX = (x - managerRef.current.viewport.panX) / managerRef.current.viewport.zoom;
    const worldY = (y - managerRef.current.viewport.panY) / managerRef.current.viewport.zoom;

    // Find clicked measurement
    for (const overlay of overlays) {
      if (managerRef.current.isPointInOverlay(worldX, worldY, overlay)) {
        onMeasurementClick(overlay);
        break;
      }
    }
  }, [overlays, onMeasurementClick]);

  // Handle measurement hover
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!managerRef.current || !onMeasurementHover) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert screen coordinates to world coordinates
    const worldX = (x - managerRef.current.viewport.panX) / managerRef.current.viewport.zoom;
    const worldY = (y - managerRef.current.viewport.panY) / managerRef.current.viewport.zoom;

    // Find hovered measurement
    let hoveredOverlay = null;
    for (const overlay of overlays) {
      if (managerRef.current.isPointInOverlay(worldX, worldY, overlay)) {
        hoveredOverlay = overlay;
        break;
      }
    }

    onMeasurementHover(hoveredOverlay);
  }, [overlays, onMeasurementHover]);

  // Handle viewport changes
  const handleViewportChange = useCallback((newViewport: ViewportConfig) => {
    if (!onViewportChange) return;
    onViewportChange(newViewport);
  }, [onViewportChange]);

  // Setup event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (onMeasurementClick) {
      canvas.addEventListener('click', handleClick);
    }
    if (onMeasurementHover) {
      canvas.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (onMeasurementClick) {
        canvas.removeEventListener('click', handleClick);
      }
      if (onMeasurementHover) {
        canvas.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [handleClick, handleMouseMove, onMeasurementClick, onMeasurementHover]);

  // Control handlers with keyboard shortcuts
  const handleZoomIn = useCallback(() => {
    managerRef.current?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    managerRef.current?.zoomOut();
  }, []);

  const handleReset = useCallback(() => {
    managerRef.current?.resetView();
  }, []);

  const handleToggleGrid = useCallback(() => {
    if (!managerRef.current) return;
    managerRef.current.toggleGrid();
    onConfigChange?.({ ...managerRef.current.config });
  }, [onConfigChange]);

  const handleIncreaseGridSize = useCallback(() => {
    if (!managerRef.current) return;
    const newSize = Math.min((managerRef.current.config.gridSize || 10) * 2, 100);
    managerRef.current.setGridSize(newSize);
    onConfigChange?.({ ...managerRef.current.config });
  }, [onConfigChange]);

  const handleDecreaseGridSize = useCallback(() => {
    if (!managerRef.current) return;
    const newSize = Math.max((managerRef.current.config.gridSize || 10) / 2, 5);
    managerRef.current.setGridSize(newSize);
    onConfigChange?.({ ...managerRef.current.config });
  }, [onConfigChange]);

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!managerRef.current) return;

      const shortcuts = managerRef.current.getShortcuts();
      const ctrl = e.ctrlKey || e.metaKey;

      switch (e.key.toLowerCase()) {
        case shortcuts.zoomIn:
          if (ctrl) {
            e.preventDefault();
            handleZoomIn();
          }
          break;
        case shortcuts.zoomOut:
          if (ctrl) {
            e.preventDefault();
            handleZoomOut();
          }
          break;
        case shortcuts.reset:
          if (ctrl) {
            e.preventDefault();
            handleReset();
          }
          break;
        case shortcuts.toggleGrid:
          if (ctrl) {
            e.preventDefault();
            handleToggleGrid();
          }
          break;
        case '[':
          if (ctrl && managerRef.current?.config.showGrid) {
            e.preventDefault();
            handleDecreaseGridSize();
          }
          break;
        case ']':
          if (ctrl && managerRef.current?.config.showGrid) {
            e.preventDefault();
            handleIncreaseGridSize();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleZoomIn, handleZoomOut, handleReset, handleToggleGrid, handleIncreaseGridSize, handleDecreaseGridSize]);

  // Tooltip state
  const [tooltip, setTooltip] = useState<TooltipInfo>({
    content: '',
    x: 0,
    y: 0,
    visible: false
  });

  // Update tooltip on hover
  useEffect(() => {
    if (!managerRef.current?.config.showTooltips) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Convert screen coordinates to world coordinates
      const worldX = (x - managerRef.current!.viewport.panX) / managerRef.current!.viewport.zoom;
      const worldY = (y - managerRef.current!.viewport.panY) / managerRef.current!.viewport.zoom;

      // Find hovered measurement
      let hoveredOverlay = null;
      for (const overlay of overlays) {
        if (managerRef.current!.isPointInOverlay(worldX, worldY, overlay)) {
          hoveredOverlay = overlay;
          break;
        }
      }

      if (hoveredOverlay) {
        const content = `${hoveredOverlay.type}: ${hoveredOverlay.value || ''} ${hoveredOverlay.label || ''}`;
        setTooltip({
          content,
          x: e.clientX,
          y: e.clientY,
          visible: true
        });
      } else {
        setTooltip(prev => ({ ...prev, visible: false }));
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [overlays]);

  return (
    <div className="relative w-full h-full">
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 text-red-600">
          <p>{error}</p>
        </div>
      )}
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-t-transparent" />
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ touchAction: 'none' }}
        data-testid="floor-plan-viewer"
      />
      {managerRef.current && (
        <Controls
          config={managerRef.current.config}
          viewport={managerRef.current.viewport}
          shortcuts={managerRef.current.getShortcuts()}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onReset={handleReset}
          onToggleGrid={handleToggleGrid}
          onIncreaseGridSize={handleIncreaseGridSize}
          onDecreaseGridSize={handleDecreaseGridSize}
        />
      )}
      {tooltip.visible && (
        <div
          className="absolute bg-black text-white px-2 py-1 rounded text-sm pointer-events-none"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y + 10,
            transform: 'translate(0, -50%)',
            zIndex: 20
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}

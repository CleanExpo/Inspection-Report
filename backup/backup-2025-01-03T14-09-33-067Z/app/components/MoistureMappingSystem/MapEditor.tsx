import React, { useState, useCallback } from 'react';
import { MapCanvas } from './MapCanvas';
import { MapToolbar, DrawingMode } from './MapToolbar';
import type { MapLayout, Point, Wall, Door, Window } from '../../types/moisture';

interface MapEditorProps {
  layout: MapLayout;
  onChange?: (layout: MapLayout) => void;
  readOnly?: boolean;
  width?: number;
  height?: number;
}

const DEFAULT_DOOR_SIZE = { width: 40, height: 80 };
const DEFAULT_WINDOW_SIZE = { width: 40, height: 40 };

export const MapEditor: React.FC<MapEditorProps> = ({
  layout,
  onChange,
  readOnly = false,
  width,
  height,
}) => {
  const [mode, setMode] = useState<DrawingMode>('wall');
  const [history, setHistory] = useState<MapLayout[]>([layout]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const updateLayout = useCallback((newLayout: MapLayout) => {
    // Remove any future history when making a new change
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(newLayout);

    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
    onChange?.(newLayout);
  }, [history, currentIndex, onChange]);

  const handleUndo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      onChange?.(history[currentIndex - 1]);
    }
  }, [currentIndex, history, onChange]);

  const handleLayoutChange = useCallback((newLayout: MapLayout) => {
    updateLayout(newLayout);
  }, [updateLayout]);

  const handleDoorPlacement = useCallback((point: Point) => {
    const newDoor: Door = {
      position: point,
      ...DEFAULT_DOOR_SIZE,
    };

    const newLayout: MapLayout = {
      ...layout,
      doors: [...layout.doors, newDoor],
    };

    updateLayout(newLayout);
  }, [layout, updateLayout]);

  const handleWindowPlacement = useCallback((point: Point) => {
    const newWindow: Window = {
      position: point,
      ...DEFAULT_WINDOW_SIZE,
    };

    const newLayout: MapLayout = {
      ...layout,
      windows: [...layout.windows, newWindow],
    };

    updateLayout(newLayout);
  }, [layout, updateLayout]);

  const handleWallDrawing = useCallback((start: Point, end: Point) => {
    const newWall: Wall = { start, end };

    const newLayout: MapLayout = {
      ...layout,
      walls: [...layout.walls, newWall],
    };

    updateLayout(newLayout);
  }, [layout, updateLayout]);

  const handleCanvasClick = useCallback((point: Point) => {
    switch (mode) {
      case 'door':
        handleDoorPlacement(point);
        break;
      case 'window':
        handleWindowPlacement(point);
        break;
      // Reading mode is handled separately in the parent component
      default:
        break;
    }
  }, [mode, handleDoorPlacement, handleWindowPlacement]);

  const currentLayout = history[currentIndex];

  return (
    <div className="flex flex-col gap-4">
      <MapToolbar
        mode={mode}
        onModeChange={setMode}
        onUndo={handleUndo}
        canUndo={currentIndex > 0}
        readOnly={readOnly}
      />
      <MapCanvas
        layout={currentLayout}
        onLayoutChange={handleLayoutChange}
        readOnly={readOnly}
        width={width}
        height={height}
      />
    </div>
  );
};

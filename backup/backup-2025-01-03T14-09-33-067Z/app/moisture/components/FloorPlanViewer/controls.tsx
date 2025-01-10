import React from 'react';
import type { FloorPlanConfig, ViewportConfig } from './types';

interface ControlsProps {
  config: FloorPlanConfig;
  viewport: ViewportConfig;
  shortcuts: Record<string, string>;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onToggleGrid: () => void;
  onIncreaseGridSize: () => void;
  onDecreaseGridSize: () => void;
  showShortcuts?: boolean;
}

export function Controls({
  config,
  viewport,
  onZoomIn,
  onZoomOut,
  onReset,
  onToggleGrid,
  onIncreaseGridSize,
  onDecreaseGridSize,
  shortcuts
}: ControlsProps) {
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  }[config.controlPosition];

  if (!config.showControls) return null;

  return (
    <div 
      className={`absolute ${positionClasses} flex flex-col gap-2 bg-white rounded-lg shadow-lg p-2`}
      style={{ zIndex: 10 }}
    >
      {/* Keyboard Shortcuts Help */}
      {config.showControls && shortcuts && (
        <div className="mb-2 text-xs text-gray-600">
          <div className="font-semibold mb-1">Keyboard Shortcuts:</div>
          <div className="grid grid-cols-2 gap-x-2">
            {Object.entries(shortcuts).map(([action, key]) => (
              <div key={action} className="flex justify-between">
                <span className="capitalize">{action.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                <span className="font-mono bg-gray-100 px-1 rounded">{key}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <button
        onClick={onZoomIn}
        className="p-2 hover:bg-gray-100 rounded-lg"
        title={`Zoom In (${shortcuts.zoomIn})`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
      <button
        onClick={onZoomOut}
        className="p-2 hover:bg-gray-100 rounded-lg"
        title={`Zoom Out (${shortcuts.zoomOut})`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>
      <button
        onClick={onReset}
        className="p-2 hover:bg-gray-100 rounded-lg"
        title={`Reset View (${shortcuts.reset})`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
      <button
        onClick={onToggleGrid}
        className={`p-2 hover:bg-gray-100 rounded-lg ${config.showGrid ? 'text-blue-600' : ''}`}
        title={`Toggle Grid (${shortcuts.toggleGrid})`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5v14M4 12h16m-7-7v14" />
        </svg>
      </button>
      {config.showGrid && (
        <>
          <button
            onClick={onIncreaseGridSize}
            className="p-2 hover:bg-gray-100 rounded-lg"
            title="Increase Grid Size"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h18v18H3V3zm4 4h2m2 0h2m2 0h2M7 9h2m2 0h2m2 0h2" />
            </svg>
          </button>
          <button
            onClick={onDecreaseGridSize}
            className="p-2 hover:bg-gray-100 rounded-lg"
            title="Decrease Grid Size"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h18v18H3V3zm4 8h10" />
            </svg>
          </button>
        </>
      )}
      <div className="text-xs text-gray-500 text-center border-t pt-2">
        <div>{Math.round(viewport.zoom * 100)}%</div>
        {config.showGrid && (
          <div className="flex flex-col gap-1">
            <div>Grid: {config.gridSize}px</div>
            <div className="flex justify-center gap-2">
              <button
                onClick={onDecreaseGridSize}
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                title="Decrease Grid Size"
              >
                -
              </button>
              <button
                onClick={onIncreaseGridSize}
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                title="Increase Grid Size"
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

# FloorPlanViewer Component

## Overview
The FloorPlanViewer is a React component that provides an interactive canvas-based viewer for floor plans with moisture measurements. It supports zooming, panning, grid overlay, and measurement interactions.

## Features
- Interactive floor plan viewing with zoom and pan controls
- Grid overlay with customizable size and visibility
- Measurement overlays (points, areas, perimeters)
- Interactive tooltips for measurements
- Keyboard shortcuts for common operations
- Responsive design with window resize handling
- Loading and error states

## Props

### Required Props

```typescript
interface FloorPlan {
  id: string;
  imageUrl: string;
  width: number;
  height: number;
  scale: number;
  readings: MoistureReading[];
}

floorPlan: FloorPlan;  // Floor plan data including image and dimensions
```

### Optional Props

```typescript
interface FloorPlanViewerProps {
  config?: Partial<FloorPlanConfig>;        // Viewer configuration
  controls?: Partial<ControlsConfig>;       // Controls configuration
  viewport?: Partial<ViewportConfig>;       // Viewport settings
  overlays?: MeasurementOverlay[];         // Measurement overlays
  onMeasurementClick?: (measurement: MeasurementOverlay) => void;
  onMeasurementHover?: (measurement: MeasurementOverlay | null) => void;
  onViewportChange?: (viewport: ViewportConfig) => void;
  onConfigChange?: (config: FloorPlanConfig) => void;
  onControlsChange?: (controls: ControlsConfig) => void;
}
```

## Configuration

### Floor Plan Config
```typescript
interface FloorPlanConfig {
  width: number;                // Viewer width
  height: number;               // Viewer height
  scale: number;                // Scale factor
  gridSize: number;             // Grid cell size
  backgroundColor: string;      // Background color
  gridColor: string;           // Grid line color
  showGrid: boolean;           // Grid visibility
  showControls: boolean;       // Controls visibility
  showTooltips: boolean;       // Tooltip visibility
  controlPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  gridSizeRange?: {
    min: number;
    max: number;
  };
}
```

### Controls Config
```typescript
interface ControlsConfig {
  zoomStep: number;            // Zoom increment/decrement
  panStep: number;             // Pan distance
  shortcuts: {
    zoomIn: string;
    zoomOut: string;
    panUp: string;
    panDown: string;
    panLeft: string;
    panRight: string;
    reset: string;
    toggleGrid: string;
    increaseGridSize: string;
    decreaseGridSize: string;
  };
  showShortcutsHelp?: boolean;
  gridSizeStep?: number;
  minGridSize?: number;
  maxGridSize?: number;
}
```

### Viewport Config
```typescript
interface ViewportConfig {
  zoom: number;               // Current zoom level
  panX: number;              // X pan position
  panY: number;              // Y pan position
  minZoom: number;           // Minimum zoom level
  maxZoom: number;           // Maximum zoom level
}
```

## Usage Example

```tsx
import FloorPlanViewer from './FloorPlanViewer';

function MyComponent() {
  const floorPlan = {
    id: 'fp1',
    imageUrl: '/floor-plans/plan1.jpg',
    width: 1000,
    height: 800,
    scale: 1,
    readings: []
  };

  const config = {
    showGrid: true,
    gridSize: 20,
    showControls: true,
    showTooltips: true,
    controlPosition: 'bottom-right'
  };

  const handleMeasurementClick = (measurement) => {
    console.log('Clicked measurement:', measurement);
  };

  return (
    <div style={{ width: '800px', height: '600px' }}>
      <FloorPlanViewer
        floorPlan={floorPlan}
        config={config}
        onMeasurementClick={handleMeasurementClick}
      />
    </div>
  );
}
```

## Keyboard Shortcuts

The component supports the following keyboard shortcuts (when Ctrl key is pressed):
- `+`: Zoom in
- `-`: Zoom out
- `0`: Reset view
- `g`: Toggle grid
- `[`: Decrease grid size
- `]`: Increase grid size

## Events

### Measurement Events
- `onMeasurementClick`: Fired when a measurement overlay is clicked
- `onMeasurementHover`: Fired when hovering over a measurement overlay

### Configuration Events
- `onViewportChange`: Fired when the viewport configuration changes
- `onConfigChange`: Fired when the viewer configuration changes
- `onControlsChange`: Fired when control settings change

## Styling

The component uses Tailwind CSS classes for styling:
- Wrapper: `relative w-full h-full`
- Canvas: `w-full h-full`
- Loading spinner: `animate-spin rounded-full h-8 w-8 border-2`
- Tooltip: `absolute bg-black text-white px-2 py-1 rounded text-sm`

## Notes

1. Performance Considerations
   - Canvas resizing on window resize
   - Efficient overlay rendering
   - Throttled event handlers

2. Accessibility
   - Keyboard navigation support
   - Visual feedback for interactions
   - ARIA attributes for controls

3. Error Handling
   - Image loading errors
   - Invalid configuration handling
   - Graceful fallback states

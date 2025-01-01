# PerimeterMeasurementTool Component

## Overview
The PerimeterMeasurementTool is a React component that enables users to measure perimeters by drawing polygons on a canvas. It provides real-time visual feedback, displays individual segment measurements, and calculates the total perimeter in meters based on a provided scale factor.

## Features
- Polygon-based perimeter measurement
- Individual segment measurements
- Total perimeter calculation
- Real-time visual feedback
- Scale-aware distance calculation
- Interactive polygon drawing
- Auto-closing polygons
- Escape key cancellation
- Responsive canvas sizing

## Props

```typescript
interface PerimeterMeasurementToolProps {
  scale: number;              // Scale factor (meters per 100 pixels)
  containerWidth: number;     // Container width in pixels
  containerHeight: number;    // Container height in pixels
  isActive: boolean;         // Whether the tool is currently active
  onMeasurementComplete: (perimeter: number) => void;  // Callback when perimeter measurement is complete
}
```

## Data Structures

```typescript
interface Point {
  x: number;  // X coordinate in pixels
  y: number;  // Y coordinate in pixels
}
```

## Usage Example

```tsx
import PerimeterMeasurementTool from './PerimeterMeasurementTool';

function MyComponent() {
  const handlePerimeterMeasurement = (perimeter: number) => {
    console.log(`Measured perimeter: ${perimeter} meters`);
  };

  return (
    <div style={{ width: '800px', height: '600px', position: 'relative' }}>
      <PerimeterMeasurementTool
        scale={100}  // 1 meter = 100 pixels
        containerWidth={800}
        containerHeight={600}
        isActive={true}
        onMeasurementComplete={handlePerimeterMeasurement}
      />
    </div>
  );
}
```

## Interaction Flow

1. Initial State
   - Empty canvas waiting for user input
   - Tool must be active (`isActive={true}`)

2. Drawing Process
   - Click to place first point
   - Continue clicking to add polygon vertices
   - Visual feedback shows perimeter construction
   - Segment measurements displayed in real-time

3. Complete Measurement
   - Click near starting point to close polygon
   - Total perimeter calculated and displayed
   - Callback triggered with perimeter value
   - Tool resets for next measurement

4. Cancel Measurement
   - Press Escape key at any time
   - Clears current polygon
   - Resets tool state

## Visual Elements

1. Path
   ```typescript
   // Border
   ctx.strokeStyle = '#3182ce';  // Blue
   ctx.lineWidth = 2;
   ctx.stroke();
   ```

2. Points
   ```typescript
   // Start point
   ctx.fillStyle = '#2c5282';  // Dark blue
   ctx.arc(x, y, 4, 0, Math.PI * 2);

   // Other points
   ctx.fillStyle = '#3182ce';  // Light blue
   ctx.arc(x, y, 4, 0, Math.PI * 2);
   ```

3. Segment Measurements
   ```typescript
   // Text with background
   ctx.font = '12px Arial';
   ctx.fillStyle = '#2d3748';  // Dark gray
   ctx.textAlign = 'center';
   ctx.textBaseline = 'middle';
   ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';  // Background
   ```

4. Total Perimeter
   ```typescript
   ctx.font = '14px Arial';
   ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';  // Background
   ctx.fillStyle = '#2d3748';  // Text color
   ```

## Calculation Functions

```typescript
// Calculate distance between two points
function calculateDistance(point1: Point, point2: Point, scale: number): number {
  const pixelDistance = Math.sqrt(
    Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
  );
  const pixelsToMeters = scale / 100;
  return pixelDistance * pixelsToMeters;
}

// Calculate total perimeter
function calculatePerimeter(points: Point[], scale: number): number {
  if (points.length < 3) return 0;

  let perimeter = 0;
  for (let i = 0; i < points.length; i++) {
    const nextIndex = (i + 1) % points.length;
    perimeter += calculateDistance(points[i], points[nextIndex], scale);
  }
  return perimeter;
}

// Calculate center point for total measurement display
function calculatePolygonCenter(points: Point[]): Point {
  return points.reduce(
    (acc, point) => ({
      x: acc.x + point.x / points.length,
      y: acc.y + point.y / points.length
    }),
    { x: 0, y: 0 }
  );
}
```

## Styling

The component uses Tailwind CSS classes:
- Canvas: `absolute inset-0 cursor-crosshair`

## Event Handling

1. Mouse Events
   ```typescript
   onClick={handleCanvasClick}      // Add points/close polygon
   onMouseMove={handleMouseMove}    // Update temporary line
   ```

2. Keyboard Events
   ```typescript
   window.addEventListener('keydown', handleKeyDown);  // Escape key handling
   ```

## Notes

1. Usage Considerations
   - Parent container must have `position: relative`
   - Tool only renders when `isActive` is true
   - Scale factor should match floor plan scale
   - Minimum 3 points required for perimeter calculation

2. Performance
   - Efficient path rendering
   - Optimized measurement display
   - Event listeners properly cleaned up

3. Accessibility
   - Keyboard support for cancellation
   - Clear visual feedback
   - High contrast visual elements

4. Best Practices
   - Use appropriate scale factor
   - Provide container dimensions
   - Handle measurement completion
   - Clean up event listeners
   - Consider readability of segment measurements

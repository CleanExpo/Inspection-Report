# MeasurementTool Component

## Overview
The MeasurementTool is a React component that provides base functionality for measuring distances on a canvas. It handles user interactions for creating point-to-point measurements with real-world scale conversion.

## Features
- Point-to-point measurement
- Real-time visual feedback
- Scale-aware distance calculation
- Interactive drawing mode
- Escape key cancellation
- Responsive canvas sizing
- Clear visual indicators

## Props

```typescript
interface MeasurementToolProps {
  scale: number;              // Scale factor (meters per 100 pixels)
  containerWidth: number;     // Container width in pixels
  containerHeight: number;    // Container height in pixels
  isActive: boolean;         // Whether the tool is currently active
  onMeasurementComplete: (distance: number) => void;  // Callback when measurement is complete
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
import MeasurementTool from './MeasurementTool';

function MyComponent() {
  const handleMeasurementComplete = (distance: number) => {
    console.log(`Measured distance: ${distance} meters`);
  };

  return (
    <div style={{ width: '800px', height: '600px', position: 'relative' }}>
      <MeasurementTool
        scale={100}  // 1 meter = 100 pixels
        containerWidth={800}
        containerHeight={600}
        isActive={true}
        onMeasurementComplete={handleMeasurementComplete}
      />
    </div>
  );
}
```

## Interaction Flow

1. Initial State
   - Empty canvas waiting for user input
   - Tool must be active (`isActive={true}`)

2. Start Measurement
   - User clicks to set start point
   - Blue dot appears at click location
   - Drawing mode activated

3. During Measurement
   - Line follows mouse movement
   - Shows real-time distance
   - Visual feedback with line and points

4. Complete Measurement
   - User clicks to set end point
   - Final measurement displayed
   - Distance calculated and callback triggered
   - Tool resets for next measurement

5. Cancel Measurement
   - Press Escape key at any time
   - Clears current measurement
   - Resets tool state

## Visual Elements

1. Points
   ```typescript
   // Start point
   ctx.fillStyle = '#2c5282';  // Dark blue
   ctx.arc(x, y, 4, 0, Math.PI * 2);

   // End point
   ctx.fillStyle = '#3182ce';  // Light blue
   ctx.arc(x, y, 4, 0, Math.PI * 2);
   ```

2. Line
   ```typescript
   ctx.strokeStyle = '#3182ce';  // Light blue
   ctx.lineWidth = 2;
   ```

3. Measurement Text
   ```typescript
   ctx.font = '14px Arial';
   ctx.fillStyle = '#2d3748';  // Dark gray
   // White background with opacity
   ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
   ```

## Distance Calculation

```typescript
function calculateDistance(point1: Point, point2: Point, scale: number): number {
  // Calculate pixel distance using Pythagorean theorem
  const pixelDistance = Math.sqrt(
    Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
  );
  
  // Convert to meters using scale factor
  const pixelsToMeters = scale / 100;
  return pixelDistance * pixelsToMeters;
}
```

## Styling

The component uses Tailwind CSS classes:
- Canvas: `absolute inset-0 cursor-crosshair`

## Event Handling

1. Mouse Events
   ```typescript
   onClick={handleCanvasClick}      // Start/end points
   onMouseMove={handleMouseMove}    // Real-time line drawing
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

2. Performance
   - Canvas cleared and redrawn on each update
   - Event listeners properly cleaned up
   - Efficient point calculation

3. Accessibility
   - Keyboard support for cancellation
   - Clear visual feedback
   - High contrast visual elements

4. Best Practices
   - Initialize with correct scale factor
   - Provide appropriate container dimensions
   - Handle measurement completion callback
   - Clean up event listeners on unmount

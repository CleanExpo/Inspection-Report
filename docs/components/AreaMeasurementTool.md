# AreaMeasurementTool Component

## Overview
The AreaMeasurementTool is a React component that enables users to measure areas by drawing polygons on a canvas. It provides real-time visual feedback and calculates the area in square meters based on a provided scale factor.

## Features
- Polygon-based area measurement
- Real-time visual feedback
- Scale-aware area calculation
- Interactive polygon drawing
- Auto-closing polygons
- Semi-transparent fill
- Escape key cancellation
- Responsive canvas sizing

## Props

```typescript
interface AreaMeasurementToolProps {
  scale: number;              // Scale factor (meters per 100 pixels)
  containerWidth: number;     // Container width in pixels
  containerHeight: number;    // Container height in pixels
  isActive: boolean;         // Whether the tool is currently active
  onMeasurementComplete: (area: number) => void;  // Callback when area measurement is complete
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
import AreaMeasurementTool from './AreaMeasurementTool';

function MyComponent() {
  const handleAreaMeasurement = (area: number) => {
    console.log(`Measured area: ${area} square meters`);
  };

  return (
    <div style={{ width: '800px', height: '600px', position: 'relative' }}>
      <AreaMeasurementTool
        scale={100}  // 1 meter = 100 pixels
        containerWidth={800}
        containerHeight={600}
        isActive={true}
        onMeasurementComplete={handleAreaMeasurement}
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
   - Visual feedback shows polygon construction
   - Semi-transparent fill indicates measured area

3. Complete Measurement
   - Click near starting point to close polygon
   - Area calculated and displayed
   - Callback triggered with area value
   - Tool resets for next measurement

4. Cancel Measurement
   - Press Escape key at any time
   - Clears current polygon
   - Resets tool state

## Visual Elements

1. Polygon
   ```typescript
   // Fill
   ctx.fillStyle = 'rgba(66, 153, 225, 0.2)';  // Semi-transparent blue
   ctx.fill();

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

3. Area Text
   ```typescript
   ctx.font = '14px Arial';
   ctx.fillStyle = '#2d3748';  // Dark gray
   ctx.textAlign = 'center';
   ctx.textBaseline = 'middle';
   ```

## Area Calculation

```typescript
function calculateArea(points: Point[], scale: number): number {
  // Calculate area using shoelace formula
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  area = Math.abs(area) / 2;
  
  // Convert to square meters using scale
  const pixelsToMeters = scale / 100;
  return area * Math.pow(pixelsToMeters, 2);
}
```

## Helper Functions

```typescript
function calculatePolygonCenter(points: Point[]): Point {
  // Calculate centroid for text placement
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
   - Minimum 3 points required for area calculation

2. Performance
   - Efficient polygon rendering
   - Optimized point handling
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
   - Consider polygon complexity vs performance

# ThreeDVisualization Component

## Overview
The ThreeDVisualization component provides a three-dimensional visualization of moisture readings across multiple floor plans using Three.js. It supports interactive camera controls, point selection, and hover effects.

## Features
- 3D visualization of moisture readings
- Interactive camera controls (rotation, zoom, pan)
- Multiple floor plan level support
- Point interaction (hover and click)
- Customizable controls and appearance
- Responsive design
- Automatic cleanup and disposal

## Props

### Optional Props
```typescript
interface ThreeDVisualizationProps {
  backgroundColor?: number;      // Background color in hex (default: 0xf0f0f0)
  fov?: number;                 // Field of view in degrees (default: 75)
  floorPlans?: FloorPlan[];     // Array of floor plans with moisture readings
  controlSettings?: ControlSettings;  // Camera control settings
}
```

## Data Structures

### Floor Plan
```typescript
interface FloorPlan {
  id: string;           // Unique identifier
  level: number;        // Floor level
  scale: number;        // Scale factor
  width: number;        // Floor plan width
  height: number;       // Floor plan height
  readings: MoistureReading[];  // Array of moisture readings
}
```

### Moisture Reading
```typescript
interface MoistureReading {
  locationX: number;    // X coordinate
  locationY: number;    // Y coordinate
  dataPoints: {
    value: number;      // Moisture value
    unit: string;       // Measurement unit
  }[];
}
```

### Control Settings
```typescript
interface ControlSettings {
  minDistance?: number;      // Minimum camera distance (default: 5)
  maxDistance?: number;      // Maximum camera distance (default: 100)
  rotationSpeed?: number;    // Camera rotation speed (default: 1.0)
  zoomSpeed?: number;        // Camera zoom speed (default: 1.0)
  enableDamping?: boolean;   // Enable smooth camera movement (default: true)
  minPolarAngle?: number;    // Minimum vertical rotation angle
  maxPolarAngle?: number;    // Maximum vertical rotation angle
  dampingFactor?: number;    // Camera movement damping factor
}
```

## Usage Example

```tsx
import ThreeDVisualization from './ThreeDVisualization';

function MyComponent() {
  const floorPlans = [
    {
      id: 'floor1',
      level: 0,
      scale: 1,
      width: 1000,
      height: 800,
      readings: [
        {
          locationX: 100,
          locationY: 200,
          dataPoints: [
            { value: 15.5, unit: '%' }
          ]
        }
      ]
    }
  ];

  const controlSettings = {
    minDistance: 10,
    maxDistance: 50,
    rotationSpeed: 0.8,
    enableDamping: true
  };

  return (
    <ThreeDVisualization
      backgroundColor={0x000000}
      fov={65}
      floorPlans={floorPlans}
      controlSettings={controlSettings}
    />
  );
}
```

## Scene Management

The component uses three main managers to handle different aspects of the visualization:

1. SceneManager
   - Handles Three.js scene setup
   - Manages lighting
   - Handles window resizing
   - Manages scene disposal

2. ControlManager
   - Handles camera controls
   - Manages user interaction with the scene
   - Implements smooth camera movement
   - Handles control disposal

3. PointsManager
   - Manages moisture reading points
   - Handles point hover and selection states
   - Manages point meshes and materials
   - Handles point cleanup

## Interaction

### Mouse Controls
- Rotation: Click and drag
- Zoom: Mouse wheel
- Pan: Right-click and drag
- Point Selection: Click on point
- Point Hover: Mouse over point

### Point Interaction
- Points highlight on hover
- Points can be selected with click
- Selected points maintain highlight state
- Hover and selection states are managed by PointsManager

## Styling

The component uses Tailwind CSS classes:
- Container: `w-full h-[600px] rounded-lg overflow-hidden`

## Technical Details

1. Scene Setup
   - Uses Three.js for 3D rendering
   - Implements requestAnimationFrame for smooth animation
   - Handles proper cleanup and disposal

2. Performance Considerations
   - Efficient point management
   - Optimized raycasting for interactions
   - Proper resource cleanup
   - Event listener management

3. Cleanup
   - Disposes of Three.js resources
   - Removes event listeners
   - Cancels animation frame
   - Cleans up managers

## Notes

1. Browser Support
   - Requires WebGL support
   - Falls back gracefully if WebGL is not available

2. Performance
   - Consider point count for optimal performance
   - Use appropriate control settings for smooth interaction
   - Monitor frame rate with large datasets

3. Best Practices
   - Initialize with reasonable control limits
   - Provide appropriate scale factors
   - Clean up resources when component unmounts

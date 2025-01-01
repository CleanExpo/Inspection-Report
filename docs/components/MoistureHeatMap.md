# MoistureHeatMap Component

The MoistureHeatMap component provides a visual representation of moisture readings using a heat map overlay. It generates a color-coded visualization where areas of high moisture are represented in red and areas of low moisture in blue.

## Features

### Heat Map Visualization
- Real-time rendering of moisture data
- Smooth gradient transitions between readings
- Color-coded intensity representation
- Transparent overlay capability

### Gaussian Distribution
- Smooth interpolation between measurement points
- Configurable radius of influence
- Intensity falloff based on distance
- Natural blending of overlapping areas

### Color Mapping
- Blue to red color gradient
- Blue indicates low moisture levels
- Red indicates high moisture levels
- Green transition for medium values
- Opacity control for visualization clarity

### Canvas Rendering
- Efficient pixel-based rendering
- Hardware-accelerated graphics
- Blur filter for smooth visualization
- Dynamic resolution scaling

## Props

| Prop | Type | Description |
|------|------|-------------|
| readings | MoistureReading[] | Array of moisture readings with location and value data |
| width | number | Width of the heat map canvas in pixels |
| height | number | Height of the heat map canvas in pixels |
| opacity | number | Opacity level of the heat map (0-1) |

## Usage

```tsx
import { MoistureHeatMap } from 'components/MoistureHeatMap';

const MoistureDashboard = () => {
  return (
    <MoistureHeatMap
      readings={[
        {
          locationX: 50,
          locationY: 50,
          dataPoints: [{ value: 15, unit: '%' }]
        }
      ]}
      width={800}
      height={600}
      opacity={0.7}
    />
  );
};
```

## Component Structure

1. **Canvas Setup**
   - Dynamic canvas sizing
   - Context initialization
   - Resolution configuration
   - Clear state management

2. **Data Processing**
   - Reading normalization
   - Gaussian distribution calculation
   - Value interpolation
   - Maximum value determination

3. **Color Generation**
   - RGB color mapping
   - Alpha channel handling
   - Gradient calculation
   - Color intensity scaling

4. **Rendering Pipeline**
   - Image data creation
   - Pixel-level color assignment
   - Blur filter application
   - Canvas drawing operations

## Algorithm Details

### Heat Map Generation

1. **Initialization**
   - Create Float32Array for heat map data
   - Set up canvas dimensions
   - Clear previous render state

2. **Reading Processing**
   - Normalize reading locations to canvas dimensions
   - Convert moisture values to 0-1 scale
   - Apply Gaussian distribution
   - Accumulate intensity values

3. **Color Mapping**
   - Normalize accumulated values
   - Convert to RGB color space
   - Apply opacity settings
   - Generate final pixel data

### Gaussian Distribution

The component uses a Gaussian function to create smooth transitions:
```typescript
intensity = exp(-(distance²) / (2 * (radius * 0.3)²))
```
- Radius is 10% of the smaller canvas dimension
- Intensity falls off exponentially with distance
- Distribution is truncated at the radius limit

## Best Practices

1. **Performance Optimization**
   - Limit number of readings for smooth performance
   - Use appropriate canvas dimensions
   - Consider device capabilities
   - Optimize update frequency

2. **Visual Clarity**
   - Adjust opacity for clear overlay
   - Consider background contrast
   - Use appropriate radius settings
   - Balance detail and smoothness

3. **Data Quality**
   - Validate reading coordinates
   - Ensure consistent units
   - Handle missing values
   - Filter outlier readings

4. **Responsive Design**
   - Update dimensions on resize
   - Maintain aspect ratio
   - Consider pixel density
   - Handle mobile displays

## Error Handling

The component includes several safeguards:

- Null checks for canvas context
- Dimension validation
- Data point validation
- Boundary checking for coordinates
- Graceful handling of missing values

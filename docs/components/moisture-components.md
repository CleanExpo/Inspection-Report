# Component Documentation

## Table of Contents
- [MoistureReading](#moisturereading)
- [MoistureMap](#moisturemap)
- [MoistureChart](#moisturechart)

## MoistureReading
Component for displaying moisture reading values with visual indicators and trends.

### Props

| Name | Type | Required | Description | Default |
| ---- | ---- | -------- | ----------- | ------- |
| value | number | Yes | Current moisture reading value (percentage) | - |
| timestamp | string | No | Time of reading (ISO 8601) | Current time |
| trend | 'up' \| 'down' \| 'stable' | No | Trend indicator for the reading | 'stable' |
| threshold | number | No | Warning threshold value | 60 |
| size | 'sm' \| 'md' \| 'lg' | No | Size of the component | 'md' |
| onThresholdExceeded | (value: number) => void | No | Callback when value exceeds threshold | - |

### Examples

#### Basic Usage
Simple example showing basic usage with a value.

```tsx
import { MoistureReading } from '@/components/MoistureReading';

export default function Example() {
    return <MoistureReading value={45.5} />;
}
```

#### With Trend Indicator
Example showing usage with trend indicator and timestamp.

```tsx
import { MoistureReading } from '@/components/MoistureReading';

export default function Example() {
    return (
        <MoistureReading
            value={65.8}
            trend="up"
            timestamp="2024-01-15T12:00:00Z"
            threshold={60}
            onThresholdExceeded={(value) => {
                console.log(`Warning: High moisture level ${value}%`);
            }}
        />
    );
}
```

### Visual Guides

#### Component Layout
Visual guide showing the layout of the MoistureReading component.

![MoistureReading Component Layout](/docs/images/moisture-reading-layout.png)

#### Color States
Guide showing different color states based on moisture levels.

![MoistureReading Color States](/docs/images/moisture-reading-colors.png)

### Notes

- Values are displayed as percentages (0-100%)
- Color changes based on moisture level:
  - Green: Below 60%
  - Yellow: 60-75%
  - Red: Above 75%
- Trend indicators show changes over the last hour
- Component is responsive and adjusts size based on container

## MoistureMap
Interactive component for visualizing moisture readings on a floor plan.

### Props

| Name | Type | Required | Description | Default |
| ---- | ---- | -------- | ----------- | ------- |
| readings | MoistureReading[] | Yes | Array of moisture readings | - |
| floorPlan | string | Yes | URL of floor plan image | - |
| width | number | No | Width of the map | 800 |
| height | number | No | Height of the map | 600 |
| interactive | boolean | No | Enable interactive features | true |
| onReadingClick | (reading: MoistureReading) => void | No | Click handler for readings | - |

### Examples

#### Basic Map
Basic example showing a moisture map with readings.

```tsx
import { MoistureMap } from '@/components/MoistureMap';

const readings = [
    { id: '1', x: 100, y: 100, value: 45.5 },
    { id: '2', x: 200, y: 150, value: 65.8 },
];

export default function Example() {
    return (
        <MoistureMap
            readings={readings}
            floorPlan="/images/floor-plan.png"
            width={800}
            height={600}
        />
    );
}
```

### Visual Guides

#### Map Interactions
Guide showing available map interactions.

![MoistureMap Interactions](/docs/images/moisture-map-interactions.png)

### Notes

- Readings are positioned using x,y coordinates
- Hover over readings to see detailed information
- Click readings to select and highlight them
- Supports zooming and panning when interactive mode is enabled

## MoistureChart
Component for displaying moisture reading trends over time.

### Props

| Name | Type | Required | Description | Default |
| ---- | ---- | -------- | ----------- | ------- |
| data | MoistureData[] | Yes | Array of moisture readings | - |
| type | 'line' \| 'bar' | No | Type of chart | 'line' |
| timeRange | 'day' \| 'week' \| 'month' | No | Time range to display | 'day' |
| showLegend | boolean | No | Show chart legend | true |

### Examples

#### Line Chart
Example showing a line chart of moisture readings.

```tsx
import { MoistureChart } from '@/components/MoistureChart';

const data = [
    { timestamp: '2024-01-15T12:00:00Z', value: 45.5 },
    { timestamp: '2024-01-15T13:00:00Z', value: 48.2 },
    { timestamp: '2024-01-15T14:00:00Z', value: 52.1 },
];

export default function Example() {
    return (
        <MoistureChart
            data={data}
            type="line"
            timeRange="day"
            showLegend={true}
        />
    );
}
```

### Visual Guides

#### Chart Types
Guide showing different chart type options.

![MoistureChart Types](/docs/images/moisture-chart-types.png)

### Notes

- Data points are automatically interpolated
- Hover over points to see exact values
- Charts are responsive and resize with container
- Supports real-time data updates

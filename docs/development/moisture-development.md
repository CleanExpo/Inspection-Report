# Moisture Mapping System Development Documentation

Version: 1.0.0

## Table of Contents
1. [Architecture](#architecture)
2. [Development Guides](#development-guides)
3. [Best Practices](#best-practices)

## Architecture

The Moisture Mapping System is built using a modern, scalable architecture that emphasizes modularity, real-time capabilities, and data accuracy. The system follows a microservices approach with clear separation of concerns.

### System Overview

High-level overview of the moisture mapping system architecture.

![System Architecture](/docs/images/architecture.png)

#### Components

##### Moisture Service
Core service responsible for handling moisture readings and data processing.

Responsibilities:
- Process incoming moisture sensor data
- Store readings in the database
- Provide real-time updates via WebSocket
- Handle data validation and calibration
- Manage sensor configurations

Technologies:
- Node.js
- TypeScript
- PostgreSQL
- WebSocket
- Redis (caching)

##### Data Processing Pipeline
Service for analyzing and processing moisture readings.

Responsibilities:
- Analyze moisture trends
- Generate moisture maps
- Calculate risk assessments
- Create data visualizations
- Export reports

Technologies:
- Python
- NumPy/Pandas
- TensorFlow
- Matplotlib
- Docker

##### Frontend Application
React-based web application for visualizing moisture data.

Responsibilities:
- Display real-time moisture readings
- Render interactive moisture maps
- Show trend analysis
- Handle user interactions
- Manage offline capabilities

Technologies:
- React
- TypeScript
- Next.js
- TailwindCSS
- WebSocket

## Development Guides

### Setting Up Development Environment

#### Prerequisites
- Node.js 18.0 or higher
- Python 3.9 or higher
- Docker Desktop
- PostgreSQL 14
- Redis

#### Installation Steps

1. Clone the repository:
```bash
git clone https://github.com/company/moisture-mapping.git
cd moisture-mapping
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start development services:
```bash
docker-compose up -d
```

5. Run database migrations:
```bash
npm run migrate
```

### Development Workflow

#### Branch Strategy
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `release/*`: Release preparation

Example branch creation:
```bash
git checkout -b feature/realtime-updates
```

#### Testing

1. Unit Tests:
```typescript
import { MoistureService } from '../services';

describe('MoistureService', () => {
    it('should process readings correctly', () => {
        const service = new MoistureService();
        const reading = service.processReading({
            value: 45.5,
            timestamp: new Date()
        });
        expect(reading.normalized).toBe(true);
    });
});
```

2. Integration Tests:
```typescript
describe('Moisture API', () => {
    it('should store readings', async () => {
        const response = await request(app)
            .post('/api/readings')
            .send({
                value: 45.5,
                location: 'Room A'
            });
        expect(response.status).toBe(200);
    });
});
```

## Best Practices

### Code Style

#### Use Meaningful Names

Choose descriptive and meaningful names for variables and functions.

##### Good Example
```typescript
const moistureReading = await getMoistureLevel(sensorId);
if (moistureReading.exceedsThreshold()) {
    await notifyMoistureAlert(moistureReading);
}
```

##### Bad Example
```typescript
const x = await getML(sid);
if (x.isHigh()) {
    await notify(x);
}
```

#### Handle Errors Properly

Implement proper error handling and provide meaningful error messages.

##### Good Example
```typescript
try {
    const reading = await moistureService.getReading(sensorId);
    return reading;
} catch (error) {
    if (error instanceof SensorNotFoundError) {
        throw new ApiError(404, `Sensor ${sensorId} not found`);
    }
    if (error instanceof CalibrationError) {
        throw new ApiError(400, 'Sensor requires calibration');
    }
    throw new ApiError(500, 'Internal server error');
}
```

##### Bad Example
```typescript
try {
    return await moistureService.getReading(sensorId);
} catch (error) {
    throw error;
}
```

### Performance

#### Optimize Data Queries

Write efficient database queries and use proper indexing.

##### Good Example
```typescript
const readings = await prisma.moistureReading.findMany({
    where: {
        timestamp: {
            gte: startDate,
            lte: endDate
        },
        sensorId
    },
    select: {
        value: true,
        timestamp: true
    },
    orderBy: {
        timestamp: 'desc'
    },
    take: 100
});
```

##### Bad Example
```typescript
const readings = await prisma.moistureReading.findMany();
const filtered = readings.filter(r => 
    r.timestamp >= startDate && 
    r.timestamp <= endDate &&
    r.sensorId === sensorId
).slice(0, 100);
```

### Security

#### Validate Input Data

Always validate and sanitize input data before processing.

##### Good Example
```typescript
import { z } from 'zod';

const ReadingSchema = z.object({
    value: z.number().min(0).max(100),
    sensorId: z.string().uuid(),
    timestamp: z.date()
});

function processReading(data: unknown) {
    const validated = ReadingSchema.parse(data);
    return moistureService.process(validated);
}
```

##### Bad Example
```typescript
function processReading(data: any) {
    return moistureService.process(data);
}
```

### Testing

#### Write Comprehensive Tests

Ensure proper test coverage for critical functionality.

##### Good Example
```typescript
describe('MoistureCalculator', () => {
    it('should calculate relative humidity', () => {
        const calculator = new MoistureCalculator();
        
        expect(calculator.getRelativeHumidity(20, 50)).toBe(45.5);
        expect(calculator.getRelativeHumidity(-10, 50)).toBe(0);
        expect(calculator.getRelativeHumidity(120, 50)).toBe(100);
    });

    it('should handle invalid inputs', () => {
        const calculator = new MoistureCalculator();
        
        expect(() => calculator.getRelativeHumidity(NaN, 50))
            .toThrow('Invalid temperature');
    });
});
```

##### Bad Example
```typescript
test('calculator works', () => {
    const calc = new MoistureCalculator();
    expect(calc.getRelativeHumidity(20, 50)).toBe(45.5);
});

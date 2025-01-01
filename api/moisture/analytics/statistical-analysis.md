# Statistical Analysis

## Basic Statistics

### Descriptive Statistics
```typescript
interface DescriptiveStats {
  count: number;
  min: number;
  max: number;
  range: number;
  mean: number;
  median: number;
  mode: number[];
  variance: number;
  stdDev: number;
  skewness: number;
  kurtosis: number;
}

function calculateDescriptiveStats(data: number[]): DescriptiveStats;
```

### Percentile Analysis
```typescript
interface PercentileConfig {
  percentiles: number[];  // values between 0-100
  interpolation: 'linear' | 'lower' | 'higher' | 'nearest';
}

interface PercentileResults {
  values: Record<number, number>;  // percentile -> value mapping
  boundaries: {
    lowerQuartile: number;
    median: number;
    upperQuartile: number;
    iqr: number;
  };
}

function calculatePercentiles(
  data: number[],
  config: PercentileConfig
): PercentileResults;
```

## Distribution Analysis

### Distribution Testing
```typescript
interface DistributionTest {
  type: 'normal' | 'uniform' | 'exponential';
  statistic: number;
  pValue: number;
  isSignificant: boolean;
  confidence: number;
}

interface DistributionConfig {
  types: ('normal' | 'uniform' | 'exponential')[];
  significance: number;  // typically 0.05
}

function testDistribution(
  data: number[],
  config: DistributionConfig
): DistributionTest[];
```

### Histogram Generation
```typescript
interface HistogramBin {
  start: number;
  end: number;
  count: number;
  frequency: number;  // normalized frequency
}

interface HistogramConfig {
  binCount?: number;
  binWidth?: number;
  range?: [number, number];
}

function generateHistogram(
  data: number[],
  config: HistogramConfig
): HistogramBin[];
```

## Outlier Detection

### Statistical Methods
```typescript
interface OutlierConfig {
  method: 'zscore' | 'iqr' | 'modified-zscore';
  threshold: number;
  robust?: boolean;
}

interface OutlierAnalysis {
  outliers: number[];
  indices: number[];
  bounds: {
    lower: number;
    upper: number;
  };
  summary: {
    total: number;
    outlierCount: number;
    percentage: number;
  };
}

function detectOutliers(
  data: number[],
  config: OutlierConfig
): OutlierAnalysis;
```

### Anomaly Detection
```typescript
interface AnomalyConfig {
  method: 'isolation-forest' | 'local-outlier-factor' | 'dbscan';
  params: Record<string, number>;
  contamination: number;  // expected proportion of anomalies
}

interface AnomalyScore {
  value: number;
  score: number;  // anomaly score (0-1)
  isAnomaly: boolean;
}

function detectAnomalies(
  data: number[],
  config: AnomalyConfig
): AnomalyScore[];
```

## Confidence Intervals

### Interval Calculation
```typescript
interface ConfidenceInterval {
  mean: number;
  lower: number;
  upper: number;
  confidence: number;
  margin: number;
}

interface IntervalConfig {
  confidence: number;  // typically 0.95
  distribution: 'normal' | 'student-t';
  twoSided: boolean;
}

function calculateConfidenceInterval(
  data: number[],
  config: IntervalConfig
): ConfidenceInterval;
```

### Prediction Intervals
```typescript
interface PredictionInterval extends ConfidenceInterval {
  prediction: number;
  tolerance: number;
}

interface PredictionConfig extends IntervalConfig {
  forecast: number;  // steps ahead
  tolerance: number;  // prediction tolerance
}

function calculatePredictionInterval(
  data: number[],
  config: PredictionConfig
): PredictionInterval;
```

## Implementation Guidelines

### Numerical Stability
1. Use Welford's online algorithm for variance
2. Implement robust statistics where applicable
3. Handle floating-point arithmetic carefully
4. Validate inputs for numerical operations

### Performance Optimization
```typescript
interface ComputationConfig {
  precision: number;
  maxIterations: number;
  convergenceTolerance: number;
}

interface PerformanceMetrics {
  computationTime: number;
  memoryUsage: number;
  iterationCount: number;
}

function optimizeComputation(
  operation: (data: number[]) => unknown,
  config: ComputationConfig
): [unknown, PerformanceMetrics];
```

### Error Handling
1. Input Validation
   - Check for sufficient data points
   - Validate numerical ranges
   - Handle missing values

2. Computation Errors
   - Handle division by zero
   - Manage overflow/underflow
   - Report convergence failures

3. Result Validation
   - Verify statistical properties
   - Check confidence levels
   - Validate distributions

## Usage Examples

### Basic Statistical Analysis
```typescript
// Calculate descriptive statistics
const stats = calculateDescriptiveStats(moistureValues);

// Generate histogram
const histogram = generateHistogram(moistureValues, {
  binCount: 20
});

// Calculate percentiles
const percentiles = calculatePercentiles(moistureValues, {
  percentiles: [25, 50, 75, 90, 95, 99],
  interpolation: 'linear'
});
```

### Advanced Analysis
```typescript
// Detect outliers
const outliers = detectOutliers(moistureValues, {
  method: 'iqr',
  threshold: 1.5,
  robust: true
});

// Calculate confidence intervals
const interval = calculateConfidenceInterval(moistureValues, {
  confidence: 0.95,
  distribution: 'student-t',
  twoSided: true
});

// Test distribution
const distTest = testDistribution(moistureValues, {
  types: ['normal', 'uniform'],
  significance: 0.05
});

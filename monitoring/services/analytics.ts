import { MetricData, ResourceMetrics, PerformanceData } from '../types/metrics';

interface PerformancePattern {
  type: 'spike' | 'degradation' | 'improvement' | 'anomaly';
  metric: string;
  timestamp: string;
  value: number;
  threshold: number;
  description: string;
}

interface ResourcePattern {
  type: 'high-usage' | 'trend-up' | 'trend-down' | 'fluctuation';
  resource: 'memory' | 'cpu' | 'connections';
  timestamp: string;
  value: number;
  threshold: number;
  description: string;
}

interface OptimizationRecommendation {
  type: 'performance' | 'resource' | 'scaling';
  priority: 'high' | 'medium' | 'low';
  description: string;
  impact: string;
  action: string;
}

export class AnalyticsService {
  private responseTimeHistory: MetricData[] = [];
  private resourceHistory: ResourceMetrics[] = [];
  private performanceHistory: PerformanceData[] = [];
  private patterns: (PerformancePattern | ResourcePattern)[] = [];
  private recommendations: OptimizationRecommendation[] = [];

  // Configuration
  private readonly RESPONSE_TIME_THRESHOLD = 1000; // 1 second
  private readonly MEMORY_THRESHOLD = 80; // 80%
  private readonly CPU_THRESHOLD = 70; // 70%
  private readonly CONNECTIONS_THRESHOLD = 1000;
  private readonly HISTORY_LIMIT = 1000; // Keep last 1000 data points
  private readonly PATTERN_DETECTION_WINDOW = 60; // Look at last 60 data points for patterns

  addMetrics(
    responseTime: MetricData[],
    resources: ResourceMetrics[],
    performance: PerformanceData[]
  ) {
    // Update histories
    this.responseTimeHistory = [
      ...this.responseTimeHistory,
      ...responseTime
    ].slice(-this.HISTORY_LIMIT);

    this.resourceHistory = [
      ...this.resourceHistory,
      ...resources
    ].slice(-this.HISTORY_LIMIT);

    this.performanceHistory = [
      ...this.performanceHistory,
      ...performance
    ].slice(-this.HISTORY_LIMIT);

    // Analyze new data
    this.detectPatterns();
    this.generateRecommendations();
  }

  private detectPatterns() {
    this.patterns = [
      ...this.detectResponseTimePatterns(),
      ...this.detectResourcePatterns()
    ];
  }

  private detectResponseTimePatterns(): PerformancePattern[] {
    const patterns: PerformancePattern[] = [];
    const recentData = this.responseTimeHistory.slice(-this.PATTERN_DETECTION_WINDOW);

    if (recentData.length < 2) return patterns;

    // Calculate statistics
    const values = recentData.map(d => d.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length
    );

    // Detect spikes (values > 2 standard deviations from mean)
    recentData.forEach(data => {
      if (Math.abs(data.value - mean) > 2 * stdDev) {
        patterns.push({
          type: 'spike',
          metric: 'responseTime',
          timestamp: data.timestamp,
          value: data.value,
          threshold: mean + 2 * stdDev,
          description: `Response time spike detected (${data.value}ms vs average ${mean.toFixed(2)}ms)`
        });
      }
    });

    // Detect degradation (consistent increase over time)
    const trendSlope = this.calculateTrendSlope(values);
    if (trendSlope > 0.1) { // 10% increase rate
      patterns.push({
        type: 'degradation',
        metric: 'responseTime',
        timestamp: new Date().toISOString(),
        value: trendSlope,
        threshold: 0.1,
        description: `Response time showing consistent degradation (${(trendSlope * 100).toFixed(1)}% increase rate)`
      });
    }

    return patterns;
  }

  private detectResourcePatterns(): ResourcePattern[] {
    const patterns: ResourcePattern[] = [];
    const recentData = this.resourceHistory.slice(-this.PATTERN_DETECTION_WINDOW);

    if (recentData.length < 2) return patterns;

    // Check each resource type
    ['memory', 'cpu', 'connections'].forEach((resource) => {
      const values = recentData.map(d => d[resource as keyof ResourceMetrics] as number);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const latest = values[values.length - 1];
      const threshold = this.getResourceThreshold(resource as keyof ResourceMetrics);

      // Detect high usage
      if (latest > threshold) {
        patterns.push({
          type: 'high-usage',
          resource: resource as 'memory' | 'cpu' | 'connections',
          timestamp: new Date().toISOString(),
          value: latest,
          threshold,
          description: `High ${resource} usage detected (${latest}% vs threshold ${threshold}%)`
        });
      }

      // Detect trends
      const trendSlope = this.calculateTrendSlope(values);
      if (Math.abs(trendSlope) > 0.05) { // 5% change rate
        patterns.push({
          type: trendSlope > 0 ? 'trend-up' : 'trend-down',
          resource: resource as 'memory' | 'cpu' | 'connections',
          timestamp: new Date().toISOString(),
          value: trendSlope,
          threshold: 0.05,
          description: `${resource} usage showing ${trendSlope > 0 ? 'increasing' : 'decreasing'} trend (${(Math.abs(trendSlope) * 100).toFixed(1)}% rate)`
        });
      }
    });

    return patterns;
  }

  private generateRecommendations() {
    this.recommendations = [];

    // Analyze patterns for recommendations
    const criticalPatterns = this.patterns.filter(p => 
      (p.type === 'spike' || p.type === 'high-usage') && 
      p.value > p.threshold * 1.5
    );

    const degradationPatterns = this.patterns.filter(p => 
      p.type === 'degradation' || p.type === 'trend-up'
    );

    // Generate recommendations based on patterns
    if (criticalPatterns.length > 0) {
      this.recommendations.push({
        type: 'performance',
        priority: 'high',
        description: 'Critical performance issues detected',
        impact: 'Immediate user experience degradation',
        action: 'Investigate and address performance bottlenecks'
      });
    }

    if (degradationPatterns.length > 0) {
      this.recommendations.push({
        type: 'resource',
        priority: 'medium',
        description: 'Resource usage trending upward',
        impact: 'Potential system stability issues',
        action: 'Plan for resource optimization or scaling'
      });
    }

    // Add general recommendations based on metrics
    const avgResponseTime = this.calculateAverageResponseTime();
    if (avgResponseTime > this.RESPONSE_TIME_THRESHOLD) {
      this.recommendations.push({
        type: 'performance',
        priority: 'medium',
        description: 'Response times consistently above threshold',
        impact: 'Degraded user experience',
        action: 'Implement caching or optimize database queries'
      });
    }
  }

  private calculateTrendSlope(values: number[]): number {
    if (values.length < 2) return 0;
    
    const xMean = (values.length - 1) / 2;
    const yMean = values.reduce((a, b) => a + b, 0) / values.length;
    
    let numerator = 0;
    let denominator = 0;
    
    values.forEach((y, x) => {
      numerator += (x - xMean) * (y - yMean);
      denominator += Math.pow(x - xMean, 2);
    });
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  private calculateAverageResponseTime(): number {
    if (this.responseTimeHistory.length === 0) return 0;
    return this.responseTimeHistory.reduce((sum, data) => sum + data.value, 0) / 
           this.responseTimeHistory.length;
  }

  private getResourceThreshold(resource: keyof ResourceMetrics): number {
    switch (resource) {
      case 'memory': return this.MEMORY_THRESHOLD;
      case 'cpu': return this.CPU_THRESHOLD;
      case 'connections': return this.CONNECTIONS_THRESHOLD;
      default: return 80; // Default threshold
    }
  }

  getPatterns() {
    return this.patterns;
  }

  getRecommendations() {
    return this.recommendations;
  }

  getAnalytics() {
    return {
      patterns: this.patterns,
      recommendations: this.recommendations,
      statistics: {
        responseTime: {
          average: this.calculateAverageResponseTime(),
          samples: this.responseTimeHistory.length
        },
        resources: {
          memory: this.calculateResourceStats('memory'),
          cpu: this.calculateResourceStats('cpu'),
          connections: this.calculateResourceStats('connections')
        }
      }
    };
  }

  private calculateResourceStats(resource: keyof ResourceMetrics) {
    if (this.resourceHistory.length === 0) {
      return { average: 0, max: 0, current: 0 };
    }

    const values = this.resourceHistory.map(d => d[resource] as number);
    return {
      average: values.reduce((a, b) => a + b, 0) / values.length,
      max: Math.max(...values),
      current: values[values.length - 1]
    };
  }
}

export const analyticsService = new AnalyticsService();

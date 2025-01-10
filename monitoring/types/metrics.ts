export interface MetricData {
  timestamp: string;
  value: number;
}

export interface ResourceMetrics {
  timestamp: string;
  memory: number;
  cpu: number;
  connections: number;
}

export interface PerformanceData {
  operation: string;
  mean: number;
  p95: number;
  p99: number;
}

export interface PerformancePattern {
  type: 'spike' | 'degradation' | 'improvement' | 'anomaly';
  metric: string;
  timestamp: string;
  value: number;
  threshold: number;
  description: string;
}

export interface ResourcePattern {
  type: 'high-usage' | 'trend-up' | 'trend-down' | 'fluctuation';
  resource: 'memory' | 'cpu' | 'connections';
  timestamp: string;
  value: number;
  threshold: number;
  description: string;
}

export interface OptimizationRecommendation {
  type: 'performance' | 'resource' | 'scaling';
  priority: 'high' | 'medium' | 'low';
  description: string;
  impact: string;
  action: string;
}

export interface AnalyticsData {
  patterns: (PerformancePattern | ResourcePattern)[];
  recommendations: OptimizationRecommendation[];
  statistics: {
    responseTime: {
      average: number;
      samples: number;
    };
    resources: {
      memory: { average: number; max: number; current: number };
      cpu: { average: number; max: number; current: number };
      connections: { average: number; max: number; current: number };
    };
  };
}

export interface MetricMessage {
  type: 'responseTime' | 'resources' | 'performance' | 'alert' | 'analytics';
  timestamp: string;
  data: MetricData | ResourceMetrics | PerformanceData | AnalyticsData;
  message?: string;
}

export interface AlertMessage {
  type: 'alert';
  timestamp: string;
  message: string;
  severity: 'warning' | 'critical';
}

export interface DashboardState {
  responseTimeData: MetricData[];
  resourceData: ResourceMetrics[];
  performanceData: PerformanceData[];
  alerts: string[];
}

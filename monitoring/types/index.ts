import { Server } from 'http';
import { EventEmitter } from 'events';

// Server Types
export interface MonitoringServer extends Server {
  registerRoutes: (services: MonitoringServices) => void;
  performHealthCheck: () => Promise<HealthCheckResult>;
}

export interface MonitoringServices {
  metricsCollector: IMetricsCollector;
  alertManager: IAlertManager;
  resourceManager: IResourceManager;
  cacheManager: ICacheManager;
  loadBalancer: ILoadBalancer;
}

// Metrics Types
export interface MetricsCollectorConfig {
  collectionInterval: number;
  retentionDays: number;
  aggregationInterval: number;
}

export interface Metric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

export interface IMetricsCollector extends EventEmitter {
  start(): Promise<void>;
  stop(): Promise<void>;
  collect(metric: Metric): void;
}

// Alert Types
export interface AlertManagerConfig {
  checkInterval: number;
  notifiers: AlertNotifier[];
}

export interface Alert {
  id: string;
  type: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface AlertNotifier {
  send(alert: Alert): Promise<void>;
}

export interface IAlertManager extends EventEmitter {
  checkThresholds(metric: Metric): void;
  handleResourceAlert(resource: ResourceAlert): void;
}

// Resource Types
export interface ResourceManagerConfig {
  memoryThreshold: number;
  cpuThreshold: number;
  diskThreshold: number;
}

export interface ResourceAlert {
  type: 'memory' | 'cpu' | 'disk';
  current: number;
  threshold: number;
  timestamp: number;
}

export interface IResourceManager extends EventEmitter {
  start(): Promise<void>;
  stop(): Promise<void>;
}

// Cache Types
export interface CacheManagerConfig {
  maxSize: string;
  ttl: number;
  cleanupInterval: number;
}

export interface ICacheManager {
  start(): Promise<void>;
  stop(): Promise<void>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  get(key: string): Promise<any>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

// Load Balancer Types
export interface LoadBalancerConfig {
  strategy: 'round-robin' | 'least-connections' | 'weighted';
  healthCheckInterval: number;
}

export interface ILoadBalancer {
  start(): Promise<void>;
  stop(): Promise<void>;
  addTarget(target: string, weight?: number): void;
  removeTarget(target: string): void;
  getNextTarget(): string;
}

// WebSocket Types
export interface WebSocketServerConfig {
  port: number;
  path: string;
}

export interface IWebSocketServer extends EventEmitter {
  broadcast(event: string, data: any): void;
  getConnections(): number;
  close(): Promise<void>;
}

// Health Check Types
export interface HealthCheckResult {
  success: boolean;
  error?: string;
  components?: {
    [key: string]: {
      status: 'healthy' | 'unhealthy';
      message?: string;
    };
  };
}

// Factory Functions
export type ServerFactory = () => Promise<MonitoringServer>;
export type NotifierFactory = () => Promise<AlertNotifier[]>;

// Re-export all monitoring types
export * from './metrics';
export * from './alerts';
export * from './resources';
export * from './cache';
export * from './loadbalancer';
export * from './websocket';

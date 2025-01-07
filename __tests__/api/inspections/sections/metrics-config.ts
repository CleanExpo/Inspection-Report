export interface MetricsConfig {
  performance: {
    responseTimeThreshold: number;
    maxSampleSize: number;
    degradationThreshold: number;
  };
  resources: {
    memoryThreshold: number;
    cpuThreshold: number;
    connectionThreshold: number;
    memory: {
      warning: number;
      critical: number;
    };
    cpu: {
      warning: number;
      critical: number;
    };
    connections: {
      warning: number;
      critical: number;
    };
  };
  load: {
    baselineConcurrency: number;
    maxConcurrency: number;
    rampUpSteps: number;
    sustainedDuration: number;
    rampUpDuration: number;
  };
  alerts: {
    consecutiveFailures: number;
    warningInterval: number;
  };
}

export const metricsConfig: MetricsConfig = {
  performance: {
    responseTimeThreshold: 500, // ms
    maxSampleSize: 1000,
    degradationThreshold: 0.2 // 20% degradation
  },
  resources: {
    memoryThreshold: 80, // %
    cpuThreshold: 70, // %
    connectionThreshold: 1000,
    memory: {
      warning: 70,
      critical: 85
    },
    cpu: {
      warning: 60,
      critical: 80
    },
    connections: {
      warning: 800,
      critical: 1000
    }
  },
  load: {
    baselineConcurrency: 10,
    maxConcurrency: 100,
    rampUpSteps: 5,
    sustainedDuration: 300000, // 5 minutes
    rampUpDuration: 60000 // 1 minute
  },
  alerts: {
    consecutiveFailures: 3,
    warningInterval: 300000 // 5 minutes
  }
};

export function analyzePerformance(results: any[]): { violations: string[]; warnings: string[] } {
  const violations: string[] = [];
  const warnings: string[] = [];

  // Analyze response times
  const responseTimes = results.map(r => r.responseTime || 0);
  const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

  if (avgResponseTime > metricsConfig.performance.responseTimeThreshold) {
    violations.push(`Average response time (${avgResponseTime.toFixed(2)}ms) exceeds threshold (${metricsConfig.performance.responseTimeThreshold}ms)`);
  }

  // Check for performance degradation
  if (results.length > 1) {
    const firstHalf = results.slice(0, Math.floor(results.length / 2));
    const secondHalf = results.slice(Math.floor(results.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + (b.responseTime || 0), 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + (b.responseTime || 0), 0) / secondHalf.length;

    const degradation = (secondAvg - firstAvg) / firstAvg;
    if (degradation > metricsConfig.performance.degradationThreshold) {
      warnings.push(`Performance degradation detected: ${(degradation * 100).toFixed(1)}% increase in response time`);
    }
  }

  return { violations, warnings };
}

export function checkResourceUtilization(
  metrics: { memory: number; cpu: number; connections: number }
): { status: 'healthy' | 'warning' | 'critical'; issues: string[] } {
  const issues: string[] = [];
  let status: 'healthy' | 'warning' | 'critical' = 'healthy';

  // Check memory usage
  if (metrics.memory >= metricsConfig.resources.memory.critical) {
    issues.push(`Memory usage critical: ${metrics.memory}%`);
    status = 'critical';
  } else if (metrics.memory >= metricsConfig.resources.memory.warning) {
    issues.push(`Memory usage high: ${metrics.memory}%`);
    status = 'warning';
  }

  // Check CPU usage
  if (metrics.cpu >= metricsConfig.resources.cpu.critical) {
    issues.push(`CPU usage critical: ${metrics.cpu}%`);
    status = 'critical';
  } else if (metrics.cpu >= metricsConfig.resources.cpu.warning) {
    issues.push(`CPU usage high: ${metrics.cpu}%`);
    status = status === 'critical' ? 'critical' : 'warning';
  }

  // Check connection count
  if (metrics.connections >= metricsConfig.resources.connections.critical) {
    issues.push(`Connection count critical: ${metrics.connections}`);
    status = 'critical';
  } else if (metrics.connections >= metricsConfig.resources.connections.warning) {
    issues.push(`Connection count high: ${metrics.connections}`);
    status = status === 'critical' ? 'critical' : 'warning';
  }

  return { status, issues };
}

export function calculateLoadParameters(currentLoad: number) {
  const maxLoad = Math.min(
    currentLoad * 2,
    metricsConfig.load.maxConcurrency
  );

  const step = Math.floor((maxLoad - currentLoad) / metricsConfig.load.rampUpSteps);
  const stepDuration = Math.floor(metricsConfig.load.rampUpDuration / metricsConfig.load.rampUpSteps);

  return {
    concurrency: currentLoad,
    maxConcurrency: maxLoad,
    duration: metricsConfig.load.sustainedDuration,
    rampUp: {
      steps: metricsConfig.load.rampUpSteps,
      stepDuration,
      increment: step
    }
  };
}

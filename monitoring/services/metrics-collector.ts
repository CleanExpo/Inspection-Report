interface MetricStats {
  current?: number;
  mean?: number;
  p95?: number;
  max?: number;
}

interface Stats {
  cpu?: MetricStats;
  memory?: MetricStats;
  connections?: MetricStats;
  responseTime?: MetricStats;
  test?: number;
  [key: string]: MetricStats | number | undefined;
}

class MetricsCollector {
  private metrics: Map<string, number[]> = new Map();

  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)?.push(value);
  }

  getCurrentStats(): Stats {
    const stats: Stats = {};
    
    for (const [name, values] of Array.from(this.metrics.entries())) {
      if (values.length === 0) continue;

      if (name === 'test') {
        stats[name] = values[values.length - 1];
        continue;
      }

      const sorted = [...values].sort((a, b) => a - b);
      const p95Index = Math.floor(values.length * 0.95);

      stats[name] = {
        current: values[values.length - 1],
        mean: values.reduce((a: number, b: number) => a + b, 0) / values.length,
        p95: sorted[p95Index],
        max: Math.max(...values)
      };
    }

    return stats;
  }

  clearMetrics(): void {
    this.metrics.clear();
  }
}

export const metricsCollector = new MetricsCollector();

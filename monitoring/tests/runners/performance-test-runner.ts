import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import * as path from 'path';
import { performance } from 'perf_hooks';

interface TestConfig {
  name: string;
  duration: number;        // Test duration in seconds
  rampUpTime: number;      // Time to ramp up to full load in seconds
  targetRPS: number;       // Target requests per second
  endpoints: string[];     // List of endpoints to test
  thresholds: {
    responseTime: number;  // Max acceptable response time in ms
    errorRate: number;     // Max acceptable error rate (0-1)
    p95: number;          // 95th percentile response time threshold
  };
}

interface TestResult {
  timestamp: string;
  testName: string;
  duration: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  responseTime: {
    min: number;
    max: number;
    mean: number;
    p95: number;
  };
  errorRate: number;
  rps: number;
  resourceUsage: {
    cpu: number[];
    memory: number[];
  };
}

class PerformanceTestRunner extends EventEmitter {
  protected config: TestConfig;
  protected results: {
    responseTimes: number[];
    errors: number;
    requests: number;
    cpuUsage: number[];
    memoryUsage: number[];
  };
  protected startTime: number;
  protected running: boolean;
  protected resourceMonitorInterval: NodeJS.Timeout | null;

  constructor(config: TestConfig) {
    super();
    this.config = config;
    this.results = {
      responseTimes: [],
      errors: 0,
      requests: 0,
      cpuUsage: [],
      memoryUsage: []
    };
    this.startTime = 0;
    this.running = false;
    this.resourceMonitorInterval = null;
  }

  async run(): Promise<TestResult> {
    try {
      this.startTime = performance.now();
      this.running = true;
      this.startResourceMonitoring();

      // Run the test
      await Promise.all([
        this.generateLoad(),
        this.monitorProgress()
      ]);

      // Stop resource monitoring
      this.stopResourceMonitoring();

      // Calculate and return results
      return this.calculateResults();
    } catch (error) {
      this.running = false;
      this.stopResourceMonitoring();
      throw error;
    }
  }

  protected async generateLoad(): Promise<void> {
    const startTime = performance.now();
    const requests: Promise<void>[] = [];

    while (this.running && performance.now() - startTime < this.config.duration * 1000) {
      const currentTime = performance.now() - startTime;
      const targetRequests = this.calculateTargetRequests(currentTime);

      // Generate requests to meet target RPS
      while (requests.length < targetRequests) {
        requests.push(this.makeRequest());
      }

      // Remove completed requests
      const activeRequests = requests.filter(r => r.valueOf() !== undefined);
      requests.length = 0;
      requests.push(...activeRequests);

      // Wait for next interval
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Wait for remaining requests to complete
    await Promise.all(requests);
  }

  protected calculateTargetRequests(currentTime: number): number {
    const rampUpProgress = Math.min(currentTime / (this.config.rampUpTime * 1000), 1);
    const targetRPS = this.config.targetRPS * rampUpProgress;
    return Math.floor(targetRPS * (currentTime / 1000));
  }

  protected async makeRequest(): Promise<void> {
    const endpoint = this.getRandomEndpoint();
    const startTime = performance.now();

    try {
      const response = await fetch(endpoint);
      const endTime = performance.now();

      this.results.responseTimes.push(endTime - startTime);
      this.results.requests++;

      if (!response.ok) {
        this.results.errors++;
      }

      this.emit('request', {
        endpoint,
        duration: endTime - startTime,
        status: response.status
      });
    } catch (error) {
      this.results.errors++;
      this.results.requests++;
      this.emit('error', { endpoint, error });
    }
  }

  protected getRandomEndpoint(): string {
    return this.config.endpoints[
      Math.floor(Math.random() * this.config.endpoints.length)
    ];
  }

  protected async monitorProgress(): Promise<void> {
    while (this.running) {
      const elapsedTime = (performance.now() - this.startTime) / 1000;
      const progress = (elapsedTime / this.config.duration) * 100;

      this.emit('progress', {
        progress: Math.min(progress, 100),
        currentRPS: this.results.requests / elapsedTime,
        errorRate: this.results.errors / this.results.requests,
        meanResponseTime: this.calculateMean(this.results.responseTimes)
      });

      if (elapsedTime >= this.config.duration) {
        this.running = false;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  protected startResourceMonitoring(): void {
    this.resourceMonitorInterval = setInterval(() => {
      const usage = process.cpuUsage();
      const memory = process.memoryUsage();

      this.results.cpuUsage.push(
        (usage.user + usage.system) / 1000000
      );
      this.results.memoryUsage.push(
        memory.heapUsed / 1024 / 1024
      );
    }, 1000);
  }

  protected stopResourceMonitoring(): void {
    if (this.resourceMonitorInterval) {
      clearInterval(this.resourceMonitorInterval);
      this.resourceMonitorInterval = null;
    }
  }

  protected calculateResults(): TestResult {
    const sortedResponseTimes = [...this.results.responseTimes].sort((a, b) => a - b);
    const p95Index = Math.floor(sortedResponseTimes.length * 0.95);

    return {
      timestamp: new Date().toISOString(),
      testName: this.config.name,
      duration: this.config.duration,
      totalRequests: this.results.requests,
      successfulRequests: this.results.requests - this.results.errors,
      failedRequests: this.results.errors,
      responseTime: {
        min: Math.min(...this.results.responseTimes),
        max: Math.max(...this.results.responseTimes),
        mean: this.calculateMean(this.results.responseTimes),
        p95: sortedResponseTimes[p95Index]
      },
      errorRate: this.results.errors / this.results.requests,
      rps: this.results.requests / this.config.duration,
      resourceUsage: {
        cpu: this.results.cpuUsage,
        memory: this.results.memoryUsage
      }
    };
  }

  protected calculateMean(values: number[]): number {
    return values.reduce((a: number, b: number) => a + b, 0) / values.length;
  }

  async saveResults(result: TestResult): Promise<void> {
    const outputDir = path.join(process.cwd(), 'test-output');
    await fs.mkdir(outputDir, { recursive: true });

    const outputPath = path.join(
      outputDir,
      `perf-test-${result.testName}-${Date.now()}.json`
    );

    await fs.writeFile(outputPath, JSON.stringify(result, null, 2));
  }
}

export { PerformanceTestRunner };
export type { TestConfig, TestResult };

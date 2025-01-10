import { PerformanceTestRunner, TestConfig, TestResult } from './performance-test-runner';

interface LoadTestConfig extends TestConfig {
  // Additional load test specific configurations
  scenarios: {
    name: string;
    weight: number;  // Percentage of total requests (0-100)
    endpoint: string;
  }[];
  concurrentUsers: number;
  thinkTime: {
    min: number;  // Minimum time between requests in ms
    max: number;  // Maximum time between requests in ms
  };
}

interface LoadTestResult extends TestResult {
  scenarioResults: {
    [key: string]: {
      requests: number;
      errors: number;
      averageResponseTime: number;
    };
  };
  userMetrics: {
    concurrent: number;
    peak: number;
    average: number;
  };
}

class LoadTestRunner extends PerformanceTestRunner {
  private loadConfig: LoadTestConfig;
  private scenarioStats: Map<string, {
    requests: number;
    errors: number;
    responseTimes: number[];
  }>;
  private activeUsers: number;
  private peakUsers: number;
  private userSamples: number[];

  constructor(config: LoadTestConfig) {
    // Convert load test config to base test config
    const baseConfig: TestConfig = {
      name: config.name,
      duration: config.duration,
      rampUpTime: config.rampUpTime,
      targetRPS: config.targetRPS,
      endpoints: config.scenarios.map(s => s.endpoint),
      thresholds: config.thresholds
    };

    super(baseConfig);
    this.loadConfig = config;
    this.scenarioStats = new Map();
    this.activeUsers = 0;
    this.peakUsers = 0;
    this.userSamples = [];

    // Initialize scenario stats
    config.scenarios.forEach(scenario => {
      this.scenarioStats.set(scenario.name, {
        requests: 0,
        errors: 0,
        responseTimes: []
      });
    });

    // Add user tracking events
    this.on('request', this.trackRequest.bind(this));
    this.on('error', this.trackError.bind(this));
  }

  protected override async generateLoad(): Promise<void> {
    const userSessions: Promise<void>[] = [];
    const startTime = Date.now();

    // Start user sessions based on concurrent users target
    while (Date.now() - startTime < this.loadConfig.duration * 1000) {
      while (this.activeUsers < this.loadConfig.concurrentUsers) {
        userSessions.push(this.runUserSession());
        this.activeUsers++;
        this.peakUsers = Math.max(this.peakUsers, this.activeUsers);
      }

      // Sample active users for metrics
      this.userSamples.push(this.activeUsers);

      // Wait before checking again
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Wait for all sessions to complete
    await Promise.all(userSessions);
  }

  private async runUserSession(): Promise<void> {
    try {
      while (this.isRunning()) {
        // Select scenario based on weights
        const scenario = this.selectScenario();
        
        // Execute request
        await this.executeScenario(scenario);

        // Think time between requests
        await this.think();
      }
    } finally {
      this.activeUsers--;
    }
  }

  private selectScenario() {
    const random = Math.random() * 100;
    let cumulativeWeight = 0;

    for (const scenario of this.loadConfig.scenarios) {
      cumulativeWeight += scenario.weight;
      if (random <= cumulativeWeight) {
        return scenario;
      }
    }

    // Fallback to first scenario
    return this.loadConfig.scenarios[0];
  }

  private async executeScenario(scenario: LoadTestConfig['scenarios'][0]): Promise<void> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(scenario.endpoint);
      const duration = Date.now() - startTime;

      const stats = this.scenarioStats.get(scenario.name)!;
      stats.requests++;
      stats.responseTimes.push(duration);

      if (!response.ok) {
        stats.errors++;
      }

      this.emit('request', {
        scenario: scenario.name,
        duration,
        status: response.status
      });
    } catch (error) {
      const stats = this.scenarioStats.get(scenario.name)!;
      stats.errors++;
      stats.requests++;

      this.emit('error', {
        scenario: scenario.name,
        error
      });
    }
  }

  private async think(): Promise<void> {
    const { min, max } = this.loadConfig.thinkTime;
    const thinkTime = Math.random() * (max - min) + min;
    await new Promise(resolve => setTimeout(resolve, thinkTime));
  }

  private trackRequest(data: { scenario: string; duration: number }): void {
    const stats = this.scenarioStats.get(data.scenario);
    if (stats) {
      stats.requests++;
      stats.responseTimes.push(data.duration);
    }
  }

  private trackError(data: { scenario: string }): void {
    const stats = this.scenarioStats.get(data.scenario);
    if (stats) {
      stats.errors++;
    }
  }

  protected override calculateResults(): LoadTestResult {
    const baseResults = super.calculateResults() as LoadTestResult;

    // Add scenario-specific results
    baseResults.scenarioResults = {};
    for (const [name, stats] of Array.from(this.scenarioStats.entries())) {
      baseResults.scenarioResults[name] = {
        requests: stats.requests,
        errors: stats.errors,
        averageResponseTime: stats.responseTimes.reduce((a: number, b: number) => a + b, 0) / stats.responseTimes.length
      };
    }

    // Add user metrics
    baseResults.userMetrics = {
      concurrent: this.activeUsers,
      peak: this.peakUsers,
      average: this.userSamples.reduce((a: number, b: number) => a + b, 0) / this.userSamples.length
    };

    return baseResults;
  }

  private isRunning(): boolean {
    return Date.now() - this.startTime < this.loadConfig.duration * 1000;
  }
}

export { LoadTestRunner };
export type { LoadTestConfig, LoadTestResult };

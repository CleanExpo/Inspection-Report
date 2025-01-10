import { PerformanceTestRunner, TestConfig, TestResult } from './performance-test-runner';

interface StressTestConfig extends TestConfig {
  maxLoad: number;           // Maximum RPS to reach
  loadIncrementStep: number; // RPS increase per step
  stepDuration: number;      // Duration of each step in seconds
  failureThreshold: number;  // Error rate that triggers test termination
  resourceLimits: {
    cpu: number;            // Max CPU usage percentage
    memory: number;         // Max memory usage in MB
    responseTime: number;   // Max acceptable response time in ms
  };
}

interface StressTestResult extends TestResult {
  breakingPoint: {
    rps: number;
    errorRate: number;
    responseTime: number;
    cpuUsage: number;
    memoryUsage: number;
  };
  loadSteps: {
    targetRPS: number;
    actualRPS: number;
    errorRate: number;
    avgResponseTime: number;
    p95ResponseTime: number;
    cpuUsage: number;
    memoryUsage: number;
  }[];
  systemLimits: {
    maxSustainableRPS: number;
    cpuSaturationPoint: number;
    memorySaturationPoint: number;
    networkSaturationPoint: number;
  };
}

class StressTestRunner extends PerformanceTestRunner {
  private stressConfig: StressTestConfig;
  private loadSteps: StressTestResult['loadSteps'];
  private breakingPoint: StressTestResult['breakingPoint'] | null;
  private systemLimits: StressTestResult['systemLimits'];
  private currentStep: number;

  constructor(config: StressTestConfig) {
    // Convert stress test config to base test config
    const baseConfig: TestConfig = {
      name: config.name,
      duration: config.stepDuration * Math.ceil((config.maxLoad - config.targetRPS) / config.loadIncrementStep),
      rampUpTime: config.stepDuration / 2, // Half step duration for ramp-up
      targetRPS: config.targetRPS,
      endpoints: config.endpoints,
      thresholds: config.thresholds
    };

    super(baseConfig);
    this.stressConfig = config;
    this.loadSteps = [];
    this.breakingPoint = null;
    this.systemLimits = {
      maxSustainableRPS: 0,
      cpuSaturationPoint: 0,
      memorySaturationPoint: 0,
      networkSaturationPoint: 0
    };
    this.currentStep = 0;

    // Add stress test specific event listeners
    this.on('stepComplete', this.analyzeStep.bind(this));
  }

  protected override async generateLoad(): Promise<void> {
    let currentRPS = this.stressConfig.targetRPS;

    while (
      currentRPS <= this.stressConfig.maxLoad && 
      !this.breakingPoint &&
      this.running
    ) {
      // Update target RPS for this step
      this.config.targetRPS = currentRPS;

      // Run load for this step
      const stepStart = Date.now();
      const stepResults = await this.runLoadStep();

      // Analyze step results
      this.analyzeStep(stepResults);

      // Check if we've hit a breaking point
      if (this.hasReachedBreakingPoint(stepResults)) {
        this.recordBreakingPoint(stepResults);
        break;
      }

      // Increment load for next step
      currentRPS += this.stressConfig.loadIncrementStep;
      this.currentStep++;

      // Wait for the full step duration
      const stepDuration = Date.now() - stepStart;
      if (stepDuration < this.stressConfig.stepDuration * 1000) {
        await new Promise(resolve => 
          setTimeout(resolve, this.stressConfig.stepDuration * 1000 - stepDuration)
        );
      }
    }
  }

  private async runLoadStep(): Promise<{
    targetRPS: number;
    actualRPS: number;
    errorRate: number;
    avgResponseTime: number;
    p95ResponseTime: number;
    cpuUsage: number;
    memoryUsage: number;
  }> {
    const stepStart = Date.now();
    const requests: Promise<void>[] = [];
    const stepResults = {
      responseTimes: [] as number[],
      errors: 0,
      requests: 0
    };

    // Generate load for this step
    while (Date.now() - stepStart < this.stressConfig.stepDuration * 1000) {
      const targetRequests = Math.floor(
        this.config.targetRPS * ((Date.now() - stepStart) / 1000)
      );

      while (requests.length < targetRequests) {
        requests.push(this.makeRequest());
      }

      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Wait for remaining requests to complete
    await Promise.all(requests);

    // Calculate step metrics
    const sortedResponseTimes = [...this.results.responseTimes].sort((a, b) => a - b);
    const p95Index = Math.floor(sortedResponseTimes.length * 0.95);

    return {
      targetRPS: this.config.targetRPS,
      actualRPS: this.results.requests / (this.stressConfig.stepDuration),
      errorRate: this.results.errors / this.results.requests,
      avgResponseTime: this.calculateMean(this.results.responseTimes),
      p95ResponseTime: sortedResponseTimes[p95Index],
      cpuUsage: this.calculateMean(this.results.cpuUsage),
      memoryUsage: this.calculateMean(this.results.memoryUsage)
    };
  }

  private analyzeStep(stepResults: StressTestResult['loadSteps'][0]): void {
    // Record step results
    this.loadSteps.push(stepResults);

    // Update system limits
    if (
      stepResults.errorRate <= this.stressConfig.failureThreshold &&
      stepResults.avgResponseTime <= this.stressConfig.resourceLimits.responseTime
    ) {
      this.systemLimits.maxSustainableRPS = Math.max(
        this.systemLimits.maxSustainableRPS,
        stepResults.actualRPS
      );
    }

    if (stepResults.cpuUsage >= this.stressConfig.resourceLimits.cpu && !this.systemLimits.cpuSaturationPoint) {
      this.systemLimits.cpuSaturationPoint = stepResults.targetRPS;
    }

    if (stepResults.memoryUsage >= this.stressConfig.resourceLimits.memory && !this.systemLimits.memorySaturationPoint) {
      this.systemLimits.memorySaturationPoint = stepResults.targetRPS;
    }

    // Emit step completion event
    this.emit('stepComplete', stepResults);
  }

  private hasReachedBreakingPoint(results: StressTestResult['loadSteps'][0]): boolean {
    return (
      results.errorRate > this.stressConfig.failureThreshold ||
      results.cpuUsage > this.stressConfig.resourceLimits.cpu ||
      results.memoryUsage > this.stressConfig.resourceLimits.memory ||
      results.avgResponseTime > this.stressConfig.resourceLimits.responseTime
    );
  }

  private recordBreakingPoint(results: StressTestResult['loadSteps'][0]): void {
    this.breakingPoint = {
      rps: results.actualRPS,
      errorRate: results.errorRate,
      responseTime: results.avgResponseTime,
      cpuUsage: results.cpuUsage,
      memoryUsage: results.memoryUsage
    };
  }

  protected override calculateResults(): StressTestResult {
    const baseResults = super.calculateResults() as StressTestResult;

    return {
      ...baseResults,
      breakingPoint: this.breakingPoint || {
        rps: this.stressConfig.maxLoad,
        errorRate: this.results.errors / this.results.requests,
        responseTime: this.calculateMean(this.results.responseTimes),
        cpuUsage: this.calculateMean(this.results.cpuUsage),
        memoryUsage: this.calculateMean(this.results.memoryUsage)
      },
      loadSteps: this.loadSteps,
      systemLimits: this.systemLimits
    };
  }
}

export { StressTestRunner };
export type { StressTestConfig, StressTestResult };

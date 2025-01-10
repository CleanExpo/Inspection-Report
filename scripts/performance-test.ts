import { performance } from 'perf_hooks';
import { measurePerformance, trackMemoryUsage, trackErrors } from '../utils/performance';

interface TestScenario {
  name: string;
  concurrent: number;
  duration: number;
  endpoint: string;
}

const scenarios: TestScenario[] = [
  {
    name: 'Light Load',
    concurrent: 10,
    duration: 60,
    endpoint: '/api/moisture'
  },
  {
    name: 'Medium Load',
    concurrent: 50,
    duration: 120,
    endpoint: '/api/moisture'
  },
  {
    name: 'Heavy Load',
    concurrent: 100,
    duration: 180,
    endpoint: '/api/moisture'
  }
];

interface TestResult {
  scenario: string;
  averageResponseTime: number;
  maxResponseTime: number;
  requestsPerSecond: number;
  errorRate: number;
  memoryUsage: any;
}

async function runLoadTest(scenario: TestScenario): Promise<TestResult> {
  console.log(`Starting ${scenario.name} test...`);
  const startTime = performance.now();
  const results: number[] = [];
  const errors: Error[] = [];

  try {
    // Create concurrent requests
    const requests = Array(scenario.concurrent).fill(0).map(async () => {
      const requestStart = performance.now();
      try {
        const response = await fetch(scenario.endpoint);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        results.push(performance.now() - requestStart);
      } catch (error) {
        errors.push(error as Error);
        trackErrors(error as Error);
      }
    });

    await Promise.all(requests);

    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const memory = trackMemoryUsage();

    return {
      scenario: scenario.name,
      averageResponseTime: results.reduce((a, b) => a + b, 0) / results.length,
      maxResponseTime: Math.max(...results),
      requestsPerSecond: (results.length / totalTime) * 1000,
      errorRate: errors.length / scenario.concurrent,
      memoryUsage: memory
    };
  } catch (error) {
    console.error(`Error in ${scenario.name} test:`, error);
    throw error;
  }
}

async function runStressTest(): Promise<void> {
  console.log('Starting stress test...');
  let concurrent = 10;
  const results: TestResult[] = [];

  while (true) {
    const scenario: TestScenario = {
      name: `Stress Test (${concurrent} users)`,
      concurrent,
      duration: 30,
      endpoint: '/api/moisture'
    };

    const result = await runLoadTest(scenario);
    results.push(result);

    // Check if system is stressed
    if (result.errorRate > 0.1 || result.averageResponseTime > 1000) {
      console.log(`System reached stress point at ${concurrent} concurrent users`);
      break;
    }

    concurrent *= 2;
  }

  console.log('Stress test results:', results);
}

async function runResourceUtilizationTest(): Promise<void> {
  console.log('Starting resource utilization test...');
  const startMemory = trackMemoryUsage();
  const operations = [
    'GET /api/moisture',
    'POST /api/moisture',
    'GET /api/equipment',
    'POST /api/equipment'
  ];

  for (const operation of operations) {
    measurePerformance(operation, async () => {
      // Simulate operation
      await new Promise(resolve => setTimeout(resolve, 100));
    });
  }

  const endMemory = trackMemoryUsage();
  console.log('Memory usage:', {
    start: startMemory,
    end: endMemory
  });
}

async function runPerformanceTests() {
  try {
    console.log('Starting performance tests...');

    // Run load tests
    for (const scenario of scenarios) {
      const result = await runLoadTest(scenario);
      console.log(`${scenario.name} test results:`, result);
    }

    // Run stress test
    await runStressTest();

    // Run resource utilization test
    await runResourceUtilizationTest();

    console.log('All performance tests completed successfully');
  } catch (error) {
    console.error('Performance tests failed:', error);
    process.exit(1);
  }
}

// Run all tests
runPerformanceTests();

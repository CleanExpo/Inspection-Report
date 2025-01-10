import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import path from 'path';

interface TestResult {
  scenario: string;
  timestamp: string;
  metrics: {
    http_req_duration: {
      p95: number;
      p99: number;
      avg: number;
      med: number;
    };
    iterations: number;
    vus: number;
    errors: number;
    checks: {
      passes: number;
      fails: number;
    };
  };
  thresholds: {
    passed: boolean;
    details: {
      metric: string;
      threshold: string;
      passed: boolean;
    }[];
  };
}

const scenarios = [
  { name: 'jobs', file: 'scenarios/jobs.test.ts' },
  { name: 'moisture', file: 'scenarios/moisture.test.ts' }
];

const resultsDir = path.join(__dirname, '..', 'results');

// Ensure results directory exists
if (!existsSync(resultsDir)) {
  mkdirSync(resultsDir, { recursive: true });
}

function runTest(scenario: string, file: string): TestResult {
  console.log(`\nRunning ${scenario} load test...`);
  
  try {
    // Run k6 test and capture output
    const output = execSync(`k6 run --out json=${resultsDir}/${scenario}-result.json ${path.join(__dirname, '..', file)}`, {
      stdio: ['inherit', 'pipe', 'inherit']
    }).toString();

    // Parse results
    // Read the result file since k6 outputs to stderr
    const resultPath = path.join(resultsDir, `${scenario}-result.json`);
    const result = JSON.parse(readFileSync(resultPath, 'utf8'));
    
    // Format test result
    const testResult: TestResult = {
      scenario,
      timestamp: new Date().toISOString(),
      metrics: {
        http_req_duration: {
          p95: result.metrics.http_req_duration.values['p(95)'],
          p99: result.metrics.http_req_duration.values['p(99)'],
          avg: result.metrics.http_req_duration.values.avg,
          med: result.metrics.http_req_duration.values.med
        },
        iterations: result.metrics.iterations.values.count,
        vus: result.metrics.vus.values.max,
        errors: result.metrics.errors?.values.count || 0,
        checks: {
          passes: result.metrics.checks.values.passes,
          fails: result.metrics.checks.values.fails
        }
      },
      thresholds: {
        passed: result.thresholds_passed,
        details: Object.entries(result.thresholds).map(([metric, data]: [string, any]) => ({
          metric,
          threshold: data.threshold,
          passed: data.passed
        }))
      }
    };

    // Save detailed result
    writeFileSync(
      path.join(resultsDir, `${scenario}-summary-${Date.now()}.json`),
      JSON.stringify(testResult, null, 2)
    );

    return testResult;

  } catch (error) {
    console.error(`Error running ${scenario} test:`, error);
    process.exit(1);
  }
}

function generateReport(results: TestResult[]): void {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalScenarios: results.length,
      passedScenarios: results.filter(r => r.thresholds.passed).length,
      totalErrors: results.reduce((sum, r) => sum + r.metrics.errors, 0),
      totalChecks: results.reduce((sum, r) => sum + r.metrics.checks.passes + r.metrics.checks.fails, 0),
      checkPassRate: results.reduce((sum, r) => sum + (r.metrics.checks.passes / (r.metrics.checks.passes + r.metrics.checks.fails)), 0) / results.length
    },
    scenarios: results
  };

  // Save report
  writeFileSync(
    path.join(resultsDir, `load-test-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`),
    JSON.stringify(report, null, 2)
  );

  // Print summary
  console.log('\nLoad Test Summary:');
  console.log('==================');
  console.log(`Total Scenarios: ${report.summary.totalScenarios}`);
  console.log(`Passed Scenarios: ${report.summary.passedScenarios}`);
  console.log(`Total Errors: ${report.summary.totalErrors}`);
  console.log(`Check Pass Rate: ${(report.summary.checkPassRate * 100).toFixed(2)}%`);
  
  results.forEach(result => {
    console.log(`\n${result.scenario}:`);
    console.log(`  Response Times (ms):`);
    console.log(`    p95: ${result.metrics.http_req_duration.p95.toFixed(2)}`);
    console.log(`    p99: ${result.metrics.http_req_duration.p99.toFixed(2)}`);
    console.log(`    avg: ${result.metrics.http_req_duration.avg.toFixed(2)}`);
    console.log(`  Errors: ${result.metrics.errors}`);
    console.log(`  Checks: ${result.metrics.checks.passes}/${result.metrics.checks.passes + result.metrics.checks.fails}`);
  });
}

// Run all scenarios
console.log('Starting load tests...');
const results = scenarios.map(({ name, file }) => runTest(name, file));

// Generate final report
generateReport(results);

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  thresholds: {
    responseTime: 1000,    // ms
    errorRate: 0.01,       // 1%
    cpuUsage: 80,         // 80%
    memoryUsage: 75,      // 75%
    p95ResponseTime: 2000  // ms
  },
  baselinePath: path.join(__dirname, '../../benchmark/baseline.json'),
  outputPath: path.join(__dirname, '../../performance-report.json')
};

// Load test results
function loadTestResults() {
  const results = {
    responseTime: [],
    errors: 0,
    totalRequests: 0,
    cpuUsage: [],
    memoryUsage: [],
    timestamp: new Date().toISOString()
  };

  // Load results from test output files
  const testOutputPath = path.join(__dirname, '../../test-output');
  const files = fs.readdirSync(testOutputPath);

  files.forEach(file => {
    if (file.startsWith('perf-test-') && file.endsWith('.json')) {
      const testData = JSON.parse(
        fs.readFileSync(path.join(testOutputPath, file), 'utf8')
      );

      results.responseTime.push(...testData.responseTime);
      results.errors += testData.errors;
      results.totalRequests += testData.totalRequests;
      results.cpuUsage.push(...testData.cpuUsage);
      results.memoryUsage.push(...testData.memoryUsage);
    }
  });

  return results;
}

// Calculate statistics
function calculateStats(results) {
  const sortedResponseTimes = [...results.responseTime].sort((a, b) => a - b);
  const p95Index = Math.floor(sortedResponseTimes.length * 0.95);

  return {
    averageResponseTime: results.responseTime.reduce((a, b) => a + b, 0) / results.responseTime.length,
    p95ResponseTime: sortedResponseTimes[p95Index],
    errorRate: results.errors / results.totalRequests,
    averageCpuUsage: results.cpuUsage.reduce((a, b) => a + b, 0) / results.cpuUsage.length,
    averageMemoryUsage: results.memoryUsage.reduce((a, b) => a + b, 0) / results.memoryUsage.length,
    timestamp: results.timestamp
  };
}

// Compare with baseline
function compareWithBaseline(currentStats) {
  if (!fs.existsSync(config.baselinePath)) {
    return {
      hasBaseline: false,
      regressions: []
    };
  }

  const baseline = JSON.parse(fs.readFileSync(config.baselinePath, 'utf8'));
  const regressions = [];

  // Check for regressions
  if (currentStats.averageResponseTime > baseline.averageResponseTime * 1.1) {
    regressions.push({
      metric: 'Average Response Time',
      baseline: baseline.averageResponseTime,
      current: currentStats.averageResponseTime,
      increase: ((currentStats.averageResponseTime - baseline.averageResponseTime) / baseline.averageResponseTime * 100).toFixed(2) + '%'
    });
  }

  if (currentStats.errorRate > baseline.errorRate * 1.5) {
    regressions.push({
      metric: 'Error Rate',
      baseline: baseline.errorRate,
      current: currentStats.errorRate,
      increase: ((currentStats.errorRate - baseline.errorRate) / baseline.errorRate * 100).toFixed(2) + '%'
    });
  }

  return {
    hasBaseline: true,
    regressions
  };
}

// Check against thresholds
function checkThresholds(stats) {
  const violations = [];

  if (stats.averageResponseTime > config.thresholds.responseTime) {
    violations.push({
      metric: 'Average Response Time',
      threshold: config.thresholds.responseTime,
      actual: stats.averageResponseTime
    });
  }

  if (stats.errorRate > config.thresholds.errorRate) {
    violations.push({
      metric: 'Error Rate',
      threshold: config.thresholds.errorRate,
      actual: stats.errorRate
    });
  }

  if (stats.averageCpuUsage > config.thresholds.cpuUsage) {
    violations.push({
      metric: 'CPU Usage',
      threshold: config.thresholds.cpuUsage,
      actual: stats.averageCpuUsage
    });
  }

  if (stats.averageMemoryUsage > config.thresholds.memoryUsage) {
    violations.push({
      metric: 'Memory Usage',
      threshold: config.thresholds.memoryUsage,
      actual: stats.averageMemoryUsage
    });
  }

  if (stats.p95ResponseTime > config.thresholds.p95ResponseTime) {
    violations.push({
      metric: 'P95 Response Time',
      threshold: config.thresholds.p95ResponseTime,
      actual: stats.p95ResponseTime
    });
  }

  return violations;
}

// Generate report
function generateReport(stats, baselineComparison, violations) {
  const report = {
    timestamp: stats.timestamp,
    summary: {
      averageResponseTime: stats.averageResponseTime,
      p95ResponseTime: stats.p95ResponseTime,
      errorRate: stats.errorRate,
      averageCpuUsage: stats.averageCpuUsage,
      averageMemoryUsage: stats.averageMemoryUsage
    },
    baselineComparison,
    violations,
    thresholds: config.thresholds,
    status: violations.length === 0 ? 'PASS' : 'FAIL'
  };

  // Add performance score
  const maxScore = 100;
  const deductions = {
    responseTime: Math.max(0, (stats.averageResponseTime / config.thresholds.responseTime - 1) * 20),
    errorRate: Math.max(0, (stats.errorRate / config.thresholds.errorRate - 1) * 30),
    cpuUsage: Math.max(0, (stats.averageCpuUsage / config.thresholds.cpuUsage - 1) * 15),
    memoryUsage: Math.max(0, (stats.averageMemoryUsage / config.thresholds.memoryUsage - 1) * 15),
    p95ResponseTime: Math.max(0, (stats.p95ResponseTime / config.thresholds.p95ResponseTime - 1) * 20)
  };

  report.performanceScore = Math.max(0, maxScore - Object.values(deductions).reduce((a, b) => a + b, 0));

  return report;
}

// Main execution
try {
  // Load and process results
  const results = loadTestResults();
  const stats = calculateStats(results);
  const baselineComparison = compareWithBaseline(stats);
  const violations = checkThresholds(stats);

  // Generate and save report
  const report = generateReport(stats, baselineComparison, violations);
  fs.writeFileSync(config.outputPath, JSON.stringify(report, null, 2));

  // Output summary to console
  console.log('\nPerformance Analysis Summary:');
  console.log('----------------------------');
  console.log(`Status: ${report.status}`);
  console.log(`Performance Score: ${report.performanceScore.toFixed(2)}/100`);
  console.log(`Average Response Time: ${stats.averageResponseTime.toFixed(2)}ms`);
  console.log(`Error Rate: ${(stats.errorRate * 100).toFixed(2)}%`);
  console.log(`CPU Usage: ${stats.averageCpuUsage.toFixed(2)}%`);
  console.log(`Memory Usage: ${stats.averageMemoryUsage.toFixed(2)}%`);

  if (violations.length > 0) {
    console.log('\nThreshold Violations:');
    violations.forEach(v => {
      console.log(`- ${v.metric}: ${v.actual.toFixed(2)} (Threshold: ${v.threshold})`);
    });
  }

  if (baselineComparison.regressions.length > 0) {
    console.log('\nPerformance Regressions:');
    baselineComparison.regressions.forEach(r => {
      console.log(`- ${r.metric}: Increased by ${r.increase}`);
    });
  }

  // Exit with appropriate code
  process.exit(violations.length > 0 ? 1 : 0);
} catch (error) {
  console.error('Error analyzing performance:', error);
  process.exit(1);
}

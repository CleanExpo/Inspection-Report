const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  benchmarkDir: path.join(__dirname, '../../benchmark'),
  maxHistorySize: 10,
  regressionThresholds: {
    responseTime: 10,  // 10% increase
    throughput: -5,    // 5% decrease
    errorRate: 50,     // 50% increase
    memory: 15,        // 15% increase
    cpu: 15           // 15% increase
  }
};

// Load benchmark data
function loadBenchmarkData() {
  const currentFile = path.join(config.benchmarkDir, 'current.json');
  const historyFile = path.join(config.benchmarkDir, 'history.json');

  if (!fs.existsSync(currentFile)) {
    throw new Error('No current benchmark data found');
  }

  const current = JSON.parse(fs.readFileSync(currentFile, 'utf8'));
  const history = fs.existsSync(historyFile) 
    ? JSON.parse(fs.readFileSync(historyFile, 'utf8'))
    : [];

  return { current, history };
}

// Calculate statistics
function calculateStats(data) {
  return {
    mean: data.reduce((a, b) => a + b, 0) / data.length,
    median: data.sort((a, b) => a - b)[Math.floor(data.length / 2)],
    p95: data.sort((a, b) => a - b)[Math.floor(data.length * 0.95)],
    min: Math.min(...data),
    max: Math.max(...data)
  };
}

// Compare current with historical data
function compareWithHistory(current, history) {
  if (history.length === 0) {
    return {
      regressions: [],
      improvements: [],
      isFirstRun: true
    };
  }

  const previousRun = history[0];
  const regressions = [];
  const improvements = [];

  // Helper function to calculate percentage change
  const getPercentChange = (current, previous) => 
    ((current - previous) / previous) * 100;

  // Check each metric
  Object.entries(config.regressionThresholds).forEach(([metric, threshold]) => {
    const currentValue = current.stats[metric].mean;
    const previousValue = previousRun.stats[metric].mean;
    const change = getPercentChange(currentValue, previousValue);

    // For metrics where lower is better
    const isRegression = metric === 'throughput' 
      ? change < threshold 
      : change > threshold;

    if (isRegression) {
      regressions.push({
        metric,
        change: change.toFixed(2) + '%',
        current: currentValue,
        previous: previousValue,
        threshold: threshold + '%'
      });
    } else if (Math.abs(change) > Math.abs(threshold / 2)) {
      // Report significant improvements
      improvements.push({
        metric,
        change: change.toFixed(2) + '%',
        current: currentValue,
        previous: previousValue
      });
    }
  });

  return {
    regressions,
    improvements,
    isFirstRun: false
  };
}

// Update benchmark history
function updateHistory(current, history) {
  history.unshift({
    timestamp: new Date().toISOString(),
    stats: current.stats,
    metadata: current.metadata
  });

  // Keep only the last N entries
  if (history.length > config.maxHistorySize) {
    history = history.slice(0, config.maxHistorySize);
  }

  return history;
}

// Generate report
function generateReport(current, comparison) {
  const report = {
    timestamp: new Date().toISOString(),
    status: comparison.regressions.length === 0 ? 'PASS' : 'FAIL',
    summary: {
      regressions: comparison.regressions.length,
      improvements: comparison.improvements.length,
      isFirstRun: comparison.isFirstRun
    },
    current: {
      stats: current.stats,
      metadata: current.metadata
    },
    regressions: comparison.regressions,
    improvements: comparison.improvements
  };

  return report;
}

// Save results
function saveResults(history, report) {
  // Save updated history
  fs.writeFileSync(
    path.join(config.benchmarkDir, 'history.json'),
    JSON.stringify(history, null, 2)
  );

  // Save report
  fs.writeFileSync(
    path.join(config.benchmarkDir, 'latest-report.json'),
    JSON.stringify(report, null, 2)
  );
}

// Print report to console
function printReport(report) {
  console.log('\nBenchmark Comparison Report');
  console.log('=========================');
  console.log(`Status: ${report.status}`);
  console.log(`Timestamp: ${report.timestamp}`);
  
  if (report.summary.isFirstRun) {
    console.log('\nThis is the first benchmark run - establishing baseline');
    return;
  }

  if (report.regressions.length > 0) {
    console.log('\nPerformance Regressions:');
    console.log('----------------------');
    report.regressions.forEach(r => {
      console.log(`${r.metric}:`);
      console.log(`  Change: ${r.change}`);
      console.log(`  Current: ${r.current}`);
      console.log(`  Previous: ${r.previous}`);
      console.log(`  Threshold: ${r.threshold}`);
    });
  }

  if (report.improvements.length > 0) {
    console.log('\nPerformance Improvements:');
    console.log('------------------------');
    report.improvements.forEach(i => {
      console.log(`${i.metric}:`);
      console.log(`  Change: ${i.change}`);
      console.log(`  Current: ${i.current}`);
      console.log(`  Previous: ${i.previous}`);
    });
  }

  if (report.regressions.length === 0 && report.improvements.length === 0) {
    console.log('\nNo significant changes detected');
  }
}

// Main execution
try {
  // Create benchmark directory if it doesn't exist
  if (!fs.existsSync(config.benchmarkDir)) {
    fs.mkdirSync(config.benchmarkDir, { recursive: true });
  }

  // Load data
  const { current, history } = loadBenchmarkData();

  // Compare with history
  const comparison = compareWithHistory(current, history);

  // Update history
  const updatedHistory = updateHistory(current, history);

  // Generate and save report
  const report = generateReport(current, comparison);
  saveResults(updatedHistory, report);

  // Print report
  printReport(report);

  // Exit with appropriate code
  process.exit(report.status === 'PASS' ? 0 : 1);
} catch (error) {
  console.error('Error comparing benchmarks:', error);
  process.exit(1);
}

const fs = require('fs');
const path = require('path');

const ANALYSIS_FILE = path.join(process.cwd(), 'performance-analysis.json');
const REPORT_FILE = path.join(process.cwd(), 'performance-report.md');

/**
 * Generates a markdown performance report from analysis results
 */
async function generateReport() {
  try {
    const analysis = JSON.parse(fs.readFileSync(ANALYSIS_FILE, 'utf8'));
    const report = [];

    // Report header
    report.push('# Performance Test Results');
    report.push(`\n_Generated at ${new Date().toISOString()}_\n`);

    // Summary section
    report.push('## Summary');
    const { summary } = analysis;
    if (summary.degraded.length > 0) {
      report.push('⚠️ **Performance degradation detected**');
    } else if (summary.improved.length > 0) {
      report.push('✅ **Performance improvements detected**');
    } else {
      report.push('✅ **Performance stable**');
    }

    // Quick stats
    report.push('\n### Status Overview');
    report.push('| Category | Operations |');
    report.push('|----------|------------|');
    report.push(`| 🔴 Degraded | ${summary.degraded.length} |`);
    report.push(`| 🟢 Improved | ${summary.improved.length} |`);
    report.push(`| 🟦 Stable | ${summary.stable.length} |`);

    // Detailed operation results
    report.push('\n## Operation Details');
    for (const [operation, data] of Object.entries(analysis.operations)) {
      report.push(`\n### ${operation}`);
      
      // Status indicator
      const statusEmoji = getStatusEmoji(data.status);
      report.push(`**Status**: ${statusEmoji} ${data.status.toUpperCase()}`);

      // Performance metrics
      report.push('\n**Current Metrics**');
      report.push('```');
      report.push(`Mean: ${data.current.mean.toFixed(2)}ms`);
      report.push(`P95:  ${data.current.p95.toFixed(2)}ms`);
      report.push(`P99:  ${data.current.p99.toFixed(2)}ms`);
      report.push('```');

      // Historical comparison
      if (data.degradation !== 0) {
        const changeEmoji = data.degradation > 0 ? '📈' : '📉';
        report.push(`\n${changeEmoji} **Change**: ${data.degradation.toFixed(1)}% ${data.degradation > 0 ? 'slower' : 'faster'}`);
      }

      // Trend
      report.push(`\n📊 **Trend**: ${formatTrend(data.historical.trend)}`);
    }

    // Resource utilization
    if (analysis.resources) {
      report.push('\n## Resource Utilization');
      report.push('\n| Resource | Mean | Max | Utilization |');
      report.push('|-----------|------|-----|-------------|');
      report.push(`| Memory | ${analysis.resources.memory.mean.toFixed(1)}MB | ${analysis.resources.memory.max.toFixed(1)}MB | ${analysis.resources.memory.utilization.toFixed(1)}% |`);
      report.push(`| CPU | ${analysis.resources.cpu.mean.toFixed(1)}% | ${analysis.resources.cpu.max.toFixed(1)}% | ${analysis.resources.cpu.utilization.toFixed(1)}% |`);
      report.push(`| Connections | ${analysis.resources.connections.mean.toFixed(1)} | ${analysis.resources.connections.max} | - |`);
    }

    // Recent events
    if (analysis.events.recentEvents.length > 0) {
      report.push('\n## Recent Events');
      report.push(`\n🚨 **Alerts**: ${analysis.events.alerts}`);
      report.push(`⚠️ **Warnings**: ${analysis.events.warnings}\n`);

      const significantEvents = analysis.events.recentEvents
        .filter(e => e.type === 'alert' || e.type === 'warning')
        .slice(-5);

      if (significantEvents.length > 0) {
        report.push('**Most Recent Issues:**');
        significantEvents.forEach(event => {
          const icon = event.type === 'alert' ? '🚨' : '⚠️';
          report.push(`- ${icon} ${event.message} _(${formatDate(event.timestamp)})_`);
        });
      }
    }

    // Recommendations
    if (analysis.recommendations.length > 0) {
      report.push('\n## Recommendations');
      
      // Group recommendations by type
      const critical = analysis.recommendations.filter(r => r.type === 'critical');
      const warnings = analysis.recommendations.filter(r => r.type === 'warning');
      const resources = analysis.recommendations.filter(r => r.type === 'resource');

      if (critical.length > 0) {
        report.push('\n### 🚨 Critical Issues');
        critical.forEach(rec => report.push(`- ${rec.message}`));
      }

      if (warnings.length > 0) {
        report.push('\n### ⚠️ Warnings');
        warnings.forEach(rec => report.push(`- ${rec.message}`));
      }

      if (resources.length > 0) {
        report.push('\n### 📊 Resource Recommendations');
        resources.forEach(rec => report.push(`- ${rec.message}`));
      }
    }

    // Write report to file
    fs.writeFileSync(REPORT_FILE, report.join('\n'));
    console.log('Performance report generated:', REPORT_FILE);

  } catch (error) {
    console.error('Error generating performance report:', error);
    process.exit(1);
  }
}

// Helper functions
function getStatusEmoji(status) {
  switch (status.toLowerCase()) {
    case 'critical': return '🔴';
    case 'warning': return '🟡';
    case 'improved': return '🟢';
    case 'stable': return '🟦';
    default: return '⚪';
  }
}

function formatTrend(trend) {
  switch (trend) {
    case 'improving': return '🟢 Improving over time';
    case 'degrading': return '🔴 Degrading over time';
    case 'stable': return '🟦 Stable';
    default: return '⚪ Insufficient data';
  }
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Run report generation if called directly
if (require.main === module) {
  generateReport().catch(console.error);
}

module.exports = { generateReport };

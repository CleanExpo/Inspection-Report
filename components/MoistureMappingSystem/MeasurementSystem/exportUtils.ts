import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { MeasurementHistory, MeasurementTemplate, ExportFormat } from './types';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void;
    lastAutoTable: {
      finalY: number;
    };
  }
}

const generatePDF = (
  history: MeasurementHistory,
  template: MeasurementTemplate
): Blob => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Title
  doc.setFontSize(20);
  doc.text('Moisture Measurement Report', pageWidth / 2, 20, { align: 'center' });

  // Template Info
  doc.setFontSize(14);
  doc.text('Template Information', 14, 40);
  doc.autoTable({
    startY: 45,
    head: [['Property', 'Value']],
    body: [
      ['Name', template.name],
      ['Description', template.description],
      ['Grid Spacing', `${template.gridSpacing}m`],
      ['Reference Values', `${template.referenceValues.dry} / ${template.referenceValues.warning} / ${template.referenceValues.critical}`],
      ['Date', new Date(history.timestamp).toLocaleString()],
      ['Session ID', history.sessionId]
    ]
  });

  // Summary
  const summaryY = doc.lastAutoTable.finalY + 20;
  doc.setFontSize(14);
  doc.text('Measurement Summary', 14, summaryY);
  doc.autoTable({
    startY: summaryY + 5,
    head: [['Metric', 'Value']],
    body: [
      ['Total Points', history.comparisons.length.toString()],
      ['Points Out of Tolerance', history.summary.pointsOutOfTolerance.toString()],
      ['Maximum Deviation', history.summary.maxDeviation.toFixed(1)],
      ['Average Deviation', history.summary.averageDeviation.toFixed(1)]
    ]
  });

  // Comparison Data
  const comparisonY = doc.lastAutoTable.finalY + 20;
  doc.setFontSize(14);
  doc.text('Detailed Measurements', 14, comparisonY);
  doc.autoTable({
    startY: comparisonY + 5,
    head: [['Point', 'Expected', 'Actual', 'Deviation', 'Status']],
    body: history.comparisons.map(c => [
      `${c.point.label} (${c.point.x}, ${c.point.y})`,
      c.expectedValue.toString(),
      c.actualValue.toString(),
      c.deviation.toFixed(1),
      c.withinTolerance ? 'Within Tolerance' : 'Out of Tolerance'
    ])
  });

  return doc.output('blob');
};

const generateCSV = (
  history: MeasurementHistory,
  template: MeasurementTemplate
): string => {
  const lines: string[] = [];

  // Header information
  lines.push('Moisture Measurement Report');
  lines.push('');
  lines.push('Template Information');
  lines.push(`Name,${template.name}`);
  lines.push(`Description,${template.description}`);
  lines.push(`Grid Spacing,${template.gridSpacing}m`);
  lines.push(`Reference Values,${template.referenceValues.dry} / ${template.referenceValues.warning} / ${template.referenceValues.critical}`);
  lines.push(`Date,${new Date(history.timestamp).toLocaleString()}`);
  lines.push(`Session ID,${history.sessionId}`);
  lines.push('');

  // Summary
  lines.push('Measurement Summary');
  lines.push(`Total Points,${history.comparisons.length}`);
  lines.push(`Points Out of Tolerance,${history.summary.pointsOutOfTolerance}`);
  lines.push(`Maximum Deviation,${history.summary.maxDeviation.toFixed(1)}`);
  lines.push(`Average Deviation,${history.summary.averageDeviation.toFixed(1)}`);
  lines.push('');

  // Comparison Data
  lines.push('Detailed Measurements');
  lines.push('Point,Coordinates,Expected,Actual,Deviation,Status');
  history.comparisons.forEach(c => {
    lines.push(
      `${c.point.label},"(${c.point.x}, ${c.point.y})",${c.expectedValue},${
        c.actualValue
      },${c.deviation.toFixed(1)},${
        c.withinTolerance ? 'Within Tolerance' : 'Out of Tolerance'
      }`
    );
  });

  return lines.join('\n');
};

const generateJSON = (
  history: MeasurementHistory,
  template: MeasurementTemplate
): string => {
  const data = {
    reportType: 'Moisture Measurement Report',
    template: {
      name: template.name,
      description: template.description,
      gridSpacing: template.gridSpacing,
      referenceValues: template.referenceValues
    },
    session: {
      id: history.sessionId,
      timestamp: history.timestamp,
      summary: history.summary
    },
    measurements: history.comparisons.map(c => ({
      point: {
        id: c.point.id,
        label: c.point.label,
        coordinates: {
          x: c.point.x,
          y: c.point.y
        }
      },
      values: {
        expected: c.expectedValue,
        actual: c.actualValue,
        deviation: c.deviation
      },
      withinTolerance: c.withinTolerance
    }))
  };

  return JSON.stringify(data, null, 2);
};

export const exportMeasurementHistory = (
  history: MeasurementHistory,
  template: MeasurementTemplate,
  format: ExportFormat
): Blob | string => {
  switch (format) {
    case 'pdf':
      return generatePDF(history, template);
    case 'csv':
      return generateCSV(history, template);
    case 'json':
      return generateJSON(history, template);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { MeasurementHistory, MeasurementTemplate } from './types';

const generateCSV = (history: MeasurementHistory, template: MeasurementTemplate): string => {
    const headers = ['Point', 'Label', 'Expected', 'Actual', 'Deviation', 'Status'];
    const rows = history.comparisons.map(comparison => [
        comparison.point.id,
        comparison.point.label,
        comparison.expectedValue.toString(),
        comparison.actualValue.toString(),
        comparison.deviation.toString(),
        comparison.withinTolerance ? 'Within Tolerance' : 'Out of Tolerance'
    ]);

    const csvContent = [
        // Metadata
        ['Session ID:', history.sessionId],
        ['Template:', template.name],
        ['Date:', history.timestamp.toISOString()],
        [''],
        // Summary
        ['Summary:'],
        ['Average Deviation:', history.summary.averageDeviation.toString()],
        ['Max Deviation:', history.summary.maxDeviation.toString()],
        ['Points Out of Tolerance:', `${history.summary.pointsOutOfTolerance} / ${history.comparisons.length}`],
        [''],
        // Data
        headers,
        ...rows
    ].map(row => row.join(',')).join('\n');

    return csvContent;
};

const generateJSON = (history: MeasurementHistory, template: MeasurementTemplate): string => {
    const data = {
        metadata: {
            sessionId: history.sessionId,
            templateId: template.id,
            templateName: template.name,
            timestamp: history.timestamp,
        },
        summary: history.summary,
        readings: history.comparisons.map(comparison => ({
            point: comparison.point,
            expected: comparison.expectedValue,
            actual: comparison.actualValue,
            deviation: comparison.deviation,
            withinTolerance: comparison.withinTolerance
        }))
    };

    return JSON.stringify(data, null, 2);
};

const generatePDF = (history: MeasurementHistory, template: MeasurementTemplate): Blob => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Title
    doc.setFontSize(20);
    doc.text('Moisture Measurement Report', pageWidth / 2, 20, { align: 'center' });

    // Metadata
    doc.setFontSize(12);
    doc.text([
        `Session ID: ${history.sessionId}`,
        `Template: ${template.name}`,
        `Date: ${history.timestamp.toLocaleString()}`,
    ], 20, 40);

    // Summary
    doc.setFontSize(14);
    doc.text('Summary', 20, 70);
    doc.setFontSize(12);
    doc.text([
        `Average Deviation: ${history.summary.averageDeviation.toFixed(1)}`,
        `Max Deviation: ${history.summary.maxDeviation}`,
        `Points Out of Tolerance: ${history.summary.pointsOutOfTolerance} / ${history.comparisons.length}`,
    ], 30, 80);

    // Grid visualization
    doc.setFontSize(14);
    doc.text('Measurement Points', 20, 110);
    
    // Draw grid
    const gridStartX = 30;
    const gridStartY = 120;
    const gridSize = 100;
    
    doc.setDrawColor(200);
    doc.rect(gridStartX, gridStartY, gridSize, gridSize);

    // Plot points
    history.comparisons.forEach(comparison => {
        const x = gridStartX + (comparison.point.x * gridSize);
        const y = gridStartY + (comparison.point.y * gridSize);
        
        doc.setFillColor(comparison.withinTolerance ? '#00ff00' : '#ff0000');
        doc.circle(x, y, 2, 'F');
        doc.setFontSize(8);
        doc.text(comparison.point.label, x + 3, y);
    });

    // Readings table
    doc.addPage();
    doc.setFontSize(14);
    doc.text('Detailed Readings', 20, 20);

    const tableData = history.comparisons.map(comparison => [
        comparison.point.label,
        comparison.expectedValue.toString(),
        comparison.actualValue.toString(),
        comparison.deviation.toString(),
        comparison.withinTolerance ? 'Within Tolerance' : 'Out of Tolerance'
    ]);

    (doc as any).autoTable({
        startY: 30,
        head: [['Point', 'Expected', 'Actual', 'Deviation', 'Status']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [66, 139, 202] }
    });

    return doc.output('blob');
};

export const exportMeasurementHistory = (
    history: MeasurementHistory,
    template: MeasurementTemplate,
    format: 'csv' | 'json' | 'pdf'
): string | Blob => {
    switch (format) {
        case 'csv':
            return generateCSV(history, template);
        case 'json':
            return generateJSON(history, template);
        case 'pdf':
            return generatePDF(history, template);
        default:
            throw new Error(`Unsupported export format: ${format}`);
    }
};

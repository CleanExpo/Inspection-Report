import { exportToCSV, exportToJSON, exportToPDF, exportMeasurementHistory } from '../exportUtils';
import { MeasurementHistory, MeasurementTemplate } from '../types';

describe('exportUtils', () => {
  const mockTemplate: MeasurementTemplate = {
    id: 'template1',
    name: 'Test Template',
    description: 'Test Description',
    points: [
      { id: 'p1', label: 'Point 1', x: 0, y: 0 },
      { id: 'p2', label: 'Point 2', x: 1, y: 1 }
    ],
    gridSpacing: 1,
    referenceValues: {
      dry: 15,
      warning: 25,
      critical: 35
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  };

  const mockHistory: MeasurementHistory = {
    sessionId: 'session1',
    templateId: 'template1',
    timestamp: new Date('2024-01-01T12:00:00'),
    readings: [],
    comparisons: [
      {
        point: mockTemplate.points[0],
        expectedValue: 15,
        actualValue: 14,
        deviation: -1,
        withinTolerance: true
      },
      {
        point: mockTemplate.points[1],
        expectedValue: 15,
        actualValue: 30,
        deviation: 15,
        withinTolerance: false
      }
    ],
    summary: {
      averageDeviation: 8,
      maxDeviation: 15,
      pointsOutOfTolerance: 1
    }
  };

  describe('exportToCSV', () => {
    it('generates correct CSV format', () => {
      const csv = exportToCSV(mockHistory, mockTemplate);
      const lines = csv.split('\n');

      // Check header
      expect(lines[0]).toBe('Moisture Measurement Report');
      expect(lines[1]).toBe('Template: Test Template');
      expect(lines[2]).toMatch(/Date: .+/);

      // Check summary
      expect(lines[5]).toBe('Summary');
      expect(lines[6]).toBe('Total Points,2');
      expect(lines[7]).toBe('Points Out of Tolerance,1');
      expect(lines[8]).toBe('Average Deviation,8.0%');
      expect(lines[9]).toBe('Maximum Deviation,15.0%');

      // Check reference values
      expect(lines[12]).toBe('Reference Values');
      expect(lines[13]).toBe('Dry,15%');
      expect(lines[14]).toBe('Warning,25%');
      expect(lines[15]).toBe('Critical,35%');

      // Check data header
      expect(lines[17]).toBe('Point,Location (X),Location (Y),Expected Value,Actual Value,Deviation,Within Tolerance');

      // Check data rows
      expect(lines[18]).toBe('Point 1,0,0,15.0%,14.0%,-1.0%,Yes');
      expect(lines[19]).toBe('Point 2,1,1,15.0%,30.0%,+15.0%,No');
    });
  });

  describe('exportToJSON', () => {
    it('generates correct JSON format', () => {
      const json = exportToJSON(mockHistory, mockTemplate);
      const data = JSON.parse(json);

      // Check template section
      expect(data.template).toEqual({
        id: mockTemplate.id,
        name: mockTemplate.name,
        description: mockTemplate.description,
        referenceValues: mockTemplate.referenceValues
      });

      // Check session section
      expect(data.session).toEqual({
        id: mockHistory.sessionId,
        timestamp: mockHistory.timestamp.toISOString(),
        summary: mockHistory.summary
      });

      // Check comparisons
      expect(data.comparisons).toHaveLength(2);
      expect(data.comparisons[0]).toEqual({
        point: {
          label: 'Point 1',
          x: 0,
          y: 0
        },
        expected: 15,
        actual: 14,
        deviation: -1,
        withinTolerance: true
      });
    });
  });

  describe('exportToPDF', () => {
    it('generates PDF document', () => {
      const pdf = exportToPDF(mockHistory, mockTemplate);
      
      // Check that PDF was created
      expect(pdf).toBeDefined();
      expect(pdf.internal.pages).toHaveLength(1);

      // Verify PDF structure
      expect(pdf.internal.pageSize.width).toBeDefined();
      expect(pdf.internal.pageSize.height).toBeDefined();
      
      // Convert to string to verify some content was generated
      const pdfString = pdf.output('datauristring');
      expect(pdfString).toContain('data:application/pdf;base64,');
    });
  });

  describe('exportMeasurementHistory', () => {
    it('exports CSV format', () => {
      const result = exportMeasurementHistory(mockHistory, mockTemplate, 'csv');
      expect(typeof result).toBe('string');
      expect(result).toContain('Moisture Measurement Report');
    });

    it('exports JSON format', () => {
      const result = exportMeasurementHistory(mockHistory, mockTemplate, 'json');
      expect(typeof result).toBe('string');
      const data = JSON.parse(result as string);
      expect(data).toHaveProperty('template');
      expect(data).toHaveProperty('session');
      expect(data).toHaveProperty('comparisons');
    });

    it('exports PDF format', () => {
      const result = exportMeasurementHistory(mockHistory, mockTemplate, 'pdf');
      expect(result).toBeInstanceOf(Blob);
    });

    it('throws error for invalid format', () => {
      expect(() => {
        // @ts-ignore - Testing invalid format
        exportMeasurementHistory(mockHistory, mockTemplate, 'invalid');
      }).toThrow('Unsupported export format: invalid');
    });
  });
});

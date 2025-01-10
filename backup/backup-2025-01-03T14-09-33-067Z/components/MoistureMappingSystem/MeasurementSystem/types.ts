export interface Point {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface ReferenceValues {
  dry: number;
  warning: number;
  critical: number;
}

export interface MeasurementTemplate {
  id: string;
  name: string;
  description: string;
  points: Point[];
  gridSpacing: number;
  referenceValues: ReferenceValues;
  createdAt: Date;
  updatedAt: Date;
}

export interface MeasurementComparison {
  point: Point;
  expectedValue: number;
  actualValue: number;
  deviation: number;
  withinTolerance: boolean;
}

export interface MeasurementSummary {
  averageDeviation: number;
  maxDeviation: number;
  pointsOutOfTolerance: number;
}

export interface MeasurementHistory {
  sessionId: string;
  templateId: string;
  timestamp: Date;
  readings: number[];
  comparisons: MeasurementComparison[];
  summary: MeasurementSummary;
}

export interface TemplateSelectorProps {
  templates: MeasurementTemplate[];
  selectedTemplate?: string;
  onSelect: (templateId: string) => void;
}

export interface ComparisonViewProps {
  comparisons: MeasurementComparison[];
  template: MeasurementTemplate;
  onPointClick: (pointId: string) => void;
}

export interface HistoryViewProps {
  history: MeasurementHistory[];
  templates: MeasurementTemplate[];
  onSelectEntry: (entry: MeasurementHistory) => void;
  onExport: (entry: MeasurementHistory) => void;
}

export type ExportFormat = 'csv' | 'json' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  includeMetadata?: boolean;
  includeSummary?: boolean;
  includeComparisons?: boolean;
}

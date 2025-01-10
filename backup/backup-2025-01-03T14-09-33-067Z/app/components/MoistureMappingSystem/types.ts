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
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
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
    timestamp: string; // ISO date string
    readings: Array<{
        pointId: string;
        value: number;
    }>;
    comparisons: MeasurementComparison[];
    summary: MeasurementSummary;
}

export interface ExportOptions {
    format: 'csv' | 'json' | 'pdf';
    includeComparisons?: boolean;
    includeSummary?: boolean;
}

'use client';

import { useMemo } from 'react';
import { MeasurementTemplate } from '../utils/measurementTemplates';

interface Measurement {
  id: string;
  type: 'distance' | 'area';
  value: number;
  timestamp: Date;
  label?: string;
}

interface MeasurementComparisonProps {
  measurements: Measurement[];
  selectedTemplate: MeasurementTemplate | undefined;
}

export default function MeasurementComparison({
  measurements,
  selectedTemplate
}: MeasurementComparisonProps) {
  const stats = useMemo(() => {
    const areaMeasurements = measurements.filter(m => m.type === 'area');
    const perimeterMeasurements = measurements.filter(
      m => m.type === 'distance' && m.label === 'Perimeter'
    );

    const latestArea = areaMeasurements.length > 0
      ? areaMeasurements[areaMeasurements.length - 1].value
      : undefined;

    const latestPerimeter = perimeterMeasurements.length > 0
      ? perimeterMeasurements[perimeterMeasurements.length - 1].value
      : undefined;

    const areaDeviation = latestArea !== undefined && selectedTemplate?.defaultArea
      ? ((latestArea - selectedTemplate.defaultArea) / selectedTemplate.defaultArea) * 100
      : undefined;

    const perimeterDeviation = latestPerimeter !== undefined && selectedTemplate?.defaultPerimeter
      ? ((latestPerimeter - selectedTemplate.defaultPerimeter) / selectedTemplate.defaultPerimeter) * 100
      : undefined;

    return {
      latestArea,
      latestPerimeter,
      areaDeviation,
      perimeterDeviation,
      isWithinTolerance: selectedTemplate
        ? (areaDeviation === undefined || Math.abs(areaDeviation) <= selectedTemplate.tolerancePercent) &&
          (perimeterDeviation === undefined || Math.abs(perimeterDeviation) <= selectedTemplate.tolerancePercent)
        : undefined
    };
  }, [measurements, selectedTemplate]);

  if (!selectedTemplate) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <p className="text-gray-500 text-center">Select a template to compare measurements</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Measurement Comparison</h3>
      </div>

      <div className="px-4 py-3">
        <div className="space-y-4">
          {/* Template Info */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">{selectedTemplate.name}</h4>
            <p className="text-sm text-gray-500">{selectedTemplate.description}</p>
          </div>

          {/* Area Comparison */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Expected Area:</span>
              <span className="font-medium">
                {selectedTemplate.defaultArea?.toFixed(1) || 'N/A'} m²
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Measured Area:</span>
              <span className="font-medium">
                {stats.latestArea?.toFixed(1) || 'N/A'} m²
              </span>
            </div>
            {stats.areaDeviation !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Deviation:</span>
                <span className={`font-medium ${
                  Math.abs(stats.areaDeviation) <= selectedTemplate.tolerancePercent
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {stats.areaDeviation > 0 ? '+' : ''}{stats.areaDeviation.toFixed(1)}%
                </span>
              </div>
            )}
          </div>

          {/* Perimeter Comparison */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Expected Perimeter:</span>
              <span className="font-medium">
                {selectedTemplate.defaultPerimeter?.toFixed(1) || 'N/A'} m
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Measured Perimeter:</span>
              <span className="font-medium">
                {stats.latestPerimeter?.toFixed(1) || 'N/A'} m
              </span>
            </div>
            {stats.perimeterDeviation !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Deviation:</span>
                <span className={`font-medium ${
                  Math.abs(stats.perimeterDeviation) <= selectedTemplate.tolerancePercent
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {stats.perimeterDeviation > 0 ? '+' : ''}{stats.perimeterDeviation.toFixed(1)}%
                </span>
              </div>
            )}
          </div>

          {/* Tolerance Status */}
          {stats.isWithinTolerance !== undefined && (
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Within Tolerance:</span>
                <span className={`px-2 py-1 text-sm font-medium rounded ${
                  stats.isWithinTolerance
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {stats.isWithinTolerance ? 'Yes' : 'No'}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Tolerance: ±{selectedTemplate.tolerancePercent}%
              </p>
            </div>
          )}

          {/* Measurement Notes */}
          {selectedTemplate.notes && (
            <div className="pt-4 border-t border-gray-200">
              <h5 className="text-sm font-medium text-gray-900 mb-2">
                Measurement Notes:
              </h5>
              <ul className="text-sm text-gray-600 space-y-1">
                {selectedTemplate.notes.map((note, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

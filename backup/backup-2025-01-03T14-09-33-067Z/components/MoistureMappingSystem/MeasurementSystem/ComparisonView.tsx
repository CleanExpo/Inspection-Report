import React from 'react';
import { ComparisonViewProps, MeasurementComparison } from './types';

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  comparisons,
  template,
  onPointClick
}) => {
  const getDeviationColor = (deviation: number, withinTolerance: boolean) => {
    if (withinTolerance) return 'text-green-600';
    return deviation > 0 ? 'text-red-600' : 'text-orange-600';
  };

  const getDeviationIcon = (deviation: number, withinTolerance: boolean) => {
    if (withinTolerance) return '✓';
    return deviation > 0 ? '↑' : '↓';
  };

  const renderComparisonRow = (comparison: MeasurementComparison) => {
    const deviationColor = getDeviationColor(
      comparison.deviation,
      comparison.withinTolerance
    );
    const deviationIcon = getDeviationIcon(
      comparison.deviation,
      comparison.withinTolerance
    );

    return (
      <tr
        key={comparison.point.id}
        className="hover:bg-gray-50 cursor-pointer"
        onClick={() => onPointClick(comparison.point.id)}
      >
        <td className="px-4 py-3 border-b">
          <div className="font-medium">{comparison.point.label}</div>
          <div className="text-xs text-gray-500">
            ({comparison.point.x}, {comparison.point.y})
          </div>
        </td>
        <td className="px-4 py-3 border-b text-center">
          {comparison.expectedValue}
        </td>
        <td className="px-4 py-3 border-b text-center">
          {comparison.actualValue}
        </td>
        <td className={`px-4 py-3 border-b text-center ${deviationColor}`}>
          {deviationIcon} {Math.abs(comparison.deviation).toFixed(1)}
        </td>
        <td className="px-4 py-3 border-b text-center">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              comparison.withinTolerance
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {comparison.withinTolerance ? 'Within' : 'Outside'}
          </span>
        </td>
      </tr>
    );
  };

  const calculateSummary = () => {
    const total = comparisons.length;
    const outOfTolerance = comparisons.filter(c => !c.withinTolerance).length;
    const maxDeviation = Math.max(...comparisons.map(c => Math.abs(c.deviation)));
    const avgDeviation =
      comparisons.reduce((sum, c) => sum + Math.abs(c.deviation), 0) / total;

    return { total, outOfTolerance, maxDeviation, avgDeviation };
  };

  const summary = calculateSummary();

  return (
    <div className="space-y-6">
      {/* Template Info */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
        <p className="text-gray-600 mb-3">{template.description}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-500">Reference Values</div>
            <div className="font-medium">
              {template.referenceValues.dry} / {template.referenceValues.warning} /{' '}
              {template.referenceValues.critical}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Grid Spacing</div>
            <div className="font-medium">{template.gridSpacing}m</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Total Points</div>
            <div className="font-medium">{template.points.length}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Last Updated</div>
            <div className="font-medium">
              {new Date(template.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-blue-600">Total Measurements</div>
          <div className="text-2xl font-semibold">{summary.total}</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-sm text-red-600">Out of Tolerance</div>
          <div className="text-2xl font-semibold">{summary.outOfTolerance}</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-sm text-orange-600">Max Deviation</div>
          <div className="text-2xl font-semibold">
            {summary.maxDeviation.toFixed(1)}
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-green-600">Avg Deviation</div>
          <div className="text-2xl font-semibold">
            {summary.avgDeviation.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left">Point</th>
              <th className="px-4 py-2 text-center">Expected</th>
              <th className="px-4 py-2 text-center">Actual</th>
              <th className="px-4 py-2 text-center">Deviation</th>
              <th className="px-4 py-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody>{comparisons.map(renderComparisonRow)}</tbody>
        </table>
      </div>

      {comparisons.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No comparison data available
        </div>
      )}
    </div>
  );
};

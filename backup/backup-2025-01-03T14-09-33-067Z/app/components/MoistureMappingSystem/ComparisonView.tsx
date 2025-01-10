'use client';

import React from 'react';
import { MeasurementTemplate, MeasurementComparison } from './types';

interface ComparisonViewProps {
    comparisons: MeasurementComparison[];
    template: MeasurementTemplate;
    onPointClick: (pointId: string) => void;
}

export function ComparisonView({ comparisons, template, onPointClick }: ComparisonViewProps) {
    const getDeviationColor = (deviation: number, referenceValues: MeasurementTemplate['referenceValues']) => {
        const absDeviation = Math.abs(deviation);
        if (absDeviation <= referenceValues.dry) return 'bg-green-100 text-green-800';
        if (absDeviation <= referenceValues.warning) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    return (
        <div className="space-y-6">
            {/* Grid View */}
            <div className="relative w-full h-96 border rounded-lg bg-gray-50">
                {template.points.map((point) => {
                    const comparison = comparisons.find(c => c.point.id === point.id);
                    const x = point.x * 100;
                    const y = point.y * 100;

                    return (
                        <div
                            key={point.id}
                            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer
                                ${comparison ? (comparison.withinTolerance ? 'bg-green-500' : 'bg-red-500') : 'bg-gray-400'}
                                w-4 h-4 rounded-full hover:scale-110 transition-transform`}
                            style={{ left: `${x}%`, top: `${y}%` }}
                            onClick={() => onPointClick(point.id)}
                            title={`${point.label}: ${comparison?.actualValue ?? 'No reading'}`}
                        />
                    );
                })}
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Point
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Expected
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actual
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Deviation
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {comparisons.map((comparison) => (
                            <tr
                                key={comparison.point.id}
                                className="hover:bg-gray-50 cursor-pointer"
                                onClick={() => onPointClick(comparison.point.id)}
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {comparison.point.label}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {comparison.expectedValue}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {comparison.actualValue}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 py-1 rounded-full ${
                                        getDeviationColor(comparison.deviation, template.referenceValues)
                                    }`}>
                                        {comparison.deviation > 0 ? '+' : ''}{comparison.deviation}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 py-1 rounded-full ${
                                        comparison.withinTolerance
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {comparison.withinTolerance ? 'Within Tolerance' : 'Out of Tolerance'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Summary */}
            <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">Average Deviation</div>
                    <div className="mt-1 text-2xl font-semibold">
                        {(comparisons.reduce((sum, c) => sum + c.deviation, 0) / comparisons.length).toFixed(1)}
                    </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">Max Deviation</div>
                    <div className="mt-1 text-2xl font-semibold">
                        {Math.max(...comparisons.map(c => Math.abs(c.deviation)))}
                    </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">Out of Tolerance</div>
                    <div className="mt-1 text-2xl font-semibold">
                        {comparisons.filter(c => !c.withinTolerance).length} / {comparisons.length}
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import React from 'react';
import { MeasurementHistory, MeasurementTemplate } from './types';

interface HistoryViewProps {
    history: MeasurementHistory[];
    templates: MeasurementTemplate[];
    onSelectEntry: (entry: MeasurementHistory) => void;
    onExport: (entry: MeasurementHistory) => void;
}

const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export function HistoryView({ history, templates, onSelectEntry, onExport }: HistoryViewProps) {
    const getTemplateName = (templateId: string) => {
        return templates.find(t => t.id === templateId)?.name ?? 'Unknown Template';
    };

    const getSummaryColor = (outOfTolerance: number, total: number) => {
        const ratio = outOfTolerance / total;
        if (ratio === 0) return 'bg-green-100 text-green-800';
        if (ratio <= 0.2) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    return (
        <div className="space-y-6">
            {/* History List */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Template
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Points
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Average Deviation
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {history.map((entry) => (
                            <tr
                                key={entry.sessionId}
                                className="hover:bg-gray-50 cursor-pointer"
                                onClick={() => onSelectEntry(entry)}
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(entry.timestamp)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {getTemplateName(entry.templateId)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {entry.comparisons.length}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 py-1 rounded-full ${
                                        entry.summary.averageDeviation <= 5
                                            ? 'bg-green-100 text-green-800'
                                            : entry.summary.averageDeviation <= 10
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {entry.summary.averageDeviation.toFixed(1)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 py-1 rounded-full ${
                                        getSummaryColor(
                                            entry.summary.pointsOutOfTolerance,
                                            entry.comparisons.length
                                        )
                                    }`}>
                                        {entry.summary.pointsOutOfTolerance} / {entry.comparisons.length} Out of Tolerance
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onExport(entry);
                                        }}
                                        className="text-blue-600 hover:text-blue-900"
                                    >
                                        Export
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">Total Sessions</div>
                    <div className="mt-1 text-2xl font-semibold">{history.length}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">Total Points Measured</div>
                    <div className="mt-1 text-2xl font-semibold">
                        {history.reduce((sum, entry) => sum + entry.comparisons.length, 0)}
                    </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">Average Deviation</div>
                    <div className="mt-1 text-2xl font-semibold">
                        {(history.reduce((sum, entry) => sum + entry.summary.averageDeviation, 0) / history.length).toFixed(1)}
                    </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">Out of Tolerance Rate</div>
                    <div className="mt-1 text-2xl font-semibold">
                        {Math.round(
                            (history.reduce((sum, entry) => sum + entry.summary.pointsOutOfTolerance, 0) /
                                history.reduce((sum, entry) => sum + entry.comparisons.length, 0)) *
                                100
                        )}%
                    </div>
                </div>
            </div>
        </div>
    );
}

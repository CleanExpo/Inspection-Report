'use client';

import React from 'react';
import { MeasurementTemplate } from './types';

interface TemplateSelectorProps {
    templates: MeasurementTemplate[];
    selectedTemplate?: string;
    onSelect: (templateId: string) => void;
}

const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    });
};

export function TemplateSelector({ templates, selectedTemplate, onSelect }: TemplateSelectorProps) {
    return (
        <div className="space-y-4">
            {templates.map((template) => (
                <div
                    key={template.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedTemplate === template.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => onSelect(template.id)}
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-semibold">{template.name}</h3>
                            <p className="text-gray-600 mt-1">{template.description}</p>
                        </div>
                        <div className="text-sm text-gray-500">
                            {template.points.length} points
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="font-medium">Grid Spacing:</span>{' '}
                            {template.gridSpacing}m
                        </div>
                        <div>
                            <span className="font-medium">Last Updated:</span>{' '}
                            {formatDate(template.updatedAt)}
                        </div>
                    </div>

                    <div className="mt-4 flex gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span>Dry: {template.referenceValues.dry}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <span>Warning: {template.referenceValues.warning}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span>Critical: {template.referenceValues.critical}</span>
                        </div>
                    </div>

                    {selectedTemplate === template.id && (
                        <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                            {template.points.map((point) => (
                                <div
                                    key={point.id}
                                    className="p-2 bg-white border rounded flex justify-between items-center"
                                >
                                    <span>{point.label}</span>
                                    <span className="text-gray-500">
                                        ({point.x}, {point.y})
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

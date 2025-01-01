'use client';

import { useState } from 'react';
import {
  MeasurementTemplate,
  ROOM_TEMPLATES,
  validateMeasurements,
  suggestMeasurementPoints
} from '../utils/measurementTemplates';

interface MeasurementTemplateSelectorProps {
  onTemplateSelect: (template: MeasurementTemplate) => void;
  currentArea?: number | undefined;
  currentPerimeter?: number | undefined;
}

export default function MeasurementTemplateSelector({
  onTemplateSelect,
  currentArea,
  currentPerimeter
}: MeasurementTemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<MeasurementTemplate['category']>('residential');
  const [selectedTemplate, setSelectedTemplate] = useState<MeasurementTemplate | null>(null);

  const categories: Array<{
    id: MeasurementTemplate['category'];
    label: string;
  }> = [
    { id: 'residential', label: 'Residential' },
    { id: 'commercial', label: 'Commercial' },
    { id: 'industrial', label: 'Industrial' }
  ];

  const filteredTemplates = ROOM_TEMPLATES.filter(
    template => template.category === selectedCategory
  );

  const handleTemplateSelect = (template: MeasurementTemplate) => {
    setSelectedTemplate(template);
    onTemplateSelect(template);
  };

  const getValidationInfo = () => {
    if (!selectedTemplate) return null;

    const validation = validateMeasurements(
      currentArea,
      currentPerimeter,
      selectedTemplate
    );

    // Only calculate suggested points if we have an area measurement
    const suggestedPoints = currentArea !== undefined
      ? suggestMeasurementPoints(currentArea, selectedTemplate)
      : selectedTemplate.suggestedPoints || 0;

    return { validation, suggestedPoints };
  };

  const validationInfo = getValidationInfo();

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Room Templates</h3>
      </div>

      {/* Category Selection */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex space-x-4">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1 text-sm rounded ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Template List */}
      <div className="px-4 py-3 space-y-3">
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            className={`p-3 rounded border cursor-pointer transition-colors ${
              selectedTemplate?.id === template.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => handleTemplateSelect(template)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900">{template.name}</h4>
                <p className="text-sm text-gray-500">{template.description}</p>
              </div>
              <div className="text-sm text-gray-500">
                {template.defaultArea && (
                  <div>{template.defaultArea.toFixed(1)} m²</div>
                )}
              </div>
            </div>

            {selectedTemplate?.id === template.id && template.notes && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <h5 className="text-sm font-medium text-gray-900 mb-2">
                  Measurement Notes:
                </h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  {template.notes.map((note, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Validation Info */}
      {validationInfo && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="text-sm">
            {currentArea !== undefined && validationInfo.validation.areaDeviation > 0 && (
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Area Deviation:</span>
                <span
                  className={
                    validationInfo.validation.areaDeviation <= 20
                      ? 'text-green-600'
                      : 'text-yellow-600'
                  }
                >
                  {validationInfo.validation.areaDeviation.toFixed(1)}%
                </span>
              </div>
            )}
            {currentPerimeter !== undefined && validationInfo.validation.perimeterDeviation > 0 && (
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Perimeter Deviation:</span>
                <span
                  className={
                    validationInfo.validation.perimeterDeviation <= 20
                      ? 'text-green-600'
                      : 'text-yellow-600'
                  }
                >
                  {validationInfo.validation.perimeterDeviation.toFixed(1)}%
                </span>
              </div>
            )}
            {(currentArea !== undefined || currentPerimeter !== undefined) && (
              <div className="flex justify-between">
                <span className="text-gray-600">Within Tolerance:</span>
                <span className={`text-sm font-medium ${
                  validationInfo.validation.isWithinTolerance
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {validationInfo.validation.isWithinTolerance ? 'Yes' : 'No'}
                </span>
              </div>
            )}
            <div className="flex justify-between mt-2">
              <span className="text-gray-600">Suggested Points:</span>
              <span className="text-blue-600">
                {validationInfo.suggestedPoints}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

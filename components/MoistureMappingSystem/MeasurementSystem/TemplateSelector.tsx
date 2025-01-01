import React from 'react';
import { format } from 'date-fns';
import { TemplateSelectorProps, MeasurementTemplate } from './types';

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  selectedTemplate,
  onSelect
}) => {
  const handleTemplateClick = (templateId: string) => {
    onSelect(templateId);
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), 'MM/dd/yyyy');
  };

  const renderTemplateCard = (template: MeasurementTemplate) => {
    const isSelected = template.id === selectedTemplate;
    
    return (
      <div
        key={template.id}
        className={`p-4 border rounded-lg cursor-pointer transition-all ${
          isSelected
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 hover:border-blue-300'
        }`}
        onClick={() => handleTemplateClick(template.id)}
      >
        <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
        <p className="text-gray-600 mb-3">{template.description}</p>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Points:</span>
            <span className="font-medium">{template.points.length}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Grid Spacing:</span>
            <span className="font-medium">{template.gridSpacing}m</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Reference Values:</span>
            <span className="font-medium">
              {template.referenceValues.dry}/{template.referenceValues.warning}/
              {template.referenceValues.critical}
            </span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Last Updated:</span>
            <span className="font-medium">
              {formatDate(template.updatedAt)}
            </span>
          </div>
        </div>
        
        {isSelected && (
          <div className="mt-4 pt-4 border-t border-blue-200">
            <h4 className="text-sm font-semibold mb-2">Measurement Points:</h4>
            <div className="grid grid-cols-2 gap-2">
              {template.points.map((point) => (
                <div
                  key={point.id}
                  className="text-xs p-2 bg-white rounded border border-blue-100"
                >
                  {point.label} ({point.x}, {point.y})
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map(renderTemplateCard)}
      </div>
      
      {templates.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No measurement templates available
        </div>
      )}
    </div>
  );
};

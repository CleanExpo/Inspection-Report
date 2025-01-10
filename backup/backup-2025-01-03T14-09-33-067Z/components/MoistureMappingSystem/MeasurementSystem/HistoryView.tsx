import React, { useState } from 'react';
import { format } from 'date-fns';
import { HistoryViewProps, MeasurementHistory } from './types';

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  templates,
  onSelectEntry,
  onExport
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>();
  const [dateRange, setDateRange] = useState<{
    start?: Date;
    end?: Date;
  }>({});

  const filteredHistory = history.filter((entry) => {
    let matches = true;

    if (selectedTemplateId) {
      matches = matches && entry.templateId === selectedTemplateId;
    }

    if (dateRange.start) {
      matches = matches && entry.timestamp >= dateRange.start;
    }

    if (dateRange.end) {
      matches = matches && entry.timestamp <= dateRange.end;
    }

    return matches;
  });

  const getTemplateName = (templateId: string) => {
    return templates.find((t) => t.id === templateId)?.name || 'Unknown Template';
  };

  const handleDateRangeChange = (
    type: 'start' | 'end',
    value: string
  ) => {
    const date = value ? new Date(value) : undefined;
    setDateRange((prev) => ({
      ...prev,
      [type]: date
    }));
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), 'PPpp');
  };

  const renderHistoryEntry = (entry: MeasurementHistory) => {
    const template = templates.find((t) => t.id === entry.templateId);
    if (!template) return null;

    return (
      <div
        key={entry.sessionId}
        className="border rounded-lg p-4 hover:border-blue-300 cursor-pointer transition-all"
        onClick={() => onSelectEntry(entry)}
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-semibold">
              {getTemplateName(entry.templateId)}
            </h3>
            <p className="text-sm text-gray-500">
              {formatDate(entry.timestamp)}
            </p>
          </div>
          <button
            className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
            onClick={(e) => {
              e.stopPropagation();
              onExport(entry);
            }}
          >
            Export
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-gray-500">Points Measured</div>
            <div className="font-medium">{entry.comparisons.length}</div>
          </div>
          <div>
            <div className="text-gray-500">Out of Tolerance</div>
            <div className="font-medium">{entry.summary.pointsOutOfTolerance}</div>
          </div>
          <div>
            <div className="text-gray-500">Max Deviation</div>
            <div className="font-medium">
              {entry.summary.maxDeviation.toFixed(1)}
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t">
          <div className="text-sm text-gray-500 mb-2">Comparison Summary</div>
          <div className="space-y-1">
            {entry.comparisons.map((comparison) => (
              <div
                key={comparison.point.id}
                className="text-xs flex justify-between"
              >
                <span>{comparison.point.label}</span>
                <span
                  className={
                    comparison.withinTolerance
                      ? 'text-green-600'
                      : 'text-red-600'
                  }
                >
                  {comparison.actualValue} (
                  {comparison.deviation > 0 ? '+' : ''}
                  {comparison.deviation.toFixed(1)})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template
            </label>
            <select
              className="w-full px-3 py-2 border rounded"
              value={selectedTemplateId || ''}
              onChange={(e) => setSelectedTemplateId(e.target.value || undefined)}
            >
              <option value="">All Templates</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border rounded"
              value={dateRange.start?.toISOString().split('T')[0] || ''}
              onChange={(e) => handleDateRangeChange('start', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border rounded"
              value={dateRange.end?.toISOString().split('T')[0] || ''}
              onChange={(e) => handleDateRangeChange('end', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {filteredHistory.map(renderHistoryEntry)}
        
        {filteredHistory.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No measurement history available
            {(selectedTemplateId || dateRange.start || dateRange.end) &&
              ' for the selected filters'}
          </div>
        )}
      </div>
    </div>
  );
};

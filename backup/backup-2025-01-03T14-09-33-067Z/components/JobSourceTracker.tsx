"use client";

import { useState } from 'react';

export default function JobSourceTracker() {
  const [selectedSource, setSelectedSource] = useState('');
  const [requiredDocs, setRequiredDocs] = useState<string[]>([]);

  const jobSources = [
    { id: 'internet', label: 'Internet Search', icon: '🔍' },
    { id: 'referral', label: 'Referral', icon: '👥' },
    { id: 'insurance', label: 'Insurance Agent', icon: '📋' },
    { id: 'property', label: 'Property Manager', icon: '🏢' },
    { id: 'facility', label: 'Facility Management', icon: '🏗️' },
    { id: 'other', label: 'Other Sources', icon: '📌' }
  ];

  const documentationTypes = [
    { id: 'crm', label: 'CRM Data', required: true },
    { id: 'portal', label: 'Third-party Portal Submission', required: false },
    { id: 'inspection', label: 'Inspection Report', required: true },
    { id: 'photos', label: 'Site Photographs', required: true },
    { id: 'videos', label: 'Video Documentation', required: false },
    { id: 'mapping', label: 'Mapping Information', required: true },
    { id: 'scope', label: 'Scope of Work', required: true },
    { id: 'invoice', label: 'Invoices', required: true }
  ];

  const handleSourceSelect = (sourceId: string) => {
    setSelectedSource(sourceId);
    // Update required documentation based on source
    const baseRequirements = documentationTypes
      .filter(doc => doc.required)
      .map(doc => doc.id);
    
    // Add additional requirements based on source
    switch (sourceId) {
      case 'insurance':
        setRequiredDocs([...baseRequirements, 'portal']);
        break;
      case 'property':
      case 'facility':
        setRequiredDocs([...baseRequirements, 'videos']);
        break;
      default:
        setRequiredDocs(baseRequirements);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Job Source & Documentation</h2>
      
      {/* Job Sources */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Select Job Source</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {jobSources.map((source) => (
            <button
              key={source.id}
              onClick={() => handleSourceSelect(source.id)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                selectedSource === source.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <span className="text-2xl mb-2">{source.icon}</span>
              <p className="text-sm font-medium text-gray-900">{source.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Required Documentation */}
      {selectedSource && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Required Documentation</h3>
          <div className="space-y-3">
            {documentationTypes.map((doc) => (
              <div
                key={doc.id}
                className={`flex items-center p-3 rounded-lg ${
                  requiredDocs.includes(doc.id)
                    ? 'bg-yellow-50 border border-yellow-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{doc.label}</p>
                  {requiredDocs.includes(doc.id) && (
                    <p className="text-xs text-yellow-600">Required for this job source</p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  {requiredDocs.includes(doc.id) ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Required
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Optional
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

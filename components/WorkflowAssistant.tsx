"use client";

import { useState } from 'react';

export default function WorkflowAssistant() {
  const [selectedBottleneck, setSelectedBottleneck] = useState('');
  const [showSolution, setShowSolution] = useState(false);

  const commonBottlenecks = [
    {
      id: 'double-handling',
      title: 'Double Data Handling',
      description: 'Data being transferred multiple times between systems',
      solution: {
        title: 'Automated Data Sync',
        steps: [
          'Use the built-in API integrations to connect CRM and inspection reports',
          'Enable auto-sync feature for real-time data updates',
          'Verify data consistency across platforms'
        ],
        automationTip: 'Voice commands can be used to update multiple systems simultaneously'
      }
    },
    {
      id: 'tech-workload',
      title: 'Technician Documentation Load',
      description: 'Excessive time spent on paperwork instead of restoration',
      solution: {
        title: 'Smart Documentation Tools',
        steps: [
          'Use voice-to-text for field notes',
          'Capture photos with auto-tagging and categorization',
          'Enable location-based automatic data entry'
        ],
        automationTip: 'LiDAR scanning can automatically generate room measurements and diagrams'
      }
    },
    {
      id: 'incomplete-info',
      title: 'Incomplete Information',
      description: 'Missing or unclear documentation from field teams',
      solution: {
        title: 'Guided Data Collection',
        steps: [
          'Follow the smart checklist for each job type',
          'Use photo verification for critical steps',
          'Complete real-time validation checks'
        ],
        automationTip: 'AI assistant can flag missing information before job completion'
      }
    }
  ];

  const handleBottleneckSelect = (id: string) => {
    setSelectedBottleneck(id);
    setShowSolution(true);
  };

  const selectedIssue = commonBottlenecks.find(b => b.id === selectedBottleneck);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Workflow Assistant</h2>

      {/* Bottleneck Selection */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Select Current Challenge</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {commonBottlenecks.map((bottleneck) => (
            <button
              key={bottleneck.id}
              onClick={() => handleBottleneckSelect(bottleneck.id)}
              className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                selectedBottleneck === bottleneck.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <h4 className="font-medium text-gray-900">{bottleneck.title}</h4>
              <p className="mt-1 text-sm text-gray-600">{bottleneck.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Solution Display */}
      {showSolution && selectedIssue && (
        <div className="mt-8 border-t pt-6">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {selectedIssue.solution.title}
            </h3>
            
            <div className="space-y-6">
              {/* Steps */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Recommended Steps:</h4>
                <ul className="space-y-2">
                  {selectedIssue.solution.steps.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="ml-3 text-gray-600">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Automation Tip */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="ml-2 text-sm font-medium text-blue-900">Automation Tip</span>
                </div>
                <p className="mt-2 text-sm text-blue-800">{selectedIssue.solution.automationTip}</p>
              </div>

              {/* Training Resources */}
              <div className="mt-4">
                <button className="inline-flex items-center px-4 py-2 border border-purple-300 rounded-md shadow-sm text-sm font-medium text-purple-700 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  View Training Materials
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

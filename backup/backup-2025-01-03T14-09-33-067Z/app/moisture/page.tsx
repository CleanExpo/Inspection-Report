'use client';

import { useState } from 'react';
import MoistureReadingForm from './components/MoistureReadingForm';
import ReadingsList from './components/ReadingsList';
import ReadingAnalytics from './components/ReadingAnalytics';

type Tab = 'list' | 'analytics' | 'new';

export default function MoisturePage() {
  const [activeTab, setActiveTab] = useState<Tab>('list');
  const [jobId, setJobId] = useState<string>(''); // This would typically come from your job context/state

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/moisture/readings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save reading');
      }

      // Switch back to list view after successful submission
      setActiveTab('list');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to save reading');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with Job Selection */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Moisture Readings
          </h1>
          <div className="flex items-center space-x-4">
            <div>
              <label htmlFor="jobId" className="sr-only">
                Job ID
              </label>
              <input
                type="text"
                id="jobId"
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                placeholder="Enter Job ID"
                pattern="\d{4}-\d{4}-\d{3}"
                className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <button
              onClick={() => setActiveTab('new')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              New Reading
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <nav className="flex space-x-4" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              activeTab === 'list'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Readings List
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              activeTab === 'analytics'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Analytics
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white shadow rounded-lg">
        {!jobId ? (
          <div className="p-8 text-center text-gray-500">
            Please enter a Job ID to view readings
          </div>
        ) : activeTab === 'new' ? (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">New Reading</h2>
            <MoistureReadingForm
              jobId={jobId}
              onSubmit={handleSubmit}
            />
          </div>
        ) : activeTab === 'analytics' ? (
          <div className="p-6">
            <ReadingAnalytics jobId={jobId} />
          </div>
        ) : (
          <div className="p-6">
            <ReadingsList jobId={jobId} />
          </div>
        )}
      </div>
    </div>
  );
}

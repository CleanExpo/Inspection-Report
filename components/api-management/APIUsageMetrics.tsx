"use client";

import { useState, useEffect } from 'react';
import { APICredential } from '../../services/apiCredentialService';

interface APIUsageMetricsProps {
  credentials: APICredential[];
}

interface UsageMetrics {
  totalCalls: number;
  successRate: number;
  averageLatency: number;
  costPerCall: number;
  totalCost: number;
}

export default function APIUsageMetrics({ credentials }: APIUsageMetricsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [metrics, setMetrics] = useState<Record<string, UsageMetrics>>({});

  // Simulated metrics data - in production, this would fetch from your backend
  useEffect(() => {
    const generateMetrics = () => {
      const newMetrics: Record<string, UsageMetrics> = {};
      credentials.forEach((cred) => {
        newMetrics[cred.id] = {
          totalCalls: Math.floor(Math.random() * 1000),
          successRate: 95 + Math.random() * 5,
          averageLatency: Math.floor(Math.random() * 200),
          costPerCall: 0.001 + Math.random() * 0.009,
          totalCost: Math.random() * 100,
        };
      });
      setMetrics(newMetrics);
    };

    generateMetrics();
  }, [credentials, selectedPeriod]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 3,
    }).format(amount);
  };

  const getTotalCost = () => {
    return Object.values(metrics).reduce((sum, m) => sum + m.totalCost, 0);
  };

  const getAverageSuccessRate = () => {
    const rates = Object.values(metrics).map((m) => m.successRate);
    return rates.length ? rates.reduce((a, b) => a + b) / rates.length : 0;
  };

  return (
    <div className="space-y-6">
      {/* Time Period Selection */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Usage Statistics</h3>
        <div className="flex space-x-2">
          {(['day', 'week', 'month'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                selectedPeriod === period
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-sm font-medium text-gray-500">Total Cost</h4>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {formatCurrency(getTotalCost())}
          </p>
          <p className="mt-2 text-sm text-gray-500">For selected period</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-sm font-medium text-gray-500">Success Rate</h4>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {getAverageSuccessRate().toFixed(1)}%
          </p>
          <p className="mt-2 text-sm text-gray-500">Average across all APIs</p>
        </div>
      </div>

      {/* Per API Metrics */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">API Usage Details</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {credentials.map((cred) => {
            const credMetrics = metrics[cred.id];
            if (!credMetrics) return null;

            return (
              <div
                key={cred.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h4 className="text-lg font-medium text-gray-900 mb-4">{cred.name}</h4>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Total API Calls</dt>
                    <dd className="mt-1 text-2xl font-semibold text-gray-900">
                      {credMetrics.totalCalls.toLocaleString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Success Rate</dt>
                    <dd className="mt-1 text-2xl font-semibold text-gray-900">
                      {credMetrics.successRate.toFixed(1)}%
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Average Latency</dt>
                    <dd className="mt-1 text-2xl font-semibold text-gray-900">
                      {credMetrics.averageLatency}ms
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Cost per Call</dt>
                    <dd className="mt-1 text-2xl font-semibold text-gray-900">
                      {formatCurrency(credMetrics.costPerCall)}
                    </dd>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <dt className="text-sm font-medium text-gray-500">Total Cost</dt>
                    <dd className="mt-1 text-2xl font-semibold text-blue-600">
                      {formatCurrency(credMetrics.totalCost)}
                    </dd>
                  </div>
                </dl>
              </div>
            );
          })}
        </div>
      </div>

      {/* Download Report Button */}
      <div className="flex justify-end mt-6">
        <button
          onClick={() => {
            // Implement report download functionality
            console.log('Downloading usage report...');
          }}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg
            className="mr-2 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Download Report
        </button>
      </div>
    </div>
  );
}

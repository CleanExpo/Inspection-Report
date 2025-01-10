"use client";

import { useState } from 'react';
import { NewAPICredential } from '../../services/apiCredentialService';

interface APICredentialFormProps {
  onSubmit: (credential: NewAPICredential) => Promise<void>;
}

export default function APICredentialForm({ onSubmit }: APICredentialFormProps) {
  const initialFormState = {
    name: '',
    type: '',
    key: '',
    endpoint: '',
    secret: '',
  };

  const [formData, setFormData] = useState<NewAPICredential & { type: string }>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedValue = value.trim();
    
    if (name === 'type') {
      setSelectedType(updatedValue);
      setFormData((prev) => ({ ...prev, type: updatedValue }));
    } else if (name === 'name') {
      // Allow spaces in name field while typing
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: updatedValue }));
    }
    
    setTouched((prev) => ({ ...prev, [name]: true }));
    setValidationError(null);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setSelectedType('');
    setTouched({});
    setValidationError(null);
  };

  const validateForm = () => {
    // Mark all fields as touched when validating
    setTouched({
      name: true,
      type: true,
      key: true,
      endpoint: formData.endpoint ? true : false,
    });

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      setValidationError('Please enter an integration name');
      return false;
    }

    if (!selectedType) {
      setValidationError('Please select an API type');
      return false;
    }

    const trimmedKey = formData.key.trim();
    if (!trimmedKey) {
      setValidationError('Please enter an API key');
      return false;
    }

    const trimmedEndpoint = formData.endpoint?.trim();
    if (trimmedEndpoint && !trimmedEndpoint.match(/^https?:\/\/.+/)) {
      setValidationError('Please enter a valid API endpoint URL');
      return false;
    }

    // Update form data with trimmed values before submission
    setFormData(prev => ({
      ...prev,
      name: trimmedName,
      key: trimmedKey,
      endpoint: trimmedEndpoint || '',
      type: selectedType,
    }));

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/credentials/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          type: selectedType,
          key: formData.key.trim(),
          endpoint: formData.endpoint?.trim() || undefined,
          secret: formData.secret?.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save credentials');
      }

      await response.json();
      resetForm();
    } catch (error) {
      console.error('Error submitting form:', error);
      setValidationError(error instanceof Error ? error.message : 'Failed to save credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="rounded-md bg-yellow-50 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">API Configuration Required</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Environment variables for API keys and endpoints need to be configured. Please check the .env.example file for required variables.</p>
            </div>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Integration Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
            touched.name && !formData.name ? 'border-red-300 ring-red-300' : 'border-gray-300'
          }`}
          placeholder="e.g., Payment Gateway API"
        />
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          API Type
        </label>
        <select
          id="type"
          name="type"
          required
          value={selectedType}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
            touched.type && !selectedType ? 'border-red-300 ring-red-300' : 'border-gray-300'
          }`}
        >
          <option value="">Select API Type</option>
          <option value="rest">REST API</option>
          <option value="graphql">GraphQL</option>
          <option value="oauth2">OAuth 2.0</option>
        </select>
      </div>

      <div>
        <label htmlFor="key" className="block text-sm font-medium text-gray-700">
          API Key
        </label>
        <input
          type="text"
          id="key"
          name="key"
          required
          value={formData.key || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
            touched.key && !formData.key ? 'border-red-300 ring-red-300' : 'border-gray-300'
          }`}
          placeholder="Enter your API key"
        />
      </div>

      {selectedType === 'oauth2' && (
        <div>
          <label htmlFor="secret" className="block text-sm font-medium text-gray-700">
            Client Secret
          </label>
          <div className="relative mt-1">
            <input
              type={showSecret ? 'text' : 'password'}
              id="secret"
              name="secret"
              value={formData.secret || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter client secret"
            />
            <button
              type="button"
              onClick={() => setShowSecret(!showSecret)}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
            >
              {showSecret ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="endpoint" className="block text-sm font-medium text-gray-700">
          API Endpoint
        </label>
        <input
          type="text"
          id="endpoint"
          name="endpoint"
          value={formData.endpoint || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
            touched.endpoint && formData.endpoint && !formData.endpoint.match(/^https?:\/\/.+/)
              ? 'border-red-300 ring-red-300'
              : 'border-gray-300'
          }`}
          placeholder="https://api.example.com/v1"
        />
      </div>

      {validationError && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{validationError}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? 'Saving...' : 'Save Credentials'}
        </button>
      </div>
      </form>
    </>
  );
}

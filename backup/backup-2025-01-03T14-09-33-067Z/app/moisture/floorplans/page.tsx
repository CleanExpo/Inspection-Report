'use client';

import { useState } from 'react';
import FloorPlanViewer from '../components/FloorPlanViewer';

interface FloorPlanUploadProps {
  jobId: string;
  onUploadComplete: () => void;
}

function FloorPlanUpload({ jobId, onUploadComplete }: FloorPlanUploadProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    setLoading(true);
    setError(null);

    try {
      // First upload the image file
      const imageFile = formData.get('image') as File;
      if (!imageFile) {
        throw new Error('No image file selected');
      }

      // Upload the file
      const uploadFormData = new FormData();
      uploadFormData.append('file', imageFile);

      const uploadResponse = await fetch('/api/moisture/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(error.message || 'Failed to upload image');
      }

      const uploadResult = await uploadResponse.json();
      const imageUrl = uploadResult.files[0].url;

      // Get image dimensions
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });

      // Create floor plan with uploaded image URL
      const response = await fetch('/api/moisture/floorplan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          name: formData.get('name'),
          level: parseInt(formData.get('level') as string),
          imageUrl,
          width: img.naturalWidth,
          height: img.naturalHeight,
          scale: parseFloat(formData.get('scale') as string)
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create floor plan');
      }

      form.reset();
      onUploadComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload floor plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          name="name"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Level
        </label>
        <input
          type="number"
          name="level"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Scale (meters per pixel)
        </label>
        <input
          type="number"
          name="scale"
          step="0.001"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Floor Plan Image
        </label>
        <input
          type="file"
          name="image"
          accept="image/*"
          required
          className="mt-1 block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Uploading...' : 'Upload Floor Plan'}
        </button>
      </div>
    </form>
  );
}

export default function FloorPlansPage() {
  const [jobId, setJobId] = useState<string>('');
  const [showUpload, setShowUpload] = useState(false);

  const handleUploadComplete = () => {
    setShowUpload(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Floor Plans
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
              onClick={() => setShowUpload(!showUpload)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {showUpload ? 'Cancel Upload' : 'Upload Floor Plan'}
            </button>
          </div>
        </div>
      </div>

      {!jobId ? (
        <div className="text-center p-8 text-gray-500">
          Please enter a Job ID to view or upload floor plans
        </div>
      ) : showUpload ? (
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold mb-4">Upload New Floor Plan</h2>
          <FloorPlanUpload
            jobId={jobId}
            onUploadComplete={handleUploadComplete}
          />
        </div>
      ) : (
        <FloorPlanViewer
          jobId={jobId}
          onAnnotationCreate={async (annotation) => {
            const response = await fetch('/api/moisture/annotation', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(annotation),
            });

            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.message || 'Failed to create annotation');
            }
          }}
          onAnnotationUpdate={async (id, annotation) => {
            const response = await fetch(`/api/moisture/annotation/${id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(annotation),
            });

            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.message || 'Failed to update annotation');
            }
          }}
          onAnnotationDelete={async (id) => {
            const response = await fetch(`/api/moisture/annotation/${id}`, {
              method: 'DELETE',
            });

            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.message || 'Failed to delete annotation');
            }
          }}
        />
      )}
    </div>
  );
}

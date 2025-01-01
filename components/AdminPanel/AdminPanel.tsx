import React, { useState } from "react";

interface Settings {
  maxUploadSize: number;
  apiRateLimit: number;
}

const AdminPanel: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    maxUploadSize: 5,
    apiRateLimit: 1000,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validateSettings = (): boolean => {
    if (settings.maxUploadSize <= 0) {
      setError("Max upload size must be greater than 0");
      return false;
    }
    if (settings.apiRateLimit <= 0) {
      setError("API rate limit must be greater than 0");
      return false;
    }
    return true;
  };

  const handleSaveSettings = async () => {
    setError(null);
    setSuccessMessage(null);

    if (!validateSettings()) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/saveSettings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setSuccessMessage("Settings updated successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Admin Panel</h2>
          <span className="text-sm text-gray-500">System Configuration</span>
        </div>

        <div className="space-y-6">
          {/* Max Upload Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Upload Size (MB)
            </label>
            <input
              type="number"
              min="1"
              value={settings.maxUploadSize}
              onChange={(e) => setSettings({ 
                ...settings, 
                maxUploadSize: Math.max(1, Number(e.target.value)) 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Maximum allowed file size for uploads in megabytes
            </p>
          </div>

          {/* API Rate Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Rate Limit (requests per hour)
            </label>
            <input
              type="number"
              min="1"
              value={settings.apiRateLimit}
              onChange={(e) => setSettings({ 
                ...settings, 
                apiRateLimit: Math.max(1, Number(e.target.value)) 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Maximum number of API requests allowed per hour
            </p>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-600">{successMessage}</p>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={isSaving}
              className={`px-4 py-2 rounded-md text-white font-medium ${
                isSaving
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              }`}
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

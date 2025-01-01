import { useState, useEffect, useCallback } from 'react';
import { BusinessSettings } from '../types/business';
import { 
  defaultBusinessSettings, 
  validateBusinessConfig,
  applyBusinessTheme 
} from '../utils/businessConfig';

const STORAGE_KEY = 'moisture-mapping-business-settings';

export function useBusinessSettings() {
  const [settings, setSettings] = useState<BusinessSettings>(defaultBusinessSettings);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from storage on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as BusinessSettings;
          setSettings(parsed);
          applyBusinessTheme(parsed);
        }
      } catch (error) {
        console.error('Failed to load business settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Save settings to storage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        applyBusinessTheme(settings);
      } catch (error) {
        console.error('Failed to save business settings:', error);
      }
    }
  }, [settings, isLoading]);

  // Update settings with validation
  const updateSettings = useCallback((updates: Partial<BusinessSettings>) => {
    const newSettings = { ...settings, ...updates };
    const validationErrors = validateBusinessConfig(newSettings);
    setErrors(validationErrors);

    if (validationErrors.length === 0) {
      setSettings(newSettings);
      return true;
    }
    return false;
  }, [settings]);

  // Reset settings to defaults
  const resetSettings = useCallback(() => {
    setSettings(defaultBusinessSettings);
    setErrors([]);
  }, []);

  // Update specific sections
  const updateBranding = useCallback((colors: { primary?: string; secondary?: string }, logo?: string) => {
    setSettings(prev => ({
      ...prev,
      branding: {
        ...prev.branding,
        colors: {
          ...prev.branding.colors,
          ...(colors || {})
        },
        ...(logo ? { logo } : {})
      }
    }));
  }, []);

  const updatePreferences = useCallback((
    preferences: Partial<BusinessSettings['preferences']>
  ) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        ...preferences
      }
    }));
  }, []);

  const updateReporting = useCallback((
    reporting: Partial<BusinessSettings['reporting']>
  ) => {
    setSettings(prev => ({
      ...prev,
      reporting: {
        ...prev.reporting,
        ...reporting
      }
    }));
  }, []);

  return {
    settings,
    errors,
    isLoading,
    updateSettings,
    resetSettings,
    updateBranding,
    updatePreferences,
    updateReporting
  };
}

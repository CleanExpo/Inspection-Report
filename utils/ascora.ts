interface AscoraConfig {
  apiKey: string;
  baseUrl: string;
}

interface AscoraResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

class AscoraAPI {
  private config: AscoraConfig;

  constructor() {
    this.config = {
      apiKey: process.env.ASCORA_API_KEY || '',
      baseUrl: process.env.ASCORA_BASE_URL || 'https://api.ascora.com'
    };

    if (!this.config.apiKey) {
      throw new Error('Ascora API key is not configured');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<AscoraResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const [apiKey, clientId] = this.config.apiKey.split(':');

    const headers = {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
      'X-Client-ID': clientId,
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: data.error?.code || 'UNKNOWN_ERROR',
            message: data.error?.message || 'An unknown error occurred'
          }
        };
      }

      return {
        success: true,
        data: data as T
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'REQUEST_FAILED',
          message: error instanceof Error ? error.message : 'Request failed'
        }
      };
    }
  }

  // Inspection Report Methods
  async createInspection(data: any) {
    return this.request('/v1/inspections', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateInspection(inspectionId: string, data: any) {
    return this.request(`/v1/inspections/${inspectionId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async getInspection(inspectionId: string) {
    return this.request(`/v1/inspections/${inspectionId}`);
  }

  async listInspections(params?: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    return this.request(`/v1/inspections?${queryParams.toString()}`);
  }

  // Document Methods
  async uploadDocument(inspectionId: string, file: File, metadata: any) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));

    return this.request(`/v1/inspections/${inspectionId}/documents`, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type here, let the browser set it with the boundary
      }
    });
  }

  async listDocuments(inspectionId: string) {
    return this.request(`/v1/inspections/${inspectionId}/documents`);
  }

  // Analysis Methods
  async analyzeInspection(inspectionId: string) {
    return this.request(`/v1/inspections/${inspectionId}/analyze`, {
      method: 'POST'
    });
  }

  async getAnalysisResults(inspectionId: string) {
    return this.request(`/v1/inspections/${inspectionId}/analysis`);
  }

  // Validation Methods
  async validateInspection(inspectionId: string) {
    return this.request(`/v1/inspections/${inspectionId}/validate`, {
      method: 'POST'
    });
  }

  async getValidationResults(inspectionId: string) {
    return this.request(`/v1/inspections/${inspectionId}/validation`);
  }

  // Report Generation Methods
  async generateReport(inspectionId: string, options: {
    format: 'pdf' | 'docx';
    template?: string;
    sections?: string[];
  }) {
    return this.request(`/v1/inspections/${inspectionId}/report`, {
      method: 'POST',
      body: JSON.stringify(options)
    });
  }

  // Utility Methods
  async getTemplates() {
    return this.request('/v1/templates');
  }

  async getStandards() {
    return this.request('/v1/standards');
  }
}

// Export a singleton instance
export const ascoraAPI = new AscoraAPI();

// Export types
export type { AscoraResponse };

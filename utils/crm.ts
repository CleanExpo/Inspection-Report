import type { CRMResponse, CRMClientData, CRMError as ICRMError } from '../types/crm';
import type { ClientData } from '../types/client';
import { crmConfig, getCRMHeaders, getCRMEndpoint } from '../config/crm';

export class CRMError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'CRMError';
  }
}

export const fetchCRMData = async (
  page: number = 1,
  pageSize: number = 10
): Promise<CRMResponse> => {
  try {
    const response = await fetch(
      getCRMEndpoint(`inspections?page=${page}&pageSize=${pageSize}`),
      {
        method: 'GET',
        headers: getCRMHeaders()
      }
    );

    if (!response.ok) {
      throw new CRMError(
        'Failed to fetch CRM data',
        response.status,
        await response.json()
      );
    }

    const data = await response.json();
    return {
      data: data.inspections,
      total: data.total,
      page,
      pageSize
    };
  } catch (error) {
    if (error instanceof CRMError) {
      throw error;
    }
    console.error('Error fetching CRM data:', error);
    throw new CRMError('Failed to fetch CRM data');
  }
};

export const saveToCRM = async (data: ClientData & { createdAt?: string; updatedAt?: string }): Promise<void> => {
  try {
    const response = await fetch(
      getCRMEndpoint('inspections'),
      {
        method: 'POST',
        headers: getCRMHeaders(),
        body: JSON.stringify(data)
      }
    );

    if (!response.ok) {
      throw new CRMError(
        'Failed to save to CRM',
        response.status,
        await response.json()
      );
    }
  } catch (error) {
    if (error instanceof CRMError) {
      throw error;
    }
    console.error('Error saving to CRM:', error);
    throw new CRMError('Failed to save to CRM');
  }
};

export const updateInCRM = async (id: string, data: Partial<CRMClientData>): Promise<void> => {
  try {
    const response = await fetch(
      getCRMEndpoint(`inspections/${id}`),
      {
        method: 'PUT',
        headers: getCRMHeaders(),
        body: JSON.stringify(data)
      }
    );

    if (!response.ok) {
      throw new CRMError(
        'Failed to update in CRM',
        response.status,
        await response.json()
      );
    }
  } catch (error) {
    if (error instanceof CRMError) {
      throw error;
    }
    console.error('Error updating in CRM:', error);
    throw new CRMError('Failed to update in CRM');
  }
};

export const deleteFromCRM = async (id: string): Promise<void> => {
  try {
    const response = await fetch(
      getCRMEndpoint(`inspections/${id}`),
      {
        method: 'DELETE',
        headers: getCRMHeaders()
      }
    );

    if (!response.ok) {
      throw new CRMError(
        'Failed to delete from CRM',
        response.status,
        await response.json()
      );
    }
  } catch (error) {
    if (error instanceof CRMError) {
      throw error;
    }
    console.error('Error deleting from CRM:', error);
    throw new CRMError('Failed to delete from CRM');
  }
};

import { PowerReading } from '../components/PowerDetails/PowerDetails';

interface SavePowerReadingsResponse {
  success: boolean;
  message?: string;
}

interface FetchPowerReadingsResponse {
  readings: PowerReading[];
  totalEquipmentPower: number;
}

interface Equipment {
  id: string;
  name: string;
  maxWatts: number;
}

class PowerReadingsService {
  private baseUrl = '/api';

  async fetchPowerReadings(jobNumber: string): Promise<FetchPowerReadingsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/jobs/${jobNumber}/power-readings`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching power readings:', error);
      throw new Error('Failed to fetch power readings. Please try again later.');
    }
  }

  async savePowerReadings(jobNumber: string, readings: PowerReading[]): Promise<SavePowerReadingsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/jobs/${jobNumber}/power-readings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ readings }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save power readings');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error saving power readings:', error);
      throw error instanceof Error ? error : new Error('Failed to save power readings');
    }
  }

  async fetchEquipmentList(): Promise<Equipment[]> {
    try {
      const response = await fetch(`${this.baseUrl}/equipment`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching equipment list:', error);
      // Return mock data as fallback
      return [
        { id: 'dehu-1', name: 'Dehumidifier 1', maxWatts: 1500 },
        { id: 'dehu-2', name: 'Dehumidifier 2', maxWatts: 1500 },
        { id: 'fan-1', name: 'Air Mover 1', maxWatts: 200 },
        { id: 'fan-2', name: 'Air Mover 2', maxWatts: 200 },
      ];
    }
  }

  async validatePowerReadings(readings: PowerReading[]): Promise<SavePowerReadingsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/jobs/validate-power-readings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ readings }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to validate power readings');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error validating power readings:', error);
      throw error instanceof Error ? error : new Error('Failed to validate power readings');
    }
  }

  // Helper method to calculate if readings are within equipment limits
  validateEquipmentLimits(readings: PowerReading[], equipmentList: Equipment[]): boolean {
    return readings.every(reading => {
      const equipment = equipmentList.find(e => e.id === reading.equipmentId);
      return equipment ? reading.watts <= equipment.maxWatts : false;
    });
  }

  // Helper method to validate watts = amps * voltage relationship
  validatePowerCalculations(readings: PowerReading[]): boolean {
    return readings.every(reading => {
      const calculatedWatts = reading.amps * reading.voltage;
      return Math.abs(calculatedWatts - reading.watts) < 1; // Allow for small rounding differences
    });
  }
}

export const powerReadingsService = new PowerReadingsService();

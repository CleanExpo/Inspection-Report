import { renderHook, act } from '@testing-library/react';
import { usePowerReadings } from '@/hooks/usePowerReadings';

describe('usePowerReadings', () => {
  const mockEquipmentList = [
    { id: 'dehu-1', name: 'Dehumidifier 1', maxWatts: 2000 },
    { id: 'dehu-2', name: 'Dehumidifier 2', maxWatts: 1500 }
  ];

  const defaultProps = {
    totalEquipmentPower: 5000,
    equipmentList: mockEquipmentList
  };

  it('should initialize with empty readings', () => {
    const { result } = renderHook(() => usePowerReadings(defaultProps));

    expect(result.current.readings).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.fieldErrors).toEqual({});
  });

  it('should add and remove readings', () => {
    const { result } = renderHook(() => usePowerReadings(defaultProps));

    // Add reading
    act(() => {
      result.current.addReading();
    });

    expect(result.current.readings).toHaveLength(1);
    expect(result.current.readings[0]).toEqual({
      equipmentId: '',
      equipmentName: '',
      watts: 0,
      amps: 0,
      voltage: 0,
      timestamp: expect.any(String)
    });

    // Remove reading
    act(() => {
      result.current.removeReading(0);
    });

    expect(result.current.readings).toHaveLength(0);
  });

  it('should update readings and auto-calculate values', () => {
    const { result } = renderHook(() => usePowerReadings(defaultProps));

    // Add reading
    act(() => {
      result.current.addReading();
    });

    // Update amps and voltage
    act(() => {
      result.current.updateReading(0, 'amps', 10);
      result.current.updateReading(0, 'voltage', 120);
    });

    expect(result.current.readings[0].watts).toBe(1200); // 10A * 120V = 1200W
    expect(result.current.readings[0].amps).toBe(10);
    expect(result.current.readings[0].voltage).toBe(120);
  });

  it('should validate power calculations', () => {
    const { result } = renderHook(() => usePowerReadings(defaultProps));

    act(() => {
      result.current.addReading();
    });

    // Create an inconsistent reading
    const inconsistentReading = {
      equipmentId: '',
      equipmentName: '',
      watts: 1200, // This doesn't match amps * voltage
      amps: 10,
      voltage: 240, // 10A * 240V should be 2400W
      timestamp: new Date().toISOString()
    };

    // Validate the inconsistent reading
    act(() => {
      result.current.validateReading(inconsistentReading, 0);
    });

    expect(result.current.fieldErrors['0-watts']).toBe('Power readings are inconsistent (W = A × V)');
  });

  it('should validate against equipment maximum watts', () => {
    const { result } = renderHook(() => usePowerReadings(defaultProps));

    act(() => {
      result.current.addReading();
      result.current.updateReading(0, 'equipmentId', 'dehu-1');
      result.current.updateReading(0, 'amps', 20);
      result.current.updateReading(0, 'voltage', 120);
    });

    // 20A * 120V = 2400W, which exceeds dehu-1's maxWatts of 2000W
    expect(result.current.fieldErrors['0-watts']).toBe('Exceeds equipment maximum of 2000W');
  });

  it('should calculate total power correctly', () => {
    const { result } = renderHook(() => usePowerReadings(defaultProps));

    act(() => {
      // Add first reading
      result.current.addReading();
      result.current.updateReading(0, 'amps', 10);
      result.current.updateReading(0, 'voltage', 120);

      // Add second reading
      result.current.addReading();
      result.current.updateReading(1, 'amps', 5);
      result.current.updateReading(1, 'voltage', 120);
    });

    expect(result.current.getTotalPower()).toBe(1800); // (10A * 120V) + (5A * 120V) = 1200W + 600W = 1800W
  });

  it('should validate total power against equipment capacity', async () => {
    const { result } = renderHook(() => usePowerReadings({
      ...defaultProps,
      totalEquipmentPower: 1000 // Set low capacity
    }));

    act(() => {
      result.current.addReading();
      result.current.updateReading(0, 'equipmentId', 'dehu-1');
      result.current.updateReading(0, 'amps', 10);
      result.current.updateReading(0, 'voltage', 120);
    });

    const mockSave = jest.fn();
    await act(async () => {
      await result.current.validateAndSaveReadings(mockSave);
    });

    expect(result.current.error).toContain('exceeds equipment capacity');
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('should save readings successfully', async () => {
    const { result } = renderHook(() => usePowerReadings(defaultProps));

    act(() => {
      result.current.addReading();
      result.current.updateReading(0, 'equipmentId', 'dehu-1');
      result.current.updateReading(0, 'equipmentName', 'Dehumidifier 1');
      result.current.updateReading(0, 'amps', 10);
      result.current.updateReading(0, 'voltage', 120);
    });

    const mockSave = jest.fn();
    await act(async () => {
      await result.current.validateAndSaveReadings(mockSave);
    });

    expect(mockSave).toHaveBeenCalledWith(result.current.readings);
    expect(result.current.error).toBeNull();
  });

  it('should handle save errors', async () => {
    const { result } = renderHook(() => usePowerReadings(defaultProps));

    act(() => {
      result.current.addReading();
      result.current.updateReading(0, 'equipmentId', 'dehu-1');
      result.current.updateReading(0, 'amps', 10);
      result.current.updateReading(0, 'voltage', 120);
    });

    const mockSave = jest.fn().mockRejectedValue(new Error('Save failed'));
    await act(async () => {
      await result.current.validateAndSaveReadings(mockSave);
    });

    expect(result.current.error).toBe('Save failed');
  });
});

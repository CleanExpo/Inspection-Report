import { renderHook, act } from '@testing-library/react';
import { useMoistureData } from '@/hooks/useMoistureData';
import { moistureService } from '@/services/moistureService';
import { SketchData, DailyReadings, MoistureReading } from '@/types/moisture';

// Mock the moisture service
jest.mock('@/services/moistureService', () => ({
  moistureService: {
    getSketchData: jest.fn(),
    getReadingHistory: jest.fn(),
    saveSketchData: jest.fn(),
    saveReadingHistory: jest.fn(),
    getDryingProgress: jest.fn(),
    getEstimatedDryingTime: jest.fn(),
    exportData: jest.fn(),
  },
}));

describe('useMoistureData', () => {
  const mockJobId = 'test-job-123';
  
  const mockSketchData: SketchData = {
    room: {
      id: 'room-1',
      width: 500,
      height: 300,
      dimensions: { width: '20', height: '15', unit: 'ft' },
    },
    damageAreas: [],
    equipment: [],
    moistureReadings: [
      {
        id: 'reading-1',
        position: { x: 100, y: 100 },
        value: 15,
        materialType: 'drywall',
        timestamp: new Date().toISOString(),
      },
    ],
  };

  const mockReadingHistory: DailyReadings[] = [
    {
      date: new Date().toISOString().split('T')[0],
      readings: mockSketchData.moistureReadings,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Set up default mock implementations
    (moistureService.getSketchData as jest.Mock).mockResolvedValue(mockSketchData);
    (moistureService.getReadingHistory as jest.Mock).mockResolvedValue(mockReadingHistory);
    (moistureService.getDryingProgress as jest.Mock).mockReturnValue(50);
    (moistureService.getEstimatedDryingTime as jest.Mock).mockReturnValue(3);
  });

  it('loads initial data correctly', async () => {
    const { result } = renderHook(() => useMoistureData({ jobId: mockJobId }));

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();

    // Wait for data to load
    await act(async () => {
      await Promise.resolve();
    });

    // Check loaded data
    expect(result.current.isLoading).toBe(false);
    expect(result.current.sketchData).toEqual(mockSketchData);
    expect(result.current.readingHistory).toEqual(mockReadingHistory);
    expect(result.current.dryingProgress).toBe(50);
    expect(result.current.estimatedDryingTime).toBe(3);
  });

  it('handles save sketch data', async () => {
    const { result } = renderHook(() => useMoistureData({ jobId: mockJobId }));

    // Wait for initial load
    await act(async () => {
      await Promise.resolve();
    });

    const updatedSketchData = {
      ...mockSketchData,
      notes: ['New note'],
    };

    await act(async () => {
      await result.current.saveSketchData(updatedSketchData);
    });

    expect(moistureService.saveSketchData).toHaveBeenCalledWith(mockJobId, updatedSketchData);
    expect(result.current.sketchData).toEqual(updatedSketchData);
  });

  it('handles save reading history', async () => {
    const { result } = renderHook(() => useMoistureData({ jobId: mockJobId }));

    // Wait for initial load
    await act(async () => {
      await Promise.resolve();
    });

    const updatedHistory = [
      ...mockReadingHistory,
      {
        date: '2024-01-02',
        readings: [],
      },
    ];

    await act(async () => {
      await result.current.saveReadingHistory(updatedHistory);
    });

    expect(moistureService.saveReadingHistory).toHaveBeenCalledWith(mockJobId, updatedHistory);
    expect(result.current.readingHistory).toEqual(updatedHistory);
  });

  it('handles add reading', async () => {
    const { result } = renderHook(() => useMoistureData({ jobId: mockJobId }));

    // Wait for initial load
    await act(async () => {
      await Promise.resolve();
    });

    const newReading: Omit<MoistureReading, 'id' | 'timestamp'> = {
      position: { x: 200, y: 200 },
      value: 12,
      materialType: 'wood',
    };

    await act(async () => {
      await result.current.addReading(newReading);
    });

    expect(moistureService.saveSketchData).toHaveBeenCalled();
    const savedData = (moistureService.saveSketchData as jest.Mock).mock.calls[0][1];
    expect(savedData.moistureReadings).toHaveLength(2);
    expect(savedData.moistureReadings[1]).toMatchObject(newReading);
  });

  it('handles update reading', async () => {
    const { result } = renderHook(() => useMoistureData({ jobId: mockJobId }));

    // Wait for initial load
    await act(async () => {
      await Promise.resolve();
    });

    const updates = {
      value: 10,
    };

    await act(async () => {
      await result.current.updateReading('reading-1', updates);
    });

    expect(moistureService.saveSketchData).toHaveBeenCalled();
    const savedData = (moistureService.saveSketchData as jest.Mock).mock.calls[0][1];
    expect(savedData.moistureReadings[0].value).toBe(10);
  });

  it('handles delete reading', async () => {
    const { result } = renderHook(() => useMoistureData({ jobId: mockJobId }));

    // Wait for initial load
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.deleteReading('reading-1');
    });

    expect(moistureService.saveSketchData).toHaveBeenCalled();
    const savedData = (moistureService.saveSketchData as jest.Mock).mock.calls[0][1];
    expect(savedData.moistureReadings).toHaveLength(0);
  });

  it('handles export data', async () => {
    const { result } = renderHook(() => useMoistureData({ jobId: mockJobId }));

    // Wait for initial load
    await act(async () => {
      await Promise.resolve();
    });

    const mockBlob = new Blob(['test'], { type: 'application/json' });
    (moistureService.exportData as jest.Mock).mockResolvedValue(mockBlob);

    await act(async () => {
      await result.current.exportData();
    });

    expect(moistureService.exportData).toHaveBeenCalledWith(mockJobId);
  });

  it('handles errors', async () => {
    const mockError = new Error('Test error');
    (moistureService.getSketchData as jest.Mock).mockRejectedValue(mockError);

    const { result } = renderHook(() => useMoistureData({ jobId: mockJobId }));

    // Wait for error to be set
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.error).toBe(mockError.message);
    expect(result.current.isLoading).toBe(false);
  });
});

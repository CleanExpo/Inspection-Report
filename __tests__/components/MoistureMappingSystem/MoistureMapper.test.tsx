import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { MaterialType } from '@prisma/client';
import { MoistureMapper } from '../../../app/components/MoistureMappingSystem/MoistureMapper';
import { moistureService } from '../../../app/services/moistureService';
import type { MapLayout, MoistureReading } from '../../../app/types/moisture';

// Mock the moisture service
jest.mock('../../../app/services/moistureService', () => ({
  moistureService: {
    updateMap: jest.fn(),
    addReading: jest.fn(),
  },
}));

// Mock child components
jest.mock('../../../app/components/MoistureMappingSystem/MapEditor', () => ({
  MapEditor: ({ layout, onChange }: { layout: MapLayout; onChange?: (layout: MapLayout) => void }) => (
    <div data-testid="mock-map-editor">
      <button
        onClick={() => onChange?.({
          ...layout,
          walls: [...layout.walls, { start: { x: 0, y: 0 }, end: { x: 100, y: 100 } }],
        })}
      >
        Add Wall
      </button>
    </div>
  ),
}));

jest.mock('../../../app/components/MoistureMappingSystem/ReadingDialog', () => ({
  ReadingDialog: ({ onSubmit, onClose }: { onSubmit: any; onClose: () => void }) => (
    <div data-testid="mock-reading-dialog">
      <button onClick={() => onSubmit(15.5, MaterialType.Drywall, 'Test note')}>
        Submit Reading
      </button>
      <button onClick={onClose}>Close Dialog</button>
    </div>
  ),
}));

describe('MoistureMapper', () => {
  const mockMapId = 'test-map-id';
  const initialLayout: MapLayout = {
    walls: [],
    doors: [],
    windows: [],
  };
  const initialReadings: MoistureReading[] = [];

  beforeEach(() => {
    jest.clearAllMocks();
    (moistureService.updateMap as jest.Mock).mockResolvedValue({
      layout: initialLayout,
      readings: initialReadings,
    });
    (moistureService.addReading as jest.Mock).mockResolvedValue({
      layout: initialLayout,
      readings: [
        {
          id: 'test-reading',
          mapId: mockMapId,
          value: 15.5,
          materialType: MaterialType.Drywall,
          location: { x: 100, y: 200 },
          notes: 'Test note',
          timestamp: new Date().toISOString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    });
  });

  it('renders MapEditor component', () => {
    render(
      <MoistureMapper
        mapId={mockMapId}
        initialLayout={initialLayout}
        initialReadings={initialReadings}
      />
    );

    expect(screen.getByTestId('mock-map-editor')).toBeInTheDocument();
  });

  it('updates layout through moisture service', async () => {
    render(
      <MoistureMapper
        mapId={mockMapId}
        initialLayout={initialLayout}
        initialReadings={initialReadings}
      />
    );

    fireEvent.click(screen.getByText('Add Wall'));

    await waitFor(() => {
      expect(moistureService.updateMap).toHaveBeenCalledWith(
        mockMapId,
        expect.objectContaining({
          layout: expect.objectContaining({
            walls: expect.arrayContaining([
              expect.objectContaining({
                start: { x: 0, y: 0 },
                end: { x: 100, y: 100 },
              }),
            ]),
          }),
        })
      );
    });
  });

  it('adds reading through moisture service', async () => {
    render(
      <MoistureMapper
        mapId={mockMapId}
        initialLayout={initialLayout}
        initialReadings={initialReadings}
      />
    );

    // Simulate adding a reading
    fireEvent.click(screen.getByText('Submit Reading'));

    await waitFor(() => {
      expect(moistureService.addReading).toHaveBeenCalledWith(
        mockMapId,
        expect.objectContaining({
          value: 15.5,
          materialType: MaterialType.Drywall,
          notes: 'Test note',
        })
      );
    });
  });

  it('displays loading state during service calls', async () => {
    (moistureService.updateMap as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(
      <MoistureMapper
        mapId={mockMapId}
        initialLayout={initialLayout}
        initialReadings={initialReadings}
      />
    );

    fireEvent.click(screen.getByText('Add Wall'));

    // Loading state should be visible
    expect(screen.getByRole('status')).toBeInTheDocument();

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  it('handles service errors gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    (moistureService.updateMap as jest.Mock).mockRejectedValue(new Error('Test error'));

    render(
      <MoistureMapper
        mapId={mockMapId}
        initialLayout={initialLayout}
        initialReadings={initialReadings}
      />
    );

    fireEvent.click(screen.getByText('Add Wall'));

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        'Failed to update layout:',
        expect.any(Error)
      );
    });

    consoleError.mockRestore();
  });

  it('respects readOnly prop', () => {
    render(
      <MoistureMapper
        mapId={mockMapId}
        initialLayout={initialLayout}
        initialReadings={initialReadings}
        readOnly
      />
    );

    expect(screen.getByTestId('mock-map-editor')).toHaveAttribute('data-readonly', 'true');
  });

  it('renders readings with correct colors', () => {
    const readings: MoistureReading[] = [
      {
        id: '1',
        mapId: mockMapId,
        value: 85, // Severe
        materialType: MaterialType.Drywall,
        location: { x: 100, y: 100 },
        timestamp: new Date().toISOString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        mapId: mockMapId,
        value: 15, // Normal
        materialType: MaterialType.Wood,
        location: { x: 200, y: 200 },
        timestamp: new Date().toISOString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    render(
      <MoistureMapper
        mapId={mockMapId}
        initialLayout={initialLayout}
        initialReadings={readings}
      />
    );

    const readingElements = screen.getAllByRole('presentation');
    expect(readingElements[0]).toHaveStyle({ backgroundColor: '#DC2626' }); // Red for severe
    expect(readingElements[1]).toHaveStyle({ backgroundColor: '#059669' }); // Emerald for normal
  });
});

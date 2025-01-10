import React, { useState, useCallback } from 'react';
import { MaterialType } from '@prisma/client';
import { MapEditor } from './MapEditor';
import { ReadingDialog } from './ReadingDialog';
import { moistureService } from '../../services/moistureService';
import type { MapLayout, Point, MoistureReading } from '../../types/moisture';

interface MoistureMapperProps {
  mapId: string;
  initialLayout: MapLayout;
  initialReadings: MoistureReading[];
  readOnly?: boolean;
  width?: number;
  height?: number;
}

export const MoistureMapper: React.FC<MoistureMapperProps> = ({
  mapId,
  initialLayout,
  initialReadings,
  readOnly = false,
  width,
  height,
}) => {
  const [layout, setLayout] = useState<MapLayout>(initialLayout);
  const [readings, setReadings] = useState<MoistureReading[]>(initialReadings);
  const [isReadingDialogOpen, setIsReadingDialogOpen] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLayoutChange = useCallback(async (newLayout: MapLayout) => {
    try {
      setIsLoading(true);
      const updatedMap = await moistureService.updateMap(mapId, {
        layout: newLayout,
      });
      setLayout(updatedMap.layout);
    } catch (error) {
      console.error('Failed to update layout:', error);
      // TODO: Add error notification
    } finally {
      setIsLoading(false);
    }
  }, [mapId]);

  const handleReadingClick = useCallback((point: Point) => {
    setSelectedPoint(point);
    setIsReadingDialogOpen(true);
  }, []);

  const handleReadingSubmit = useCallback(async (
    value: number,
    materialType: MaterialType,
    notes?: string
  ) => {
    if (!selectedPoint) return;

    try {
      setIsLoading(true);
      const updatedMap = await moistureService.addReading(mapId, {
        value,
        materialType,
        location: selectedPoint,
        notes,
      });
      setReadings(updatedMap.readings);
    } catch (error) {
      console.error('Failed to add reading:', error);
      // TODO: Add error notification
    } finally {
      setIsLoading(false);
      setIsReadingDialogOpen(false);
      setSelectedPoint(null);
    }
  }, [mapId, selectedPoint]);

  const handleReadingDialogClose = useCallback(() => {
    setIsReadingDialogOpen(false);
    setSelectedPoint(null);
  }, []);

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )}

      <MapEditor
        layout={layout}
        onChange={handleLayoutChange}
        readOnly={readOnly || isLoading}
        width={width}
        height={height}
      />

      {selectedPoint && (
        <ReadingDialog
          isOpen={isReadingDialogOpen}
          onClose={handleReadingDialogClose}
          onSubmit={handleReadingSubmit}
          position={selectedPoint}
        />
      )}

      {/* Render readings */}
      <div className="absolute inset-0 pointer-events-none">
        {readings.map((reading) => (
          <div
            key={reading.id}
            className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full flex items-center justify-center text-xs font-medium text-white"
            style={{
              left: reading.location.x,
              top: reading.location.y,
              backgroundColor: getReadingColor(reading.value),
            }}
            title={`${reading.value}% - ${reading.materialType}${reading.notes ? `\n${reading.notes}` : ''}`}
          >
            {Math.round(reading.value)}
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function to get color based on moisture reading value
const getReadingColor = (value: number): string => {
  if (value >= 80) return '#DC2626'; // Red (severe)
  if (value >= 60) return '#EA580C'; // Orange (high)
  if (value >= 40) return '#D97706'; // Amber (moderate)
  if (value >= 20) return '#65A30D'; // Green (elevated)
  return '#059669'; // Emerald (normal)
};

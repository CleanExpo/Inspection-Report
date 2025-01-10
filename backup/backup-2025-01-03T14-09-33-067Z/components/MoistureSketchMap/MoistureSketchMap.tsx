import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { SketchData, MoistureReading, Point, Room, MoistureUnit } from '../../types/moisture';
import { SketchTool } from '../../utils/sketchTool';
import { DataManager } from '../../utils/dataManager';
import styles from '../../styles/MoistureMapping.module.css';

interface VoiceReadingInput {
  value: number;
  unit: string;
  x?: number;
  y?: number;
}

interface MoistureSketchMapProps {
  jobId: string;
  onSave: (data: SketchData) => Promise<void>;
  className?: string;
}

export interface MoistureSketchMapRef {
  addReading: (reading: VoiceReadingInput) => void;
  startDrawing: () => void;
  stopDrawing: () => void;
  setTool: (tool: string) => void;
  setMaterial: (material: string) => void;
  undo: () => void;
}

const MoistureSketchMap = forwardRef<MoistureSketchMapRef, MoistureSketchMapProps>(
  ({ jobId, onSave, className = '' }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sketchToolRef = useRef<SketchTool | null>(null);
    const [currentTool, setCurrentTool] = useState('reading');
    const [currentMaterial, setCurrentMaterial] = useState('drywall');
    const [isDrawing, setIsDrawing] = useState(false);
    const [readings, setReadings] = useState<MoistureReading[]>([]);
    const dataManagerRef = useRef<DataManager | null>(null);

    // Initialize SketchTool and DataManager when canvas is ready
    useEffect(() => {
      if (canvasRef.current) {
        // Set canvas size
        const container = canvasRef.current.parentElement;
        if (container) {
          canvasRef.current.width = container.clientWidth;
          canvasRef.current.height = container.clientHeight;
        }

        // Initialize DataManager
        dataManagerRef.current = new DataManager(jobId);

        // Initialize SketchTool
        sketchToolRef.current = new SketchTool(canvasRef.current);

        // Recover saved data
        if (dataManagerRef.current) {
          const savedData = dataManagerRef.current.getSketchData();
          if (savedData.rooms[0]) {
            const room = savedData.rooms[0];
            sketchToolRef.current.loadElements({
              walls: room.walls,
              doors: room.doors,
              windows: room.windows
            });
          }
          setReadings(savedData.moistureReadings);
        }
        
        // Cleanup on unmount
        return () => {
          if (sketchToolRef.current) {
            sketchToolRef.current.destroy();
          }
        };
      }
    }, []);

    // Handle window resize
    useEffect(() => {
      const handleResize = () => {
        if (canvasRef.current) {
          const container = canvasRef.current.parentElement;
          if (container) {
            canvasRef.current.width = container.clientWidth;
            canvasRef.current.height = container.clientHeight;
          }
          // Redraw everything after resize
          if (sketchToolRef.current) {
            const elements = sketchToolRef.current.getElements();
            sketchToolRef.current = new SketchTool(canvasRef.current);
            sketchToolRef.current.loadElements(elements);
          }
        }
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Save data when elements or readings change
    useEffect(() => {
      if (dataManagerRef.current && sketchToolRef.current) {
        const elements = sketchToolRef.current.getElements();
        const room: Room = {
          id: crypto.randomUUID(),
          name: 'Main Room',
          walls: elements.walls,
          doors: elements.doors,
          windows: elements.windows
        };
        dataManagerRef.current.saveRoomData(room);
      }
    }, []);

    // Save readings when they change
    useEffect(() => {
      if (dataManagerRef.current) {
        readings.forEach(reading => {
          dataManagerRef.current?.addMoistureReading(reading);
        });
      }
    }, [jobId, onSave, readings]);

    // Expose methods to parent through ref
    useImperativeHandle(ref, () => ({
      addReading: (reading: VoiceReadingInput) => {
        if (reading.x === undefined || reading.y === undefined) return;
        
        const newReading: MoistureReading = {
          id: crypto.randomUUID(),
          jobId,
          locationX: reading.x,
          locationY: reading.y,
          room: 'Main Room',
          floor: 1,
          dataPoints: [{
            value: reading.value,
            unit: reading.unit as MoistureUnit,
            timestamp: new Date().toISOString()
          }],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        setReadings(prev => [...prev, newReading]);
        if (dataManagerRef.current) {
          dataManagerRef.current.addMoistureReading(newReading);
        }
      },
      startDrawing: () => {
        setIsDrawing(true);
      },
      stopDrawing: () => {
        setIsDrawing(false);
      },
      setTool: (tool: string) => {
        setCurrentTool(tool);
        if (sketchToolRef.current) {
          sketchToolRef.current.setMode(tool as any);
        }
      },
      setMaterial: (material: string) => {
        setCurrentMaterial(material);
        if (sketchToolRef.current) {
          sketchToolRef.current.setMaterial(material as any);
        }
      },
      undo: () => {
        if (sketchToolRef.current) {
          sketchToolRef.current.undo();
        }
      },
    }));

    return (
      <canvas
        ref={canvasRef}
        className={`${styles.canvas} ${className}`}
      />
    );
  }
);

MoistureSketchMap.displayName = 'MoistureSketchMap';

export default MoistureSketchMap;

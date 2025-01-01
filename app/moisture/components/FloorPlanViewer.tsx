'use client';

// Previous imports remain the same...
import { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import MeasurementTool from './MeasurementTool';
import AreaMeasurementTool from './AreaMeasurementTool';
import PerimeterMeasurementTool from './PerimeterMeasurementTool';
import MoistureHeatMap from './MoistureHeatMap';
import MeasurementTemplateSelector from './MeasurementTemplateSelector';
import MeasurementComparison from './MeasurementComparison';
import ThreeDVisualization from './ThreeDVisualization';
import { MeasurementTemplate } from '../utils/measurementTemplates';
import { exportFloorPlan, exportAllFloorPlans } from '../utils/exportFloorPlan';
import AnnotationEditor from './AnnotationEditor';
import MeasurementHistory from './MeasurementHistory';
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp';
import { setupKeyboardShortcuts } from '../utils/keyboardShortcuts';
import {
  saveMeasurements,
  loadMeasurements,
  exportMeasurementsToJson,
  importMeasurementsFromJson,
  backupAllMeasurements
} from '../utils/measurementStorage';

// Previous interfaces remain the same...
interface Measurement {
  id: string;
  type: 'distance' | 'area';
  value: number;
  timestamp: Date;
  label?: string;
}

type AnnotationType = 'TEXT' | 'ARROW' | 'RECTANGLE' | 'CIRCLE';
type Tool = AnnotationType | 'MEASURE' | 'AREA' | 'PERIMETER' | null;

interface FloorPlan {
  id: string;
  jobId: string;
  name: string;
  level: number;
  imageUrl: string;
  width: number;
  height: number;
  scale: number;
  annotations: Annotation[];
  readings: MoistureReading[];
}

interface Annotation {
  id: string;
  type: AnnotationType;
  content: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  color: string;
}

interface MoistureReading {
  id: string;
  locationX: number;
  locationY: number;
  dataPoints: {
    value: number;
    unit: string;
  }[];
}

interface FloorPlanViewerProps {
  jobId: string;
  onAnnotationCreate?: (annotation: Omit<Annotation, 'id'>) => Promise<void>;
  onAnnotationUpdate?: (id: string, annotation: Partial<Annotation>) => Promise<void>;
  onAnnotationDelete?: (id: string) => Promise<void>;
}

interface MeasurementData {
  currentArea?: number;
  currentPerimeter?: number;
}

export default function FloorPlanViewer({
  jobId,
  onAnnotationCreate,
  onAnnotationUpdate,
  onAnnotationDelete
}: FloorPlanViewerProps) {
  // Previous state and refs remain the same...
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<Tool>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>(() => loadMeasurements(jobId));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showHeatMap, setShowHeatMap] = useState(false);
  const [heatMapOpacity, setHeatMapOpacity] = useState(0.6);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [show3D, setShow3D] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MeasurementTemplate>();

  // Previous functions and effects remain the same...
  const getCurrentMeasurements = useCallback((): MeasurementData => {
    const areaMeasurements = measurements.filter(m => m.type === 'area');
    const perimeterMeasurements = measurements.filter(
      m => m.type === 'distance' && m.label === 'Perimeter'
    );

    return {
      currentArea: areaMeasurements.length > 0 ? areaMeasurements[areaMeasurements.length - 1].value : undefined,
      currentPerimeter: perimeterMeasurements.length > 0 ? perimeterMeasurements[perimeterMeasurements.length - 1].value : undefined
    };
  }, [measurements]);

  const handleTemplateSelect = useCallback((template: MeasurementTemplate) => {
    setSelectedTemplate(template);
    // Add template info to next measurements
    const nextMeasurement = (type: 'area' | 'distance', value: number, label?: string) => ({
      id: uuidv4(),
      type,
      value,
      timestamp: new Date(),
      label: label ? `${template.name} - ${label}` : template.name
    });

    if (template.defaultArea) {
      setMeasurements(prev => [...prev, nextMeasurement('area', template.defaultArea)]);
    }

    if (template.defaultPerimeter) {
      setMeasurements(prev => [...prev, nextMeasurement('distance', template.defaultPerimeter, 'Perimeter')]);
    }
  }, []);

  // Previous effects and handlers remain the same...
  useEffect(() => {
    saveMeasurements(jobId, measurements);
  }, [jobId, measurements]);

  useEffect(() => {
    fetchFloorPlans();
  }, [jobId]);

  const fetchFloorPlans = async () => {
    try {
      const response = await fetch(`/api/moisture/floorplan?jobId=${jobId}`);
      if (!response.ok) throw new Error('Failed to fetch floor plans');
      const data = await response.json();
      setFloorPlans(data);
      if (data.length > 0) {
        setSelectedLevel(data[0].level);
      }
    } catch (err) {
      setError('Failed to load floor plans');
      console.error('Floor plan fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.5));
  };

  const handleAnnotationClick = (annotationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAnnotation(annotationId);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!activeTool || activeTool === 'MEASURE' || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (onAnnotationCreate) {
      onAnnotationCreate({
        type: activeTool as AnnotationType,
        content: '',
        x,
        y,
        color: '#FF0000',
        ...(activeTool !== 'TEXT' && {
          width: 10,
          height: 10,
          rotation: 0
        })
      });
    }

    setActiveTool(null);
  };

  // Set up keyboard shortcuts
  useEffect(() => {
    const cleanup = setupKeyboardShortcuts([
      {
        action: 'measure',
        handler: () => setActiveTool(activeTool === 'MEASURE' ? null : 'MEASURE')
      },
      {
        action: 'area',
        handler: () => setActiveTool(activeTool === 'AREA' ? null : 'AREA')
      },
      {
        action: 'perimeter',
        handler: () => setActiveTool(activeTool === 'PERIMETER' ? null : 'PERIMETER')
      },
      {
        action: 'text',
        handler: () => setActiveTool(activeTool === 'TEXT' ? null : 'TEXT')
      },
      {
        action: 'arrow',
        handler: () => setActiveTool(activeTool === 'ARROW' ? null : 'ARROW')
      },
      {
        action: 'rectangle',
        handler: () => setActiveTool(activeTool === 'RECTANGLE' ? null : 'RECTANGLE')
      },
      {
        action: 'circle',
        handler: () => setActiveTool(activeTool === 'CIRCLE' ? null : 'CIRCLE')
      },
      {
        action: 'zoomIn',
        handler: handleZoomIn
      },
      {
        action: 'zoomOut',
        handler: handleZoomOut
      },
      {
        action: 'escape',
        handler: () => {
          setActiveTool(null);
          setSelectedAnnotation(null);
        }
      },
      {
        action: 'delete',
        handler: () => {
          if (selectedAnnotation && onAnnotationDelete) {
            onAnnotationDelete(selectedAnnotation);
            setSelectedAnnotation(null);
          }
        }
      }
    ]);

    return cleanup;
  }, [activeTool, selectedAnnotation, onAnnotationDelete]);

  const currentFloorPlan = floorPlans.find(fp => fp.level === selectedLevel);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-500">Loading floor plans...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
        {error}
      </div>
    );
  }

  if (!currentFloorPlan) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">No floor plans available</p>
      </div>
    );
  }

  const renderFloorPlanContent = () => (
    <div
      style={{
        transform: `scale(${scale})`,
        transformOrigin: '0 0',
        width: '100%',
        height: '100%',
        position: 'relative'
      }}
    >
      {/* Floor Plan Image */}
      <div className="relative w-full h-full">
        <img
          src={currentFloorPlan.imageUrl}
          alt={`Floor plan level ${currentFloorPlan.level}`}
          className="w-full h-full object-contain"
        />
        {showHeatMap && (
          <MoistureHeatMap
            readings={currentFloorPlan.readings}
            width={containerRef.current?.clientWidth || 0}
            height={containerRef.current?.clientHeight || 0}
            opacity={heatMapOpacity}
          />
        )}
      </div>

      {/* Annotations */}
      {currentFloorPlan.annotations.map((annotation) => (
        <div
          key={annotation.id}
          className={`absolute ${
            selectedAnnotation === annotation.id ? 'ring-2 ring-blue-500' : ''
          }`}
          style={{
            left: `${annotation.x}%`,
            top: `${annotation.y}%`,
            transform: `rotate(${annotation.rotation || 0}deg)`,
            width: annotation.width ? `${annotation.width}%` : 'auto',
            height: annotation.height ? `${annotation.height}%` : 'auto',
            color: annotation.color
          }}
          onClick={(e) => handleAnnotationClick(annotation.id, e)}
        >
          {annotation.type === 'TEXT' ? (
            <div className="bg-white p-2 rounded shadow">
              {annotation.content}
            </div>
          ) : (
            <div
              className="border-2"
              style={{
                borderColor: annotation.color,
                width: '100%',
                height: '100%'
              }}
            />
          )}
        </div>
      ))}

      {/* Moisture Readings */}
      {currentFloorPlan.readings.map((reading) => (
        <div
          key={reading.id}
          className="absolute w-3 h-3 rounded-full bg-blue-500"
          style={{
            left: `${reading.locationX}%`,
            top: `${reading.locationY}%`,
            transform: 'translate(-50%, -50%)'
          }}
          title={`Value: ${reading.dataPoints[0]?.value} ${reading.dataPoints[0]?.unit}`}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".json"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  try {
                    const imported = await importMeasurementsFromJson(jobId, file);
                    setMeasurements(imported);
                  } catch (error) {
                    console.error('Import error:', error);
                  }
                  e.target.value = ''; // Reset file input
                }
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Import
            </button>
            <button
              onClick={() => exportMeasurementsToJson(jobId)}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Export
            </button>
            <button
              onClick={backupAllMeasurements}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Backup All
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShow3D(!show3D)}
              className="px-3 py-1 text-sm bg-violet-100 text-violet-700 rounded hover:bg-violet-200"
            >
              {show3D ? '2D View' : '3D View'}
            </button>
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
            >
              {showTemplates ? 'Hide Templates' : 'Show Templates'}
            </button>
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
            >
              {showComparison ? 'Hide Comparison' : 'Compare'}
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Heat Map</label>
            <input
              type="checkbox"
              checked={showHeatMap}
              onChange={(e) => setShowHeatMap(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            {showHeatMap && (
              <input
                type="range"
                min="0"
                max="100"
                value={heatMapOpacity * 100}
                onChange={(e) => setHeatMapOpacity(Number(e.target.value) / 100)}
                className="w-24"
              />
            )}
          </div>
        </div>
      </div>

      {/* Floor Plan Display */}
      <div className="relative">
        {show3D ? (
          <ThreeDVisualization
            floorPlans={floorPlans}
            levelSpacing={3}
          />
        ) : (
          <div
            ref={containerRef}
            className="relative border rounded-lg overflow-hidden bg-gray-100"
            style={{
              height: '600px',
              cursor: activeTool ? 'crosshair' : 'default'
            }}
            onClick={handleCanvasClick}
          >
            {renderFloorPlanContent()}

            {/* Measurement Tools */}
            {currentFloorPlan && (
              <>
                <MeasurementTool
                  scale={currentFloorPlan.scale}
                  containerWidth={containerRef.current?.clientWidth || 0}
                  containerHeight={containerRef.current?.clientHeight || 0}
                  isActive={activeTool === 'MEASURE'}
                  onMeasurementComplete={(distance) => {
                    setMeasurements(prev => [...prev, {
                      id: uuidv4(),
                      type: 'distance',
                      value: distance,
                      timestamp: new Date()
                    }]);
                    setActiveTool(null);
                  }}
                />
                <AreaMeasurementTool
                  scale={currentFloorPlan.scale}
                  containerWidth={containerRef.current?.clientWidth || 0}
                  containerHeight={containerRef.current?.clientHeight || 0}
                  isActive={activeTool === 'AREA'}
                  onMeasurementComplete={(area) => {
                    setMeasurements(prev => [...prev, {
                      id: uuidv4(),
                      type: 'area',
                      value: area,
                      timestamp: new Date()
                    }]);
                    setActiveTool(null);
                  }}
                />
                <PerimeterMeasurementTool
                  scale={currentFloorPlan.scale}
                  containerWidth={containerRef.current?.clientWidth || 0}
                  containerHeight={containerRef.current?.clientHeight || 0}
                  isActive={activeTool === 'PERIMETER'}
                  onMeasurementComplete={(perimeter) => {
                    setMeasurements(prev => [...prev, {
                      id: uuidv4(),
                      type: 'distance',
                      value: perimeter,
                      timestamp: new Date(),
                      label: 'Perimeter'
                    }]);
                    setActiveTool(null);
                  }}
                />
              </>
            )}
          </div>
        )}
      </div>

      {/* Templates, Comparison, and History */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {showTemplates && (
          <MeasurementTemplateSelector
            onTemplateSelect={handleTemplateSelect}
            currentArea={getCurrentMeasurements().currentArea}
            currentPerimeter={getCurrentMeasurements().currentPerimeter}
          />
        )}
        {showComparison && (
          <MeasurementComparison
            measurements={measurements}
            selectedTemplate={selectedTemplate}
          />
        )}
        <div className={showTemplates && showComparison ? 'md:col-span-2 lg:col-span-1' : ''}>
          <MeasurementHistory
            measurements={measurements}
            onDelete={(id) => {
              setMeasurements(prev => prev.filter(m => m.id !== id));
            }}
            onLabelChange={(id, label) => {
              setMeasurements(prev => prev.map(m =>
                m.id === id ? { ...m, label } : m
              ));
            }}
          />
        </div>
      </div>
    </div>
  );
}

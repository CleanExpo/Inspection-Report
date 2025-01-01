import { useState, useCallback, useEffect } from 'react';
import { DrawingTool, Point, DrawingElement, SketchState, MoistureData } from '../types/sketch';
import { syncService } from '../services/syncService';
import { offlineStorage } from '../services/offlineStorage';

const initialState: SketchState = {
  elements: [],
  currentTool: 'pen',
  currentColor: '#000000',
  lineWidth: 2,
  isDrawing: false,
  inspectionDay: 1,
};

export const useSketchDrawing = (sketchId: string, currentInspectionDay: number) => {
  const [state, setState] = useState<SketchState>(initialState);
  const [history, setHistory] = useState<DrawingElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize services and load data
  useEffect(() => {
    const initializeDrawing = async () => {
      try {
        // Initialize services
        await offlineStorage.initialize();
        await syncService.initialize();

        // Load saved drawing from IndexedDB
        const savedElements = await offlineStorage.getDrawingElements();
        if (savedElements.length > 0) {
          setState(prev => ({
            ...prev,
            elements: savedElements
          }));
          setHistory([savedElements]);
          setHistoryIndex(0);
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize drawing:', error);
      }
    };

    initializeDrawing();

    // Cleanup
    return () => {
      syncService.disconnect();
    };
  }, [sketchId]);


  const startDrawing = useCallback((point: Point) => {
    const newElement: DrawingElement = {
      id: Date.now().toString(),
      type: state.currentTool,
      points: [point],
      color: state.currentColor,
      width: state.lineWidth,
      inspectionDay: state.inspectionDay,
      version: 1,
      lastModified: new Date().toISOString(),
    };

    setState(prev => ({
      ...prev,
      isDrawing: true,
      elements: [...prev.elements, newElement],
    }));
  }, [state.currentTool, state.currentColor, state.lineWidth]);

  const draw = useCallback((point: Point) => {
    if (!state.isDrawing) return;

    setState(prev => {
      const elements = [...prev.elements];
      const currentElement = elements[elements.length - 1];
      
      if (currentElement) {
        currentElement.points.push(point);
      }

      return {
        ...prev,
        elements,
      };
    });
  }, [state.isDrawing]);

  const stopDrawing = useCallback(() => {
    setState(prev => {
      if (!prev.isDrawing) return prev;

      // Add current state to history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push([...prev.elements]);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      return {
        ...prev,
        isDrawing: false,
      };
    });
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setState(prev => ({
        ...prev,
        elements: history[historyIndex - 1],
      }));
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setState(prev => ({
        ...prev,
        elements: history[historyIndex + 1],
      }));
    }
  }, [history, historyIndex]);

  const setTool = useCallback((tool: DrawingTool) => {
    setState(prev => ({
      ...prev,
      currentTool: tool,
    }));
  }, []);

  const setColor = useCallback((color: string) => {
    setState(prev => ({
      ...prev,
      currentColor: color,
    }));
  }, []);

  const addMoistureReading = useCallback((point: Point, moistureData: MoistureData) => {
    const newElement: DrawingElement = {
      id: Date.now().toString(),
      type: 'moisture',
      points: [point],
      color: state.currentColor,
      width: state.lineWidth,
      data: {
        moisture: moistureData,
      },
      inspectionDay: state.inspectionDay,
      version: 1,
      lastModified: new Date().toISOString(),
    };

    setState(prev => {
      const newElements = [...prev.elements, newElement];
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newElements);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      return {
        ...prev,
        elements: newElements,
      };
    });
  }, [state.currentColor, state.lineWidth, history, historyIndex]);

  const addPhoto = useCallback((point: Point, photoUrl: string) => {
    const newElement: DrawingElement = {
      id: Date.now().toString(),
      type: 'photo',
      points: [point],
      color: state.currentColor,
      width: state.lineWidth,
      data: {
        photoUrl,
      },
      inspectionDay: state.inspectionDay,
      version: 1,
      lastModified: new Date().toISOString(),
    };

    setState(prev => {
      const newElements = [...prev.elements, newElement];
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newElements);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      return {
        ...prev,
        elements: newElements,
      };
    });
  }, [state.currentColor, state.lineWidth, history, historyIndex]);

  const addText = useCallback((point: Point, text: string) => {
    const newElement: DrawingElement = {
      id: Date.now().toString(),
      type: 'text',
      points: [point],
      color: state.currentColor,
      width: state.lineWidth,
      data: {
        text,
      },
      inspectionDay: state.inspectionDay,
      version: 1,
      lastModified: new Date().toISOString(),
    };

    setState(prev => {
      const newElements = [...prev.elements, newElement];
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newElements);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      return {
        ...prev,
        elements: newElements,
      };
    });
  }, [state.currentColor, state.lineWidth, history, historyIndex]);

  // Update inspection day
  useEffect(() => {
    if (state.inspectionDay !== currentInspectionDay) {
      setState(prev => ({
        ...prev,
        inspectionDay: currentInspectionDay
      }));
    }
  }, [currentInspectionDay, state.inspectionDay]);

  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | 'error' | null>(null);

  // Save to IndexedDB, sync, and update save status when elements change
  useEffect(() => {
    if (!isInitialized) return;

    let isMounted = true;
    let saveTimeoutId: NodeJS.Timeout;
    let statusTimeoutId: NodeJS.Timeout;

    const saveAndSync = async () => {
      if (!isMounted) return;
      
      setSaveStatus('saving');
      
      try {
        // Save to IndexedDB
        await offlineStorage.saveDrawingElements(state.elements);

        // Sync with server if online
        if (isMounted) {
          await syncService.syncDrawingElements(state.elements, {
            onError: (error) => {
              console.error('Sync failed:', error);
              if (isMounted) setSaveStatus('error');
            }
          });

          if (isMounted) {
            setSaveStatus('saved');
            // Clear saved status after a delay
            statusTimeoutId = setTimeout(() => {
              if (isMounted) setSaveStatus(null);
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Failed to save/sync drawing:', error);
        if (isMounted) setSaveStatus('error');
      }
    };

    saveTimeoutId = setTimeout(saveAndSync, 1000); // Debounce saves

    return () => {
      isMounted = false;
      clearTimeout(saveTimeoutId);
      clearTimeout(statusTimeoutId);
    };
  }, [state.elements, isInitialized]);

  return {
    state,
    startDrawing,
    draw,
    stopDrawing,
    undo,
    redo,
    setTool,
    setColor,
    addMoistureReading,
    addPhoto,
    addText,
    saveStatus
  };
};

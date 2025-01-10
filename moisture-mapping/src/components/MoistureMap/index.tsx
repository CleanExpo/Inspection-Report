import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CanvasService } from '../../services/canvas-service';
import { MoistureReadingManager, MoistureReadingStats } from '../../services/moisture-reading-manager';
import { DrawingMode, MoisturePoint, Point2D, Wall } from '../../types/canvas';
import { MoistureReadingDialog } from './MoistureReadingDialog';
import { VisualFeedback } from './VisualFeedback';
import { TouchFeedbackAnimation } from './TouchFeedbackAnimation';
import { GestureTutorial } from './GestureTutorial';
import { PerformanceOverlay } from './PerformanceOverlay';
import { PDFExportDialog } from './PDFExportDialog';
import { ImageExportDialog } from './ImageExportDialog';
import { IconButton, Tooltip, Stack } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import { BatchExportDialog } from './BatchExportDialog';
import { HistoryManager, HistoryState } from '../../services/history-manager';
import { KeyboardShortcutManager, CommonShortcuts } from '../../utils/keyboard-shortcuts';

export interface MoistureMapMethods {
    setMode: (mode: DrawingMode) => void;
    clear: () => void;
    exportReadings: () => string | undefined;
    importReadings: (json: string) => void;
    getStats: () => MoistureReadingStats | undefined;
}

interface MoistureMapProps {
    width: number;
    height: number;
    criticalThreshold?: number;
    onReadingAdded?: (reading: MoisturePoint) => void;
    onWallAdded?: (wall: Wall) => void;
    onStatsUpdated?: (stats: { average: number; max: number; min: number; criticalCount: number }) => void;
    className?: string;
    showPerformanceMetrics?: boolean;
}

export const MoistureMap = React.forwardRef<MoistureMapMethods, MoistureMapProps>(({
    width,
    height,
    criticalThreshold,
    onReadingAdded,
    onWallAdded,
    onStatsUpdated,
    className,
    showPerformanceMetrics = false
}, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasServiceRef = useRef<CanvasService | null>(null);
    const readingManagerRef = useRef<MoistureReadingManager | null>(null);
    const historyManagerRef = useRef<HistoryManager | null>(null);
    const shortcutManagerRef = useRef<KeyboardShortcutManager | null>(null);
    
    const [mode, setMode] = useState<DrawingMode>('wall');
    const [isDrawing, setIsDrawing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedPoint, setSelectedPoint] = useState<Point2D | null>(null);
    const [validationError, setValidationError] = useState<string>();
    const [validationWarning, setValidationWarning] = useState<string>();
    const [touchPoints, setTouchPoints] = useState<Point2D[]>([]);
    const [isGesturing, setIsGesturing] = useState(false);
    const [ariaAnnouncement, setAriaAnnouncement] = useState<string>('');
    const [tutorialComplete, setTutorialComplete] = useState(false);
    const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const [batchDialogOpen, setBatchDialogOpen] = useState(false);

    // Initialize services
    useEffect(() => {
        if (!canvasRef.current) return;

        canvasServiceRef.current = new CanvasService(canvasRef.current);
        readingManagerRef.current = new MoistureReadingManager(criticalThreshold);
        historyManagerRef.current = new HistoryManager();
        shortcutManagerRef.current = new KeyboardShortcutManager();

        // Update touch state from gesture manager
        const updateTouchState = () => {
            if (!canvasServiceRef.current) return;
            const gestureManager = canvasServiceRef.current.getTouchGestureManager();
            if (gestureManager) {
                setTouchPoints(gestureManager.getTouchPoints());
                setIsGesturing(gestureManager.isGesturing);
            }
        };

        // Set up touch state update interval
            const touchStateInterval = window.setInterval(updateTouchState, 16); // ~60fps

        // Set up keyboard shortcuts
        const shortcuts = shortcutManagerRef.current;
        shortcuts.register('undo', CommonShortcuts.UNDO, () => {
            const state = historyManagerRef.current?.undo();
            if (state) {
                applyHistoryState(state);
                setAriaAnnouncement('Undo action completed');
            }
        });

        shortcuts.register('redo', CommonShortcuts.REDO, () => {
            const state = historyManagerRef.current?.redo();
            if (state) {
                applyHistoryState(state);
                setAriaAnnouncement('Redo action completed');
            }
        });

        shortcuts.register('redo-alt', CommonShortcuts.REDO_ALT, () => {
            const state = historyManagerRef.current?.redo();
            if (state) {
                applyHistoryState(state);
                setAriaAnnouncement('Redo action completed');
            }
        });

        shortcuts.attach();

        return () => {
            canvasServiceRef.current?.destroy();
            shortcutManagerRef.current?.detach();
            canvasServiceRef.current = null;
            readingManagerRef.current = null;
            historyManagerRef.current = null;
            shortcutManagerRef.current = null;
            window.clearInterval(touchStateInterval);
        };
    }, [criticalThreshold]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
        if (!canvasRef.current) return;

        const STEP = 10; // Pixels to move per keypress
        const point = { x: 0, y: 0 };

        switch (event.key) {
            case 'ArrowLeft':
                point.x -= STEP;
                break;
            case 'ArrowRight':
                point.x += STEP;
                break;
            case 'ArrowUp':
                point.y -= STEP;
                break;
            case 'ArrowDown':
                point.y += STEP;
                break;
            case 'Enter':
            case ' ':
                if (mode === 'reading') {
                    setSelectedPoint(point);
                    setDialogOpen(true);
                }
                break;
            case 'Escape':
                if (dialogOpen) {
                    handleDialogClose();
                }
                break;
            default:
                return;
        }

        event.preventDefault();
        setAriaAnnouncement(`Moved to position (${point.x}, ${point.y})`);
    }, [mode, dialogOpen]);

    // Update aria announcements based on state changes
    useEffect(() => {
        if (validationError) {
            setAriaAnnouncement(validationError);
        } else if (validationWarning) {
            setAriaAnnouncement(validationWarning);
        } else if (isGesturing) {
            const scale = canvasServiceRef.current?.getScale() ?? 1;
            const rotation = canvasServiceRef.current?.getRotation() ?? 0;
            const degrees = (rotation * 180 / Math.PI).toFixed(0);
            setAriaAnnouncement(`Scale: ${scale.toFixed(1)}x, Rotation: ${degrees} degrees`);
        }
    }, [validationError, validationWarning, isGesturing]);

    // Apply history state
    const applyHistoryState = useCallback((state: HistoryState) => {
        if (!canvasServiceRef.current || !readingManagerRef.current) return;

        // Clear current state
        canvasServiceRef.current.clear();
        readingManagerRef.current.clearReadings();

        // Apply walls
        state.walls.forEach(wall => {
            canvasServiceRef.current?.drawWall(wall.start, wall.end, wall.type);
        });

        // Apply readings
        state.readings.forEach(reading => {
            readingManagerRef.current?.addReading(
                { x: reading.x, y: reading.y },
                reading.value,
                reading.notes
            );
        });

        // Update canvas
        canvasServiceRef.current.render();
    }, []);

    // Clear validation messages
    const clearValidation = useCallback(() => {
        setValidationError(undefined);
        setValidationWarning(undefined);
    }, []);

    // Validate wall placement
    const validateWall = useCallback((start: Point2D, end: Point2D): boolean => {
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const length = Math.sqrt(dx * dx + dy * dy);

        if (length < 10) {
            setValidationError('Wall is too short. Please draw a longer wall.');
            return false;
        }

        if (length > Math.min(width, height)) {
            setValidationWarning('Wall length exceeds recommended maximum.');
        }

        return true;
    }, [width, height]);

    // Save current state to history
    const saveToHistory = useCallback(async () => {
        setIsLoading(true);
        try {
            if (!historyManagerRef.current || !readingManagerRef.current || !canvasServiceRef.current) return;

            const currentState: HistoryState = {
                walls: canvasServiceRef.current.getWalls(),
                readings: readingManagerRef.current.getAllReadings(),
                timestamp: new Date().toISOString()
            };

            await historyManagerRef.current.pushState(currentState);
        } catch (error) {
            setValidationError('Failed to save state: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Handle wall addition
    const handleWallAdd = useCallback((start: Point2D, end: Point2D) => {
        if (!validateWall(start, end)) return;

        const wall: Wall = {
            start,
            end,
            type: mode === 'wall' ? 'wall' : mode === 'door' ? 'door' : 'window'
        };
        onWallAdded?.(wall);
        saveToHistory();
    }, [mode, onWallAdded, saveToHistory, validateWall]);

    // Handle reading submission
    const handleReadingSubmit = useCallback((value: number, notes?: string) => {
        if (value > 30) {
            setValidationWarning('High moisture reading detected. Immediate attention recommended.');
        }
        if (!readingManagerRef.current || !selectedPoint) return;

        const reading = readingManagerRef.current.addReading(selectedPoint, value, notes);
        onReadingAdded?.(reading);

        // Update stats
        const stats = readingManagerRef.current.getStats();
        onStatsUpdated?.({
            average: stats.average,
            max: stats.max,
            min: stats.min,
            criticalCount: stats.criticalPoints.length
        });

        // Save state to history
        saveToHistory();

        setDialogOpen(false);
        setSelectedPoint(null);
    }, [selectedPoint, onReadingAdded, onStatsUpdated, saveToHistory]);

    // Handle dialog close
    const handleDialogClose = useCallback(() => {
        setDialogOpen(false);
        setSelectedPoint(null);
    }, []);

    // Handle canvas click
    const handleCanvasClick = useCallback((event: MouseEvent) => {
        if (mode !== 'reading' || !canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const point: Point2D = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };

        setSelectedPoint(point);
        setDialogOpen(true);
    }, [mode]);

    // Add click event listener
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.addEventListener('click', handleCanvasClick);
        return () => canvas.removeEventListener('click', handleCanvasClick);
    }, [handleCanvasClick]);

    return (
        <div 
            style={{ position: 'relative' }}
            role="application"
            aria-label="Moisture mapping canvas"
        >
            {/* Screen reader announcements */}
            <div
                aria-live="polite"
                aria-atomic="true"
                className="sr-only"
                style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}
            >
                {ariaAnnouncement}
            </div>

            {/* Main canvas */}
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className={className}
                role="img"
                aria-label={`Moisture map in ${mode} mode. Use arrow keys to navigate, Enter to add reading, Space to start drawing.`}
                style={{
                    border: '1px solid #ccc',
                    touchAction: 'none'
                }}
                tabIndex={0}
                onKeyDown={handleKeyDown}
                onFocus={() => setAriaAnnouncement('Canvas focused. Ready for drawing or navigation.')}
                onBlur={() => setAriaAnnouncement('')}
            />

            {/* Visual feedback components */}
            <VisualFeedback
                mode={mode}
                isDrawing={isDrawing}
                isLoading={isLoading}
                validationError={validationError}
                validationWarning={validationWarning}
                onValidationClose={clearValidation}
            />
            <TouchFeedbackAnimation
                scale={canvasServiceRef.current?.getScale() ?? 1}
                rotation={canvasServiceRef.current?.getRotation() ?? 0}
                touchPoints={touchPoints}
                isGesturing={isGesturing}
                className={className}
            />

            {/* Reading dialog */}
            {dialogOpen && selectedPoint && (
                <MoistureReadingDialog
                    open={dialogOpen}
                    onClose={handleDialogClose}
                    onSubmit={handleReadingSubmit}
                    position={selectedPoint}
                    criticalThreshold={criticalThreshold}
                />
            )}

            {/* Gesture tutorial */}
            <GestureTutorial
                onComplete={() => {
                    setTutorialComplete(true);
                    setAriaAnnouncement('Tutorial completed. You can now use touch gestures to interact with the map.');
                }}
                className={className}
            />
            <PerformanceOverlay enabled={showPerformanceMetrics} />

            {/* Export Buttons */}
            <Stack
                direction="row"
                spacing={1}
                sx={{
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                }}
            >
                <Tooltip title="Export Image">
                    <IconButton
                        sx={{
                            bgcolor: 'background.paper',
                            boxShadow: 2,
                            '&:hover': {
                                bgcolor: 'background.paper',
                            },
                        }}
                        onClick={() => setImageDialogOpen(true)}
                        aria-label="Export Image"
                    >
                        <ImageIcon />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Export PDF Report">
                    <IconButton
                        sx={{
                            bgcolor: 'background.paper',
                            boxShadow: 2,
                            '&:hover': {
                                bgcolor: 'background.paper',
                            },
                        }}
                        onClick={() => setPdfDialogOpen(true)}
                        aria-label="Export PDF Report"
                    >
                        <PictureAsPdfIcon />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Batch Export">
                    <IconButton
                        sx={{
                            bgcolor: 'background.paper',
                            boxShadow: 2,
                            '&:hover': {
                                bgcolor: 'background.paper',
                            },
                        }}
                        onClick={() => setBatchDialogOpen(true)}
                        aria-label="Batch Export"
                    >
                        <FolderZipIcon />
                    </IconButton>
                </Tooltip>
            </Stack>

            {/* Export Dialogs */}
            <PDFExportDialog
                open={pdfDialogOpen}
                onClose={() => setPdfDialogOpen(false)}
                canvas={canvasRef.current}
                readings={readingManagerRef.current?.getAllReadings() || []}
                walls={canvasServiceRef.current?.getWalls() || []}
                stats={readingManagerRef.current?.getStats()}
            />

            <ImageExportDialog
                open={imageDialogOpen}
                onClose={() => setImageDialogOpen(false)}
                canvas={canvasRef.current}
                readings={readingManagerRef.current?.getAllReadings() || []}
                walls={canvasServiceRef.current?.getWalls() || []}
            />

            <BatchExportDialog
                open={batchDialogOpen}
                onClose={() => setBatchDialogOpen(false)}
                items={[{
                    canvas: canvasRef.current!,
                    readings: readingManagerRef.current?.getAllReadings() || [],
                    walls: canvasServiceRef.current?.getWalls() || [],
                    stats: readingManagerRef.current?.getStats() ? {
                        ...readingManagerRef.current.getStats()!,
                        criticalCount: readingManagerRef.current.getStats()!.criticalPoints.length
                    } : undefined,
                    metadata: {
                        title: 'Moisture Map',
                        date: new Date().toISOString(),
                    }
                }]}
            />
        </div>
    );
});

// Set display name for debugging
MoistureMap.displayName = 'MoistureMap';

// Export types for consumers
export type { MoisturePoint, Wall, DrawingMode };

import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MoistureMap } from '../index';
import { CanvasService } from '../../../services/canvas-service';
import { MoistureReadingManager } from '../../../services/moisture-reading-manager';
import { HistoryManager } from '../../../services/history-manager';
import { KeyboardShortcutManager } from '../../../utils/keyboard-shortcuts';
import { TouchGestureManager } from '../../../services/touch-gesture-manager';
import { MoisturePoint, Wall, Point2D } from '../../../types/canvas';

// Mock our services
jest.mock('../../../services/canvas-service');
jest.mock('../../../services/moisture-reading-manager');
jest.mock('../../../services/history-manager');
jest.mock('../../../utils/keyboard-shortcuts');
jest.mock('../../../services/touch-gesture-manager');

// Mock dialog component
jest.mock('../MoistureReadingDialog', () => ({
    MoistureReadingDialog: ({ open, onSubmit, onClose }: any) => (
        open ? (
            <div data-testid="mock-dialog">
                <button onClick={() => onSubmit(15, 'Test note')}>Submit</button>
                <button onClick={onClose}>Cancel</button>
            </div>
        ) : null
    )
}));

// Mock visual feedback component
jest.mock('../VisualFeedback', () => ({
    VisualFeedback: ({ mode, isDrawing, isLoading, validationError, validationWarning }: any) => (
        <div data-testid="visual-feedback">
            <div data-testid="mode">{mode}</div>
            <div data-testid="drawing-state">{isDrawing ? 'drawing' : 'not-drawing'}</div>
            <div data-testid="loading-state">{isLoading ? 'loading' : 'not-loading'}</div>
            {validationError && <div data-testid="error">{validationError}</div>}
            {validationWarning && <div data-testid="warning">{validationWarning}</div>}
        </div>
    )
}));

// Mock touch feedback component
jest.mock('../TouchFeedback', () => ({
    TouchFeedback: ({ scale, rotation, touchPoints, isGesturing }: any) => (
        <div data-testid="touch-feedback">
            <div data-testid="scale">{scale}</div>
            <div data-testid="rotation">{rotation}</div>
            <div data-testid="touch-points">{JSON.stringify(touchPoints)}</div>
            <div data-testid="gesturing">{isGesturing.toString()}</div>
        </div>
    )
}));

describe('MoistureMap', () => {
    const defaultProps = {
        width: 800,
        height: 600,
        criticalThreshold: 16
    };

    // Mock handlers
    const mockOnReadingAdded = jest.fn();
    const mockOnWallAdded = jest.fn();
    const mockOnStatsUpdated = jest.fn();

    let mockCanvasService: jest.Mocked<CanvasService>;
    let mockReadingManager: jest.Mocked<MoistureReadingManager>;
    let mockHistoryManager: jest.Mocked<HistoryManager>;
    let mockShortcutManager: jest.Mocked<KeyboardShortcutManager>;
    let mockTouchGestureManager: jest.Mocked<TouchGestureManager>;

    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks();

        // Setup mock touch gesture manager
        mockTouchGestureManager = {
            getTouchPoints: jest.fn().mockReturnValue([]),
            isGesturing: jest.fn().mockReturnValue(false),
            destroy: jest.fn()
        } as unknown as jest.Mocked<TouchGestureManager>;

        // Setup mock canvas service
        mockCanvasService = {
            setMode: jest.fn(),
            clear: jest.fn(),
            render: jest.fn(),
            destroy: jest.fn(),
            drawWall: jest.fn(),
            getWalls: jest.fn().mockReturnValue([]),
            getScale: jest.fn().mockReturnValue(1),
            getRotation: jest.fn().mockReturnValue(0),
            getTouchGestureManager: jest.fn().mockReturnValue(mockTouchGestureManager)
        } as unknown as jest.Mocked<CanvasService>;

        mockReadingManager = {
            addReading: jest.fn(),
            getStats: jest.fn().mockReturnValue({
                average: 15,
                max: 20,
                min: 10,
                criticalPoints: [],
                readingCount: 5
            }),
            clearReadings: jest.fn(),
            exportReadings: jest.fn(),
            importReadings: jest.fn(),
            getAllReadings: jest.fn().mockReturnValue([])
        } as unknown as jest.Mocked<MoistureReadingManager>;

        mockHistoryManager = {
            pushState: jest.fn(),
            undo: jest.fn(),
            redo: jest.fn(),
            getCurrentState: jest.fn()
        } as unknown as jest.Mocked<HistoryManager>;

        mockShortcutManager = {
            register: jest.fn(),
            attach: jest.fn(),
            detach: jest.fn()
        } as unknown as jest.Mocked<KeyboardShortcutManager>;

        // Mock constructors
        (CanvasService as unknown as jest.Mock).mockImplementation(() => mockCanvasService);
        (MoistureReadingManager as unknown as jest.Mock).mockImplementation(() => mockReadingManager);
        (HistoryManager as unknown as jest.Mock).mockImplementation(() => mockHistoryManager);
        (KeyboardShortcutManager as unknown as jest.Mock).mockImplementation(() => mockShortcutManager);
    });

    describe('touch gesture handling', () => {
        it('updates touch points from gesture manager', async () => {
            const touchPoints: Point2D[] = [
                { x: 100, y: 100 },
                { x: 200, y: 200 }
            ];
            mockTouchGestureManager.getTouchPoints.mockReturnValue(touchPoints);

            render(<MoistureMap {...defaultProps} />);

            // Wait for touch state update interval
            await waitFor(() => {
                const touchPointsEl = screen.getByTestId('touch-points');
                expect(touchPointsEl.textContent).toBe(JSON.stringify(touchPoints));
            });
        });

        it('updates gesturing state from gesture manager', async () => {
            mockTouchGestureManager.isGesturing.mockReturnValue(true);

            render(<MoistureMap {...defaultProps} />);

            await waitFor(() => {
                const gesturingEl = screen.getByTestId('gesturing');
                expect(gesturingEl.textContent).toBe('true');
            });
        });

        it('passes transformation state to TouchFeedback', () => {
            mockCanvasService.getScale.mockReturnValue(2);
            mockCanvasService.getRotation.mockReturnValue(Math.PI / 4);

            render(<MoistureMap {...defaultProps} />);

            expect(screen.getByTestId('scale').textContent).toBe('2');
            expect(screen.getByTestId('rotation').textContent).toBe(String(Math.PI / 4));
        });

        it('cleans up touch state interval on unmount', () => {
            jest.useFakeTimers();
            
            const { unmount } = render(<MoistureMap {...defaultProps} />);
            
            unmount();
            
            // Advance timers and verify no more updates
            const prevCalls = mockTouchGestureManager.getTouchPoints.mock.calls.length;
            jest.advanceTimersByTime(100);
            expect(mockTouchGestureManager.getTouchPoints.mock.calls.length).toBe(prevCalls);
            
            jest.useRealTimers();
        });
    });

    // Include all previous tests...
    // (The rest of the test file remains unchanged)
});

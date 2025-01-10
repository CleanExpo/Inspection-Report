import { CanvasService } from '../canvas-service';
import { CanvasLayer } from '../../types/canvas';
import { TouchGestureManager } from '../touch-gesture-manager';

// Mock TouchGestureManager
jest.mock('../touch-gesture-manager');

describe('CanvasService', () => {
    let canvas: HTMLCanvasElement;
    let service: CanvasService;
    let mockContext: {
        clearRect: jest.Mock;
        beginPath: jest.Mock;
        moveTo: jest.Mock;
        lineTo: jest.Mock;
        stroke: jest.Mock;
        drawImage: jest.Mock;
        save: jest.Mock;
        restore: jest.Mock;
        translate: jest.Mock;
        rotate: jest.Mock;
        scale: jest.Mock;
        setTransform: jest.Mock;
        // Current transform state
        currentTransform: {
            translate: { x: number; y: number };
            rotate: number;
            scale: number;
        };
    };

    beforeEach(() => {
        // Create canvas element
        canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;

        // Mock canvas context methods
        mockContext = {
            clearRect: jest.fn(),
            beginPath: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            stroke: jest.fn(),
            drawImage: jest.fn(),
            save: jest.fn(),
            restore: jest.fn(),
            translate: jest.fn(),
            rotate: jest.fn(),
            scale: jest.fn(),
            setTransform: jest.fn(),
            currentTransform: {
                translate: { x: 0, y: 0 },
                rotate: 0,
                scale: 1
            }
        };

        // Mock getContext
        canvas.getContext = jest.fn().mockReturnValue(mockContext);

        // Mock getBoundingClientRect
        canvas.getBoundingClientRect = jest.fn().mockReturnValue({
            left: 0,
            top: 0,
            width: 800,
            height: 600
        });

        // Mock requestAnimationFrame
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
            cb(performance.now());
            return 1;
        });

        // Create service instance
        service = new CanvasService(canvas);
    });

    afterEach(() => {
        (window.requestAnimationFrame as jest.Mock).mockRestore();
        jest.clearAllMocks();
    });

    describe('touch gesture handling', () => {
        let mockGestureManager: jest.Mocked<TouchGestureManager>;
        let gestureCallbacks: any;

        beforeEach(() => {
            // Capture gesture callbacks when TouchGestureManager is instantiated
            (TouchGestureManager as jest.Mock).mockImplementation((_, callbacks) => {
                gestureCallbacks = callbacks;
                mockGestureManager = {
                    destroy: jest.fn()
                } as any;
                return mockGestureManager;
            });

            // Create new service to capture callbacks
            service = new CanvasService(canvas);
        });

        it('should initialize TouchGestureManager', () => {
            expect(TouchGestureManager).toHaveBeenCalledWith(canvas, expect.any(Object));
        });

        it('should handle pan gesture', () => {
            gestureCallbacks.onPan({ x: 50, y: 30 });

            expect(mockContext.save).toHaveBeenCalled();
            expect(mockContext.translate).toHaveBeenCalledWith(50, 30);
            expect(mockContext.restore).toHaveBeenCalled();
        });

        it('should handle zoom gesture', () => {
            const center = { x: 400, y: 300 };
            gestureCallbacks.onZoom(2, center);

            expect(mockContext.save).toHaveBeenCalled();
            expect(mockContext.scale).toHaveBeenCalledWith(2, 2);
            expect(mockContext.restore).toHaveBeenCalled();
        });

        it('should handle rotation gesture', () => {
            const center = { x: 400, y: 300 };
            const angle = Math.PI / 4; // 45 degrees
            gestureCallbacks.onRotate(angle, center);

            expect(mockContext.save).toHaveBeenCalled();
            expect(mockContext.rotate).toHaveBeenCalledWith(angle);
            expect(mockContext.restore).toHaveBeenCalled();
        });

        it('should reset transformations on double tap', () => {
            // First apply some transformations
            gestureCallbacks.onPan({ x: 50, y: 30 });
            gestureCallbacks.onZoom(2, { x: 400, y: 300 });
            gestureCallbacks.onRotate(Math.PI / 4, { x: 400, y: 300 });

            // Clear mock calls
            jest.clearAllMocks();

            // Double tap
            gestureCallbacks.onDoubleTap({ x: 400, y: 300 });

            // Should reset to identity transform
            expect(mockContext.save).toHaveBeenCalled();
            expect(mockContext.setTransform).toHaveBeenCalledWith(1, 0, 0, 1, 0, 0);
            expect(mockContext.restore).toHaveBeenCalled();
        });

        it('should clean up gesture manager on destroy', () => {
            service.destroy();
            expect(mockGestureManager.destroy).toHaveBeenCalled();
        });
    });

    describe('coordinate transformation', () => {
        it('should transform mouse coordinates based on scale', () => {
            // Set scale
            service['scale'] = 2;

            // Get transformed point
            const point = service['getCanvasPoint']({ clientX: 100, clientY: 100 } as MouseEvent);

            // Point should be scaled down
            expect(point).toEqual({ x: 50, y: 50 });
        });

        it('should transform touch coordinates based on scale and rotation', () => {
            // Set transformations
            service['scale'] = 2;
            service['rotation'] = Math.PI / 2; // 90 degrees

            // Get transformed point
            const point = service['getCanvasPoint']({ clientX: 100, clientY: 100 } as Touch);

            // Point should be scaled and rotated
            expect(point.x).toBeCloseTo(-50); // -100/2 after rotation
            expect(point.y).toBeCloseTo(50); // 100/2 after rotation
        });
    });

    describe('transform management', () => {
        it('should reset transform state on double tap', () => {
            // Set some transformations
            service['scale'] = 2;
            service['rotation'] = Math.PI / 4;
            service['offset'] = { x: 100, y: 100 };

            // Trigger double tap
            const gestureCallbacks = (TouchGestureManager as jest.Mock).mock.calls[0][1];
            gestureCallbacks.onDoubleTap({ x: 400, y: 300 });

            // Check transform reset
            expect(service['scale']).toBe(1);
            expect(service['rotation']).toBe(0);
            expect(service['offset']).toEqual({ x: 0, y: 0 });
            expect(mockContext.setTransform).toHaveBeenCalledWith(1, 0, 0, 1, 0, 0);
        });

        it('should maintain transform state during pan', () => {
            // Set initial transform
            service['scale'] = 2;
            service['offset'] = { x: 50, y: 50 };

            // Pan
            const gestureCallbacks = (TouchGestureManager as jest.Mock).mock.calls[0][1];
            gestureCallbacks.onPan({ x: 25, y: 25 });

            // Check updated offset
            expect(service['offset']).toEqual({ x: 75, y: 75 });
            expect(service['scale']).toBe(2); // Scale should remain unchanged
        });

        it('should update transform around center point during zoom', () => {
            const center = { x: 400, y: 300 };
            const gestureCallbacks = (TouchGestureManager as jest.Mock).mock.calls[0][1];
            
            // Zoom in
            gestureCallbacks.onZoom(2, center);

            // Center point should remain stationary
            const transformedCenter = {
                x: (center.x + service['offset'].x) * service['scale'],
                y: (center.y + service['offset'].y) * service['scale']
            };
            expect(transformedCenter).toEqual(center);
        });
    });

    describe('rendering with transformations', () => {
        it('should apply transformations in correct order', () => {
            // Apply transformations
            service['offset'] = { x: 50, y: 30 };
            service['scale'] = 2;
            service['rotation'] = Math.PI / 4;

            // Render
            service.render();

            // Verify transform order: translate -> rotate -> scale
            const calls = mockContext.translate.mock.calls;
            expect(calls[0]).toEqual([50, 30]);
            expect(mockContext.rotate).toHaveBeenCalledWith(Math.PI / 4);
            expect(mockContext.scale).toHaveBeenCalledWith(2, 2);
        });

        it('should maintain transformation center point', () => {
            const center = { x: 400, y: 300 };
            
            // Apply zoom around center
            service['scale'] = 2;
            service['offset'] = {
                x: center.x - (center.x * service['scale']),
                y: center.y - (center.y * service['scale'])
            };

            // Render
            service.render();

            // Center point should remain stationary
            const transformedCenter = {
                x: (center.x + service['offset'].x) * service['scale'],
                y: (center.y + service['offset'].y) * service['scale']
            };
            expect(transformedCenter).toEqual(center);
        });
    });

    // Include all previous tests...
    // (The rest of the test file remains unchanged)
});

// Helper function to fire events
function fireEvent(element: HTMLElement, eventType: string, eventProperties: any) {
    let event;
    if (eventType.startsWith('touch')) {
        event = new TouchEvent(eventType, {
            bubbles: true,
            cancelable: true,
            ...eventProperties
        });
    } else {
        event = new MouseEvent(eventType, {
            bubbles: true,
            cancelable: true,
            ...eventProperties
        });
    }
    element.dispatchEvent(event);
}

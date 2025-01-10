import { TouchGestureManager, GestureCallbacks } from '../touch-gesture-manager';
import { Point2D } from '../../types/canvas';

jest.useFakeTimers();

describe('TouchGestureManager', () => {
    let element: HTMLElement;
    let manager: TouchGestureManager;
    let callbacks: jest.Mocked<GestureCallbacks>;

    beforeEach(() => {
        element = document.createElement('div');
        callbacks = {
            onPan: jest.fn(),
            onZoom: jest.fn(),
            onRotate: jest.fn(),
            onTap: jest.fn(),
            onDoubleTap: jest.fn(),
            onLongPress: jest.fn()
        };
        manager = new TouchGestureManager(element, callbacks);
    });

    afterEach(() => {
        manager.destroy();
    });

    const createTouch = (x: number, y: number, identifier = 0): Touch => ({
        clientX: x,
        clientY: y,
        identifier,
        target: element,
        screenX: x,
        screenY: y,
        pageX: x,
        pageY: y,
        radiusX: 0,
        radiusY: 0,
        rotationAngle: 0,
        force: 1
    });

    const createTouchEvent = (type: string, touches: Touch[]): TouchEvent => {
        // Mock TouchEvent since JSDOM doesn't fully implement it
        const event = {
            type,
            bubbles: true,
            cancelable: true,
            touches,
            targetTouches: touches,
            changedTouches: touches,
            preventDefault: jest.fn(),
            stopPropagation: jest.fn()
        } as unknown as TouchEvent;
        return event;
    };

    describe('tap gestures', () => {
        it('detects single tap', () => {
            const touch = createTouch(100, 100);
            element.dispatchEvent(createTouchEvent('touchstart', [touch]));
            element.dispatchEvent(createTouchEvent('touchend', [touch]));

            expect(callbacks.onTap).toHaveBeenCalledWith({ x: 100, y: 100 });
        });

        it('detects double tap', () => {
            const touch = createTouch(100, 100);

            // First tap
            element.dispatchEvent(createTouchEvent('touchstart', [touch]));
            element.dispatchEvent(createTouchEvent('touchend', [touch]));

            // Second tap
            jest.advanceTimersByTime(200); // Within double tap delay
            element.dispatchEvent(createTouchEvent('touchstart', [touch]));
            element.dispatchEvent(createTouchEvent('touchend', [touch]));

            expect(callbacks.onDoubleTap).toHaveBeenCalledWith({ x: 100, y: 100 });
        });

        it('detects long press', () => {
            const touch = createTouch(100, 100);
            element.dispatchEvent(createTouchEvent('touchstart', [touch]));

            jest.advanceTimersByTime(500); // Long press delay

            expect(callbacks.onLongPress).toHaveBeenCalledWith({ x: 100, y: 100 });
        });

        it('cancels long press on movement', () => {
            const touch1 = createTouch(100, 100);
            const touch2 = createTouch(120, 120); // Moved beyond minimum distance

            element.dispatchEvent(createTouchEvent('touchstart', [touch1]));
            element.dispatchEvent(createTouchEvent('touchmove', [touch2]));

            jest.advanceTimersByTime(500);

            expect(callbacks.onLongPress).not.toHaveBeenCalled();
        });
    });

    describe('pan gesture', () => {
        it('detects pan movement', () => {
            const touch1 = createTouch(100, 100);
            const touch2 = createTouch(150, 150);

            element.dispatchEvent(createTouchEvent('touchstart', [touch1]));
            element.dispatchEvent(createTouchEvent('touchmove', [touch2]));

            expect(callbacks.onPan).toHaveBeenCalledWith({ x: 50, y: 50 });
        });

        it('tracks continuous pan movement', () => {
            const touches = [
                createTouch(100, 100),
                createTouch(150, 150),
                createTouch(200, 200)
            ];

            element.dispatchEvent(createTouchEvent('touchstart', [touches[0]]));
            element.dispatchEvent(createTouchEvent('touchmove', [touches[1]]));
            element.dispatchEvent(createTouchEvent('touchmove', [touches[2]]));

            expect(callbacks.onPan).toHaveBeenCalledTimes(2);
            expect(callbacks.onPan).toHaveBeenLastCalledWith({ x: 50, y: 50 });
        });
    });

    describe('pinch gesture', () => {
        it('detects pinch zoom', () => {
            const touch1 = createTouch(100, 100, 0);
            const touch2 = createTouch(200, 200, 1);
            const touch3 = createTouch(50, 50, 0);
            const touch4 = createTouch(250, 250, 1);

            // Start pinch
            element.dispatchEvent(createTouchEvent('touchstart', [touch1, touch2]));
            // Move fingers apart
            element.dispatchEvent(createTouchEvent('touchmove', [touch3, touch4]));

            expect(callbacks.onZoom).toHaveBeenCalled();
            const zoomCall = (callbacks.onZoom as jest.Mock).mock.calls[0];
            const [scale, center] = zoomCall as [number, Point2D];
            expect(scale).toBeGreaterThan(1); // Zoom out
            expect(center).toEqual({ x: 150, y: 150 }); // Center point
        });
    });

    describe('rotation gesture', () => {
        it('detects rotation', () => {
            const touch1 = createTouch(100, 100, 0);
            const touch2 = createTouch(200, 100, 1);
            const touch3 = createTouch(100, 100, 0);
            const touch4 = createTouch(200, 200, 1); // Moved to create rotation

            // Start rotation
            element.dispatchEvent(createTouchEvent('touchstart', [touch1, touch2]));
            // Rotate second finger
            element.dispatchEvent(createTouchEvent('touchmove', [touch3, touch4]));

            expect(callbacks.onRotate).toHaveBeenCalled();
            const rotateCall = (callbacks.onRotate as jest.Mock).mock.calls[0];
            const [angle, center] = rotateCall as [number, Point2D];
            expect(angle).not.toBe(0);
            expect(center).toEqual({ x: 150, y: 150 }); // Center point
        });
    });

    describe('cleanup', () => {
        it('removes event listeners on destroy', () => {
            const removeEventListenerSpy = jest.spyOn(element, 'removeEventListener');
            
            manager.destroy();

            expect(removeEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
            expect(removeEventListenerSpy).toHaveBeenCalledWith('touchmove', expect.any(Function));
            expect(removeEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function));
            expect(removeEventListenerSpy).toHaveBeenCalledWith('touchcancel', expect.any(Function));
        });

        it('clears timeouts on destroy', () => {
            const touch = createTouch(100, 100);
            element.dispatchEvent(createTouchEvent('touchstart', [touch]));

            manager.destroy();
            jest.advanceTimersByTime(500);

            expect(callbacks.onLongPress).not.toHaveBeenCalled();
        });
    });
});

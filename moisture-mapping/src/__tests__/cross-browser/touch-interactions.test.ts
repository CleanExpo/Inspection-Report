import { BrowserEnvironment, BrowserProfiles, TouchSimulator, GesturePatterns } from '../../utils/browser-testing';
import { TouchGestureManager } from '../../services/touch-gesture-manager';
import { detectBrowser } from '../../services/browser-detection';

describe('Touch Interactions Cross-Browser Tests', () => {
    let browserEnv: BrowserEnvironment;
    let canvas: HTMLCanvasElement;
    let gestureManager: TouchGestureManager;
    let gestureCallbacks: {
        onPan: jest.Mock;
        onZoom: jest.Mock;
        onRotate: jest.Mock;
        onDoubleTap: jest.Mock;
    };

    beforeEach(() => {
        browserEnv = new BrowserEnvironment();
        canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        document.body.appendChild(canvas);

        gestureCallbacks = {
            onPan: jest.fn(),
            onZoom: jest.fn(),
            onRotate: jest.fn(),
            onDoubleTap: jest.fn()
        };

        gestureManager = new TouchGestureManager(canvas, gestureCallbacks);
    });

    afterEach(() => {
        browserEnv.restore();
        document.body.removeChild(canvas);
        gestureManager.destroy();
        jest.clearAllMocks();
    });

    describe.each(Object.entries(BrowserProfiles))(
        '%s Browser Tests',
        (browserName, profile) => {
            beforeEach(() => {
                browserEnv.simulateBrowser(profile);
            });

            test('Browser detection works correctly', () => {
                const detected = detectBrowser();
                switch (browserName) {
                    case 'Chrome':
                        expect(detected.isChrome).toBe(true);
                        break;
                    case 'Firefox':
                        expect(detected.isFirefox).toBe(true);
                        break;
                    case 'Safari':
                        expect(detected.isSafari).toBe(true);
                        break;
                    case 'iOS':
                        expect(detected.isIOS).toBe(true);
                        expect(detected.isSafari).toBe(true);
                        break;
                    case 'Android':
                        expect(detected.isMobile).toBe(true);
                        expect(detected.isChrome).toBe(true);
                        break;
                }
            });

            test('Pan gesture works correctly', async () => {
                const startX = 100;
                const startY = 100;
                const endX = 200;
                const endY = 200;

                await TouchSimulator.simulateGesture(
                    canvas,
                    GesturePatterns.pan(startX, startY, endX, endY)
                );

                expect(gestureCallbacks.onPan).toHaveBeenCalled();
                const lastCall = gestureCallbacks.onPan.mock.lastCall[0];
                expect(lastCall).toEqual({
                    x: endX - startX,
                    y: endY - startY
                });
            });

            test('Pinch zoom gesture works correctly', async () => {
                const centerX = 400;
                const centerY = 300;
                const startScale = 1;
                const endScale = 2;

                await TouchSimulator.simulateGesture(
                    canvas,
                    GesturePatterns.pinchZoom(centerX, centerY, startScale, endScale)
                );

                if (profile.gestureSupport) {
                    expect(gestureCallbacks.onZoom).toHaveBeenCalled();
                    const lastCall = gestureCallbacks.onZoom.mock.lastCall;
                    expect(lastCall[0]).toBeCloseTo(endScale / startScale, 1);
                    expect(lastCall[1]).toEqual({ x: centerX, y: centerY });
                }
            });

            test('Rotation gesture works correctly', async () => {
                const centerX = 400;
                const centerY = 300;
                const angle = Math.PI / 2; // 90 degrees

                await TouchSimulator.simulateGesture(
                    canvas,
                    GesturePatterns.rotate(centerX, centerY, angle)
                );

                if (profile.gestureSupport) {
                    expect(gestureCallbacks.onRotate).toHaveBeenCalled();
                    const lastCall = gestureCallbacks.onRotate.mock.lastCall;
                    expect(lastCall[0]).toBeCloseTo(angle, 1);
                    expect(lastCall[1]).toEqual({ x: centerX, y: centerY });
                }
            });

            test('Double tap gesture works correctly', async () => {
                const x = 200;
                const y = 200;

                // Simulate first tap
                await TouchSimulator.simulateGesture(canvas, {
                    start: { points: [{ x, y }] },
                    moves: [],
                    end: { points: [{ x, y }] }
                });

                // Small delay between taps
                await new Promise(resolve => setTimeout(resolve, 100));

                // Simulate second tap
                await TouchSimulator.simulateGesture(canvas, {
                    start: { points: [{ x, y }] },
                    moves: [],
                    end: { points: [{ x, y }] }
                });

                expect(gestureCallbacks.onDoubleTap).toHaveBeenCalledWith({ x, y });
            });

            test('Gesture state management works correctly', async () => {
                const startX = 100;
                const startY = 100;
                const endX = 200;
                const endY = 200;

                expect(gestureManager.isGesturing).toBe(false);

                // Start two-finger gesture
                const gesture = GesturePatterns.pinchZoom(
                    (startX + endX) / 2,
                    (startY + endY) / 2
                );
                
                await TouchSimulator.simulateGesture(canvas, gesture);

                // Should return to non-gesturing state after gesture ends
                expect(gestureManager.isGesturing).toBe(false);
            });

            if (profile.gestureSupport) {
                test('Safari-specific gesture events work correctly', async () => {
                    const gestureStart = new GestureEvent('gesturestart', {
                        scale: 1,
                        rotation: 0
                    });
                    const gestureChange = new GestureEvent('gesturechange', {
                        scale: 2,
                        rotation: Math.PI / 4
                    });
                    const gestureEnd = new GestureEvent('gestureend', {
                        scale: 2,
                        rotation: Math.PI / 4
                    });

                    canvas.dispatchEvent(gestureStart);
                    canvas.dispatchEvent(gestureChange);
                    canvas.dispatchEvent(gestureEnd);

                    expect(gestureCallbacks.onZoom).toHaveBeenCalled();
                    expect(gestureCallbacks.onRotate).toHaveBeenCalled();
                });
            }
        }
    );
});

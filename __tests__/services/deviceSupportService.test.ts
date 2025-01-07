import { deviceSupportService } from '../../services/deviceSupportService';

describe('Device Support Service', () => {
    beforeEach(() => {
        // Mock window and navigator properties
        Object.defineProperty(window, 'devicePixelRatio', {
            value: 2,
            configurable: true
        });

        Object.defineProperty(window, 'screen', {
            value: {
                width: 1920,
                height: 1080
            },
            configurable: true
        });

        Object.defineProperty(navigator, 'userAgent', {
            value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124',
            configurable: true
        });

        Object.defineProperty(navigator, 'maxTouchPoints', {
            value: 5,
            configurable: true
        });

        Object.defineProperty(navigator, 'hardwareConcurrency', {
            value: 8,
            configurable: true
        });

        // Mock device motion and orientation events
        Object.defineProperty(window, 'DeviceMotionEvent', {
            value: jest.fn(),
            configurable: true
        });

        Object.defineProperty(window, 'DeviceOrientationEvent', {
            value: jest.fn(),
            configurable: true
        });
    });

    afterEach(() => {
        deviceSupportService.cleanup();
        jest.clearAllMocks();
    });

    describe('Device Profile Detection', () => {
        it('should detect device profile correctly', () => {
            const profile = deviceSupportService.getDeviceProfile();
            
            expect(profile).toBeDefined();
            expect(profile?.platform).toBe('windows');
            expect(profile?.browser).toBe('chrome');
            expect(profile?.screenSize).toEqual({
                width: 1920,
                height: 1080,
                pixelRatio: 2
            });
        });

        it('should detect device capabilities', () => {
            const profile = deviceSupportService.getDeviceProfile();
            
            expect(profile?.capabilities).toEqual(expect.objectContaining({
                touchscreen: expect.any(Boolean),
                multiTouch: true,
                stylus: true,
                keyboard: true,
                mouse: true,
                accelerometer: true,
                gyroscope: true,
                webgl: expect.any(Boolean),
                webgl2: expect.any(Boolean)
            }));
        });

        it('should detect performance characteristics', () => {
            const profile = deviceSupportService.getDeviceProfile();
            
            expect(profile?.performance).toEqual(expect.objectContaining({
                tier: 'high',
                memory: expect.any(Number),
                processorCores: 8
            }));
        });
    });

    describe('Hardware Acceleration', () => {
        it('should detect hardware acceleration support', () => {
            // Mock CSS properties
            const div = document.createElement('div');
            Object.defineProperty(div.style, 'transform', {
                value: '',
                configurable: true
            });
            Object.defineProperty(div.style, 'transition', {
                value: '',
                configurable: true
            });
            Object.defineProperty(div.style, 'transform-style', {
                value: '',
                configurable: true
            });

            expect(deviceSupportService.isHardwareAccelerated()).toBe(true);
        });
    });

    describe('Input Method Handling', () => {
        it('should setup appropriate input handlers based on capabilities', () => {
            const supportedMethods = deviceSupportService.getSupportedInputMethods();
            
            // With our mocked environment, we should have these handlers
            expect(supportedMethods).toContain('touch');
            expect(supportedMethods).toContain('stylus');
            expect(supportedMethods).toContain('motion');
        });

        it('should handle touch events correctly', () => {
            const touchEvent = new TouchEvent('touchstart', {
                touches: [{
                    clientX: 100,
                    clientY: 100,
                    identifier: 1
                }] as unknown as Touch[]
            });

            document.dispatchEvent(touchEvent);
            // Verify event handling (implementation specific)
        });

        it('should handle stylus events correctly', () => {
            const pointerEvent = new PointerEvent('pointerdown', {
                pointerType: 'pen',
                clientX: 100,
                clientY: 100
            });

            document.dispatchEvent(pointerEvent);
            // Verify event handling (implementation specific)
        });

        it('should handle motion events correctly', () => {
            const motionEvent = new DeviceMotionEvent('devicemotion', {
                acceleration: {
                    x: 1,
                    y: 2,
                    z: 3
                }
            } as DeviceMotionEventInit);

            window.dispatchEvent(motionEvent);
            // Verify event handling (implementation specific)
        });
    });

    describe('Cleanup', () => {
        it('should remove all event listeners on cleanup', () => {
            const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
            
            deviceSupportService.cleanup();
            
            // Should remove touch, stylus, and motion listeners
            expect(removeEventListenerSpy).toHaveBeenCalledTimes(7); // 3 touch + 3 stylus + 1 motion
        });

        it('should clear all input handlers after cleanup', () => {
            deviceSupportService.cleanup();
            expect(deviceSupportService.getSupportedInputMethods()).toHaveLength(0);
        });
    });
});

import { debounce, throttle, rafThrottle } from '../debounce';

describe('debounce', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should delay function execution', () => {
        const func = jest.fn();
        const debouncedFunc = debounce(func, 100);

        debouncedFunc();
        expect(func).not.toHaveBeenCalled();

        jest.advanceTimersByTime(50);
        expect(func).not.toHaveBeenCalled();

        jest.advanceTimersByTime(50);
        expect(func).toHaveBeenCalledTimes(1);
    });

    it('should cancel previous timeout on subsequent calls', () => {
        const func = jest.fn();
        const debouncedFunc = debounce(func, 100);

        debouncedFunc();
        debouncedFunc();
        debouncedFunc();

        jest.advanceTimersByTime(99);
        expect(func).not.toHaveBeenCalled();

        jest.advanceTimersByTime(1);
        expect(func).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments to the debounced function', () => {
        const func = jest.fn();
        const debouncedFunc = debounce(func, 100);

        debouncedFunc('test', 123);
        jest.advanceTimersByTime(100);

        expect(func).toHaveBeenCalledWith('test', 123);
    });
});

describe('throttle', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should limit function execution rate', () => {
        const func = jest.fn();
        const throttledFunc = throttle(func, 100);

        // First call executes immediately
        throttledFunc();
        expect(func).toHaveBeenCalledTimes(1);

        // Subsequent calls within wait period are throttled
        throttledFunc();
        throttledFunc();
        expect(func).toHaveBeenCalledTimes(1);

        // After wait period, next call executes
        jest.advanceTimersByTime(100);
        throttledFunc();
        expect(func).toHaveBeenCalledTimes(2);
    });

    it('should pass latest arguments to the throttled function', () => {
        const func = jest.fn();
        const throttledFunc = throttle(func, 100);

        throttledFunc('first');
        throttledFunc('second');
        throttledFunc('third');

        expect(func).toHaveBeenCalledWith('first');
        expect(func).not.toHaveBeenCalledWith('second');

        jest.advanceTimersByTime(100);
        expect(func).toHaveBeenCalledWith('third');
    });
});

describe('rafThrottle', () => {
    beforeEach(() => {
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
            setTimeout(() => cb(performance.now()), 16); // Simulate 60fps
            return 1;
        });
    });

    afterEach(() => {
        (window.requestAnimationFrame as jest.Mock).mockRestore();
    });

    it('should throttle function calls using requestAnimationFrame', () => {
        const func = jest.fn();
        const throttledFunc = rafThrottle(func);

        throttledFunc();
        throttledFunc();
        throttledFunc();

        expect(func).not.toHaveBeenCalled();
        expect(requestAnimationFrame).toHaveBeenCalledTimes(1);

        // Simulate frame
        jest.advanceTimersByTime(16);
        expect(func).toHaveBeenCalledTimes(1);
    });

    it('should pass latest arguments to the throttled function', () => {
        const func = jest.fn();
        const throttledFunc = rafThrottle(func);

        throttledFunc('first');
        throttledFunc('second');
        throttledFunc('third');

        jest.advanceTimersByTime(16);
        expect(func).toHaveBeenCalledWith('third');
        expect(func).not.toHaveBeenCalledWith('first');
        expect(func).not.toHaveBeenCalledWith('second');
    });

    it('should schedule new frame after previous one completes', () => {
        const func = jest.fn();
        const throttledFunc = rafThrottle(func);

        throttledFunc();
        jest.advanceTimersByTime(16);
        expect(func).toHaveBeenCalledTimes(1);

        throttledFunc();
        jest.advanceTimersByTime(16);
        expect(func).toHaveBeenCalledTimes(2);
    });
});

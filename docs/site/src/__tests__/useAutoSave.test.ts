import { renderHook, act } from '@testing-library/react';
import { useAutoSave } from '../hooks/useAutoSave';

describe('useAutoSave', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should not save when disabled', async () => {
    const onSave = jest.fn();
    const { result } = renderHook(() =>
      useAutoSave({
        value: 'test',
        onSave,
        enabled: false
      })
    );

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(onSave).not.toHaveBeenCalled();
    expect(result.current.isSaving).toBe(false);
  });

  it('should save after debounce period', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useAutoSave({
        value: 'test',
        onSave,
        debounceMs: 1000
      })
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(onSave).toHaveBeenCalledWith('test');
    expect(result.current.lastSaved).toBeInstanceOf(Date);
  });

  it('should handle save errors', async () => {
    const error = new Error('Save failed');
    const onSave = jest.fn().mockRejectedValue(error);
    const { result } = renderHook(() =>
      useAutoSave({
        value: 'test',
        onSave,
        debounceMs: 1000
      })
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.error).toBe(error);
    expect(result.current.isSaving).toBe(false);
  });

  it('should debounce multiple saves', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    const { result, rerender } = renderHook(
      ({ value }) =>
        useAutoSave({
          value,
          onSave,
          debounceMs: 1000
        }),
      { initialProps: { value: 'test1' } }
    );

    // Change value multiple times
    rerender({ value: 'test2' });
    rerender({ value: 'test3' });

    // Fast-forward halfway through debounce
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Should not have saved yet
    expect(onSave).not.toHaveBeenCalled();

    // Complete the debounce period
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Should have only saved once with the latest value
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith('test3');
  });

  it('should save immediately when saveNow is called', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useAutoSave({
        value: 'test',
        onSave,
        debounceMs: 1000
      })
    );

    await act(async () => {
      await result.current.saveNow();
    });

    expect(onSave).toHaveBeenCalledWith('test');
    expect(result.current.lastSaved).toBeInstanceOf(Date);
  });
});

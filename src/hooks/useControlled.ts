import { useState, useCallback, useRef, useEffect } from 'react';

export interface UseControlledOptions<T> {
  /**
   * Controlled value
   */
  value?: T;

  /**
   * Default value for uncontrolled state
   */
  defaultValue?: T;

  /**
   * Callback when value changes
   */
  onChange?: (value: T) => void;

  /**
   * Name for console warnings
   */
  name?: string;
}

export interface UseControlledReturn<T> {
  /**
   * Current value
   */
  value: T;

  /**
   * Whether the component is controlled
   */
  isControlled: boolean;

  /**
   * Set value function
   */
  setValue: (newValue: T | ((prevValue: T) => T)) => void;
}

/**
 * Hook for managing controlled and uncontrolled component states
 */
export function useControlled<T>(options: UseControlledOptions<T>): UseControlledReturn<T> {
  const {
    value: controlledValue,
    defaultValue,
    onChange,
    name = 'Component',
  } = options;

  const { current: isControlled } = useRef(controlledValue !== undefined);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue as T);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      if (isControlled !== (controlledValue !== undefined)) {
        console.error(
          `${name} is changing from ${isControlled ? 'controlled' : 'uncontrolled'} to ${
            isControlled ? 'uncontrolled' : 'controlled'
          }. Components should not switch from controlled to uncontrolled (or vice versa). ` +
          'Decide between using a controlled or uncontrolled value for the lifetime of the component.'
        );
      }
    }
  }, [name, controlledValue, isControlled]);

  const value = isControlled ? controlledValue as T : uncontrolledValue;

  const setValue = useCallback((newValue: T | ((prevValue: T) => T)) => {
    const resolvedNewValue = typeof newValue === 'function'
      ? (newValue as (prevValue: T) => T)(value)
      : newValue;

    if (!isControlled) {
      setUncontrolledValue(resolvedNewValue);
    }

    onChange?.(resolvedNewValue);
  }, [isControlled, onChange, value]);

  return {
    value,
    isControlled,
    setValue,
  };
}

export default useControlled;

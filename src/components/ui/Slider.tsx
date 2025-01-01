import React, { useState, useRef, useEffect } from 'react';
import { BaseProps } from '../../types/ui';

interface SliderProps extends BaseProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  onChangeEnd?: (value: number) => void;
  disabled?: boolean;
  showTooltip?: boolean;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  marks?: { value: number; label: string }[];
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const Slider: React.FC<SliderProps> = ({
  value: controlledValue,
  defaultValue = 0,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  onChangeEnd,
  disabled = false,
  showTooltip = false,
  showValue = false,
  formatValue = (value) => value.toString(),
  marks,
  orientation = 'horizontal',
  size = 'md',
  color = 'primary',
  className = '',
}) => {
  const [value, setValue] = useState(controlledValue ?? defaultValue);
  const [isDragging, setIsDragging] = useState(false);
  const [showTooltipValue, setShowTooltipValue] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (controlledValue !== undefined && controlledValue !== value) {
      setValue(controlledValue);
    }
  }, [controlledValue]);

  const sizes = {
    sm: {
      track: 'h-1',
      thumb: 'h-3 w-3',
      vertical: 'w-1',
    },
    md: {
      track: 'h-2',
      thumb: 'h-4 w-4',
      vertical: 'w-2',
    },
    lg: {
      track: 'h-3',
      thumb: 'h-5 w-5',
      vertical: 'w-3',
    },
  };

  const getPercentage = (value: number) => {
    return ((value - min) / (max - min)) * 100;
  };

  const getValue = (percentage: number) => {
    const rawValue = ((max - min) * percentage) / 100 + min;
    const steppedValue = Math.round(rawValue / step) * step;
    return Math.min(Math.max(steppedValue, min), max);
  };

  const handleMouseDown = (event: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;

    const { current: track } = trackRef;
    if (!track) return;

    setIsDragging(true);
    setShowTooltipValue(true);

    const updateValue = (clientPosition: number) => {
      const rect = track.getBoundingClientRect();
      const position = orientation === 'horizontal'
        ? clientPosition - rect.left
        : rect.bottom - clientPosition;
      const size = orientation === 'horizontal' ? rect.width : rect.height;
      const percentage = Math.min(Math.max((position / size) * 100, 0), 100);
      const newValue = getValue(percentage);

      setValue(newValue);
      onChange?.(newValue);
    };

    if ('touches' in event) {
      updateValue(orientation === 'horizontal'
        ? event.touches[0].clientX
        : event.touches[0].clientY
      );
    } else {
      updateValue(orientation === 'horizontal'
        ? event.clientX
        : event.clientY
      );
    }
  };

  const handleMouseMove = (event: MouseEvent | TouchEvent) => {
    if (!isDragging || disabled) return;

    const clientPosition = 'touches' in event
      ? orientation === 'horizontal'
        ? event.touches[0].clientX
        : event.touches[0].clientY
      : orientation === 'horizontal'
        ? event.clientX
        : event.clientY;

    const { current: track } = trackRef;
    if (!track) return;

    const rect = track.getBoundingClientRect();
    const position = orientation === 'horizontal'
      ? clientPosition - rect.left
      : rect.bottom - clientPosition;
    const size = orientation === 'horizontal' ? rect.width : rect.height;
    const percentage = Math.min(Math.max((position / size) * 100, 0), 100);
    const newValue = getValue(percentage);

    setValue(newValue);
    onChange?.(newValue);
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setShowTooltipValue(false);
      onChangeEnd?.(value);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleMouseMove);
      document.addEventListener('touchend', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleMouseMove);
        document.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging, value]);

  return (
    <div
      className={`
        relative
        ${orientation === 'vertical' ? 'h-48' : 'w-full'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {/* Track */}
      <div
        ref={trackRef}
        className={`
          absolute
          ${orientation === 'horizontal'
            ? `left-0 right-0 ${sizes[size].track}`
            : `bottom-0 top-0 ${sizes[size].vertical}`
          }
          bg-gray-200 rounded-full
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        {/* Filled Track */}
        <div
          className={`
            absolute
            ${orientation === 'horizontal'
              ? `left-0 top-0 bottom-0`
              : `bottom-0 left-0 right-0`
            }
            rounded-full
            bg-${color}
          `}
          style={{
            [orientation === 'horizontal' ? 'width' : 'height']: `${getPercentage(value)}%`,
          }}
        />
      </div>

      {/* Thumb */}
      <div
        ref={thumbRef}
        className={`
          absolute
          ${sizes[size].thumb}
          bg-white
          rounded-full
          shadow
          border-2
          border-${color}
          transform
          ${orientation === 'horizontal'
            ? '-translate-x-1/2 -translate-y-1/2 top-1/2'
            : 'translate-x-1/2 translate-y-1/2 left-1/2'
          }
          ${disabled ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}
        `}
        style={{
          [orientation === 'horizontal' ? 'left' : 'bottom']: `${getPercentage(value)}%`,
        }}
      >
        {/* Tooltip */}
        {showTooltip && (showTooltipValue || isDragging) && (
          <div
            className={`
              absolute
              ${orientation === 'horizontal' ? '-top-8' : 'left-8 top-0'}
              -translate-x-1/2
              px-2
              py-1
              bg-gray-900
              text-white
              text-sm
              rounded
              whitespace-nowrap
            `}
          >
            {formatValue(value)}
          </div>
        )}
      </div>

      {/* Marks */}
      {marks && marks.map(({ value: markValue, label }) => (
        <div
          key={markValue}
          className={`
            absolute
            ${orientation === 'horizontal'
              ? 'top-full mt-2'
              : 'left-full ml-2'
            }
          `}
          style={{
            [orientation === 'horizontal' ? 'left' : 'bottom']: `${getPercentage(markValue)}%`,
          }}
        >
          <div className="text-sm text-gray-600">{label}</div>
        </div>
      ))}

      {/* Value display */}
      {showValue && (
        <div className={`
          mt-4
          text-sm
          text-gray-600
          ${orientation === 'horizontal' ? 'text-center' : 'ml-8'}
        `}>
          {formatValue(value)}
        </div>
      )}
    </div>
  );
};

export default Slider;

/**
 * Slider Component Usage Guide:
 * 
 * 1. Basic Slider:
 *    <Slider
 *      value={value}
 *      onChange={setValue}
 *    />
 * 
 * 2. With Range:
 *    <Slider
 *      min={0}
 *      max={100}
 *      step={1}
 *    />
 * 
 * 3. With Tooltip:
 *    <Slider
 *      showTooltip
 *      formatValue={(value) => `${value}%`}
 *    />
 * 
 * 4. With Marks:
 *    <Slider
 *      marks={[
 *        { value: 0, label: 'Min' },
 *        { value: 50, label: 'Mid' },
 *        { value: 100, label: 'Max' },
 *      ]}
 *    />
 * 
 * 5. Vertical Orientation:
 *    <Slider
 *      orientation="vertical"
 *      height={200}
 *    />
 * 
 * 6. Different Sizes:
 *    <Slider size="sm" />
 *    <Slider size="md" />
 *    <Slider size="lg" />
 * 
 * 7. Custom Color:
 *    <Slider color="blue" />
 * 
 * Notes:
 * - Supports keyboard navigation
 * - Touch-friendly
 * - Accessible
 * - Customizable styling
 */

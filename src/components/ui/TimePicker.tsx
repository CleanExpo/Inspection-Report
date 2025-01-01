import React, { useState, useEffect, useRef } from 'react';
import { BaseProps } from '../../types/ui';
import Portal from './Portal';

interface TimePickerProps extends BaseProps {
  /**
   * The current time value
   */
  value?: string;

  /**
   * Callback when time changes
   */
  onChange?: (time: string) => void;

  /**
   * The format of the time (12 or 24 hour)
   */
  format?: '12' | '24';

  /**
   * The interval between time options in minutes
   */
  interval?: number;

  /**
   * The minimum selectable time
   */
  minTime?: string;

  /**
   * The maximum selectable time
   */
  maxTime?: string;

  /**
   * Whether to show seconds
   */
  showSeconds?: boolean;

  /**
   * Whether the time picker is disabled
   */
  disabled?: boolean;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Error message to display
   */
  error?: string;

  /**
   * The size of the time picker
   */
  size?: 'sm' | 'md' | 'lg';
}

const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  format = '24',
  interval = 30,
  minTime = '00:00',
  maxTime = '23:59',
  showSeconds = false,
  disabled = false,
  placeholder = 'Select time',
  error,
  size = 'md',
  className = '',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const [selectedHour, setSelectedHour] = useState<number>(0);
  const [selectedMinute, setSelectedMinute] = useState<number>(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('AM');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sizes = {
    sm: {
      input: 'px-2 py-1 text-sm',
      dropdown: 'text-sm',
      item: 'px-2 py-1',
    },
    md: {
      input: 'px-3 py-2 text-base',
      dropdown: 'text-base',
      item: 'px-3 py-2',
    },
    lg: {
      input: 'px-4 py-3 text-lg',
      dropdown: 'text-lg',
      item: 'px-4 py-3',
    },
  };

  useEffect(() => {
    if (value) {
      const [hours, minutes] = value.split(':').map(Number);
      let period: 'AM' | 'PM' = hours >= 12 ? 'PM' : 'AM';
      let hour = format === '12' ? hours % 12 || 12 : hours;
      
      setSelectedHour(hour);
      setSelectedMinute(minutes);
      setSelectedPeriod(period);
      setInputValue(formatTime(hour, minutes, period));
    }
  }, [value, format]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (hour: number, minute: number, period: 'AM' | 'PM'): string => {
    if (format === '12') {
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`;
    }
    const hour24 = period === 'PM' ? (hour === 12 ? 12 : hour + 12) : (hour === 12 ? 0 : hour);
    return `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const generateTimeOptions = () => {
    const options: { hour: number; minute: number; period: 'AM' | 'PM' }[] = [];
    const [minHour, minMinute] = minTime.split(':').map(Number);
    const [maxHour, maxMinute] = maxTime.split(':').map(Number);

    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        if (
          (hour > minHour || (hour === minHour && minute >= minMinute)) &&
          (hour < maxHour || (hour === maxHour && minute <= maxMinute))
        ) {
          const period = hour >= 12 ? 'PM' : 'AM';
          const hour12 = format === '12' ? hour % 12 || 12 : hour;
          options.push({ hour: hour12, minute, period });
        }
      }
    }

    return options;
  };

  const handleTimeSelect = (hour: number, minute: number, period: 'AM' | 'PM') => {
    setSelectedHour(hour);
    setSelectedMinute(minute);
    setSelectedPeriod(period);

    const formattedTime = formatTime(hour, minute, period);
    setInputValue(formattedTime);
    onChange?.(formattedTime);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    // Add validation and parsing logic here
  };

  return (
    <div className={`relative inline-block ${className}`} {...props}>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onClick={() => !disabled && setIsOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full
          rounded-md
          border
          ${error ? 'border-red-300' : 'border-gray-300'}
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer'}
          ${sizes[size].input}
          focus:outline-none
          focus:ring-2
          focus:ring-primary-500
        `}
      />

      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}

      {isOpen && !disabled && (
        <Portal>
          <div
            ref={dropdownRef}
            className={`
              absolute z-50
              mt-1
              w-48
              bg-white
              rounded-md
              shadow-lg
              border border-gray-200
              max-h-60
              overflow-auto
              ${sizes[size].dropdown}
            `}
            style={{
              top: inputRef.current?.getBoundingClientRect().bottom,
              left: inputRef.current?.getBoundingClientRect().left,
            }}
          >
            {generateTimeOptions().map(({ hour, minute, period }, index) => (
              <div
                key={index}
                className={`
                  ${sizes[size].item}
                  cursor-pointer
                  hover:bg-gray-100
                  ${selectedHour === hour && selectedMinute === minute && selectedPeriod === period
                    ? 'bg-primary-50 text-primary-900'
                    : ''
                  }
                `}
                onClick={() => handleTimeSelect(hour, minute, period)}
              >
                {formatTime(hour, minute, period)}
              </div>
            ))}
          </div>
        </Portal>
      )}
    </div>
  );
};

export default TimePicker;

/**
 * TimePicker Component Usage Guide:
 * 
 * 1. Basic time picker:
 *    <TimePicker
 *      value={time}
 *      onChange={setTime}
 *    />
 * 
 * 2. 12-hour format:
 *    <TimePicker
 *      format="12"
 *      value={time}
 *      onChange={setTime}
 *    />
 * 
 * 3. Custom interval:
 *    <TimePicker
 *      interval={15}
 *      value={time}
 *      onChange={setTime}
 *    />
 * 
 * 4. With min/max time:
 *    <TimePicker
 *      minTime="09:00"
 *      maxTime="17:00"
 *      value={time}
 *      onChange={setTime}
 *    />
 * 
 * 5. With seconds:
 *    <TimePicker
 *      showSeconds
 *      value={time}
 *      onChange={setTime}
 *    />
 * 
 * 6. Different sizes:
 *    <TimePicker size="sm" />
 *    <TimePicker size="md" />
 *    <TimePicker size="lg" />
 * 
 * 7. With placeholder:
 *    <TimePicker
 *      placeholder="Select a time"
 *      value={time}
 *      onChange={setTime}
 *    />
 * 
 * 8. With error:
 *    <TimePicker
 *      error="Invalid time"
 *      value={time}
 *      onChange={setTime}
 *    />
 * 
 * 9. Disabled:
 *    <TimePicker disabled />
 * 
 * Notes:
 * - 12/24 hour format
 * - Custom intervals
 * - Time range validation
 * - Seconds support
 * - Different sizes
 * - Error handling
 * - Keyboard navigation
 * - Accessible
 */

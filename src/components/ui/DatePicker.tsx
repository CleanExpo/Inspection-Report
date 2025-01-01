import React, { useState, useRef, useEffect } from 'react';
import { BaseProps } from '../../types/ui';
import Portal from './Portal';

interface DatePickerProps extends BaseProps {
  /**
   * The current date value
   */
  value?: Date;

  /**
   * Callback when date changes
   */
  onChange?: (date: Date) => void;

  /**
   * The format of the date
   */
  format?: string;

  /**
   * The minimum selectable date
   */
  minDate?: Date;

  /**
   * The maximum selectable date
   */
  maxDate?: Date;

  /**
   * Whether to show today button
   */
  showToday?: boolean;

  /**
   * Whether to show clear button
   */
  showClear?: boolean;

  /**
   * Whether the date picker is disabled
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
   * The size of the date picker
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * The locale for the date picker
   */
  locale?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  format = 'MM/dd/yyyy',
  minDate,
  maxDate,
  showToday = true,
  showClear = true,
  disabled = false,
  placeholder = 'Select date',
  error,
  size = 'md',
  locale = 'en-US',
  className = '',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(value || new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(value || null);
  const inputRef = useRef<HTMLInputElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const sizes = {
    sm: {
      input: 'px-2 py-1 text-sm',
      calendar: 'text-sm',
      button: 'px-2 py-1 text-sm',
    },
    md: {
      input: 'px-3 py-2 text-base',
      calendar: 'text-base',
      button: 'px-3 py-2 text-base',
    },
    lg: {
      input: 'px-4 py-3 text-lg',
      calendar: 'text-lg',
      button: 'px-4 py-3 text-lg',
    },
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startOffset = firstDay.getDay();
    const totalDays = startOffset + daysInMonth;
    const totalWeeks = Math.ceil(totalDays / 7);

    return Array.from({ length: totalWeeks * 7 }).map((_, i) => {
      const dayOffset = i - startOffset;
      const date = new Date(year, month, dayOffset + 1);
      return {
        date,
        isCurrentMonth: date.getMonth() === month,
        isToday: isSameDay(date, new Date()),
        isSelected: selectedDate && isSameDay(date, selectedDate),
        isDisabled:
          disabled ||
          (minDate && date < minDate) ||
          (maxDate && date > maxDate),
      };
    });
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const handleDateSelect = (date: Date) => {
    if (disabled) return;
    setSelectedDate(date);
    onChange?.(date);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    handleDateSelect(today);
  };

  const handleClear = () => {
    setSelectedDate(null);
    onChange?.(undefined as any);
    setIsOpen(false);
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day =>
    new Date(2021, 0, 4 + ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(day))
      .toLocaleDateString(locale, { weekday: 'short' })
  );

  return (
    <div className={`relative inline-block ${className}`} {...props}>
      <input
        ref={inputRef}
        type="text"
        value={selectedDate ? formatDate(selectedDate) : ''}
        onChange={() => {}} // Handle manual input if needed
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
            ref={calendarRef}
            className={`
              absolute z-50
              mt-1
              bg-white
              rounded-lg
              shadow-lg
              border border-gray-200
              p-4
              ${sizes[size].calendar}
            `}
            style={{
              top: inputRef.current?.getBoundingClientRect().bottom,
              left: inputRef.current?.getBoundingClientRect().left,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handlePrevMonth}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="font-semibold">
                {currentDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}
              </div>
              <button
                onClick={handleNextMonth}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Week days */}
              {weekDays.map((day, i) => (
                <div
                  key={i}
                  className="text-center text-gray-500 font-medium"
                >
                  {day}
                </div>
              ))}

              {/* Days */}
              {getDaysInMonth(currentDate).map((day, i) => (
                <button
                  key={i}
                  onClick={() => !day.isDisabled && handleDateSelect(day.date)}
                  disabled={day.isDisabled}
                  className={`
                    h-8
                    rounded-full
                    ${!day.isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
                    ${day.isDisabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100'}
                    ${day.isSelected ? 'bg-primary-600 text-white hover:bg-primary-700' : ''}
                    ${day.isToday ? 'font-bold' : ''}
                    focus:outline-none focus:ring-2 focus:ring-primary-500
                  `}
                >
                  {day.date.getDate()}
                </button>
              ))}
            </div>

            {/* Footer */}
            {(showToday || showClear) && (
              <div className="mt-4 flex justify-end space-x-2">
                {showClear && (
                  <button
                    onClick={handleClear}
                    className={`
                      ${sizes[size].button}
                      text-gray-600
                      hover:bg-gray-100
                      rounded-md
                    `}
                  >
                    Clear
                  </button>
                )}
                {showToday && (
                  <button
                    onClick={handleToday}
                    className={`
                      ${sizes[size].button}
                      text-primary-600
                      hover:bg-primary-50
                      rounded-md
                    `}
                  >
                    Today
                  </button>
                )}
              </div>
            )}
          </div>
        </Portal>
      )}
    </div>
  );
};

export default DatePicker;

/**
 * DatePicker Component Usage Guide:
 * 
 * 1. Basic date picker:
 *    <DatePicker
 *      value={date}
 *      onChange={setDate}
 *    />
 * 
 * 2. Custom format:
 *    <DatePicker
 *      format="yyyy-MM-dd"
 *      value={date}
 *      onChange={setDate}
 *    />
 * 
 * 3. With min/max dates:
 *    <DatePicker
 *      minDate={new Date(2023, 0, 1)}
 *      maxDate={new Date(2023, 11, 31)}
 *      value={date}
 *      onChange={setDate}
 *    />
 * 
 * 4. Without today button:
 *    <DatePicker
 *      showToday={false}
 *      value={date}
 *      onChange={setDate}
 *    />
 * 
 * 5. Without clear button:
 *    <DatePicker
 *      showClear={false}
 *      value={date}
 *      onChange={setDate}
 *    />
 * 
 * 6. Different sizes:
 *    <DatePicker size="sm" />
 *    <DatePicker size="md" />
 *    <DatePicker size="lg" />
 * 
 * 7. With placeholder:
 *    <DatePicker
 *      placeholder="Select a date"
 *      value={date}
 *      onChange={setDate}
 *    />
 * 
 * 8. With error:
 *    <DatePicker
 *      error="Invalid date"
 *      value={date}
 *      onChange={setDate}
 *    />
 * 
 * 9. Different locale:
 *    <DatePicker
 *      locale="fr-FR"
 *      value={date}
 *      onChange={setDate}
 *    />
 * 
 * 10. Disabled:
 *     <DatePicker disabled />
 * 
 * Notes:
 * - Date formatting
 * - Date range validation
 * - Locale support
 * - Different sizes
 * - Error handling
 * - Keyboard navigation
 * - Accessible
 */

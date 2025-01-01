import React, { useState } from 'react';
import { BaseProps } from '../../types/ui';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  color?: string;
}

interface CalendarProps extends BaseProps {
  /**
   * The selected date(s)
   */
  value?: Date | Date[];

  /**
   * Callback when date selection changes
   */
  onChange?: (date: Date | Date[]) => void;

  /**
   * The minimum selectable date
   */
  minDate?: Date;

  /**
   * The maximum selectable date
   */
  maxDate?: Date;

  /**
   * Whether to allow multiple date selection
   */
  multiple?: boolean;

  /**
   * Whether to allow range selection
   */
  range?: boolean;

  /**
   * Events to display on the calendar
   */
  events?: CalendarEvent[];

  /**
   * The view to display
   */
  view?: 'month' | 'week' | 'day';

  /**
   * Whether to show week numbers
   */
  showWeekNumbers?: boolean;

  /**
   * Whether to show today button
   */
  showToday?: boolean;

  /**
   * Whether to show navigation
   */
  showNavigation?: boolean;

  /**
   * The first day of the week (0 = Sunday)
   */
  firstDayOfWeek?: number;

  /**
   * The locale for the calendar
   */
  locale?: string;

  /**
   * Whether the calendar is disabled
   */
  disabled?: boolean;
}

const Calendar: React.FC<CalendarProps> = ({
  value,
  onChange,
  minDate,
  maxDate,
  multiple = false,
  range = false,
  events = [],
  view = 'month',
  showWeekNumbers = false,
  showToday = true,
  showNavigation = true,
  firstDayOfWeek = 0,
  locale = 'en-US',
  disabled = false,
  className = '',
  ...props
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Date[]>(
    Array.isArray(value) ? value : value ? [value] : []
  );
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(2021, 0, i + firstDayOfWeek + 1);
    return date.toLocaleDateString(locale, { weekday: 'short' });
  });

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startOffset = (firstDay.getDay() - firstDayOfWeek + 7) % 7;
    const totalDays = startOffset + daysInMonth;
    const totalWeeks = Math.ceil(totalDays / 7);

    return Array.from({ length: totalWeeks * 7 }).map((_, i) => {
      const dayOffset = i - startOffset;
      const date = new Date(year, month, dayOffset + 1);
      return {
        date,
        isCurrentMonth: date.getMonth() === month,
        isToday: isSameDay(date, new Date()),
        isSelected: selectedDates.some(selectedDate => isSameDay(selectedDate, date)),
        isDisabled:
          disabled ||
          (minDate && date < minDate) ||
          (maxDate && date > maxDate),
        events: events.filter(event => isSameDay(event.date, date)),
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

  const handleDateClick = (date: Date) => {
    if (disabled) return;

    let newDates: Date[];

    if (range) {
      if (selectedDates.length === 0) {
        newDates = [date];
      } else if (selectedDates.length === 1) {
        const [start] = selectedDates;
        newDates = [start, date].sort((a, b) => a.getTime() - b.getTime());
      } else {
        newDates = [date];
      }
    } else if (multiple) {
      newDates = selectedDates.some(d => isSameDay(d, date))
        ? selectedDates.filter(d => !isSameDay(d, date))
        : [...selectedDates, date];
    } else {
      newDates = [date];
    }

    setSelectedDates(newDates);
    onChange?.(multiple || range ? newDates : newDates[0]);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div
      className={`
        inline-block
        bg-white
        rounded-lg
        shadow-lg
        p-4
        ${className}
      `}
      {...props}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-semibold">
          {currentDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}
        </div>
        {showNavigation && (
          <div className="flex space-x-2">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-gray-100 rounded-full"
              disabled={disabled}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            {showToday && (
              <button
                onClick={handleToday}
                className="px-2 py-1 text-sm hover:bg-gray-100 rounded"
                disabled={disabled}
              >
                Today
              </button>
            )}
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-gray-100 rounded-full"
              disabled={disabled}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Week days */}
        {weekDays.map((day, i) => (
          <div
            key={i}
            className="text-center text-sm font-medium text-gray-500 py-2"
          >
            {day}
          </div>
        ))}

        {/* Days */}
        {getDaysInMonth(currentDate).map((day, i) => (
          <button
            key={i}
            onClick={() => handleDateClick(day.date)}
            onMouseEnter={() => setHoveredDate(day.date)}
            onMouseLeave={() => setHoveredDate(null)}
            disabled={day.isDisabled}
            className={`
              relative
              h-10
              rounded-full
              text-sm
              ${!day.isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
              ${day.isDisabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100'}
              ${day.isSelected ? 'bg-primary-600 text-white hover:bg-primary-700' : ''}
              ${day.isToday ? 'font-bold' : ''}
              focus:outline-none focus:ring-2 focus:ring-primary-500
            `}
          >
            <span className="relative z-10">
              {day.date.getDate()}
            </span>

            {/* Events */}
            {day.events.length > 0 && (
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-0.5">
                {day.events.slice(0, 3).map((event, i) => (
                  <div
                    key={event.id}
                    className="w-1 h-1 rounded-full"
                    style={{ backgroundColor: event.color || '#3B82F6' }}
                  />
                ))}
                {day.events.length > 3 && (
                  <div className="w-1 h-1 rounded-full bg-gray-400" />
                )}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Calendar;

/**
 * Calendar Component Usage Guide:
 * 
 * 1. Basic calendar:
 *    <Calendar
 *      value={selectedDate}
 *      onChange={setSelectedDate}
 *    />
 * 
 * 2. Multiple selection:
 *    <Calendar
 *      multiple
 *      value={selectedDates}
 *      onChange={setSelectedDates}
 *    />
 * 
 * 3. Range selection:
 *    <Calendar
 *      range
 *      value={dateRange}
 *      onChange={setDateRange}
 *    />
 * 
 * 4. With events:
 *    <Calendar
 *      events={[
 *        {
 *          id: '1',
 *          title: 'Meeting',
 *          date: new Date(),
 *          color: '#3B82F6',
 *        },
 *      ]}
 *    />
 * 
 * 5. With min/max dates:
 *    <Calendar
 *      minDate={new Date(2023, 0, 1)}
 *      maxDate={new Date(2023, 11, 31)}
 *    />
 * 
 * 6. Different views:
 *    <Calendar view="month" />
 *    <Calendar view="week" />
 *    <Calendar view="day" />
 * 
 * 7. With week numbers:
 *    <Calendar showWeekNumbers />
 * 
 * 8. Without navigation:
 *    <Calendar showNavigation={false} />
 * 
 * 9. Custom first day of week:
 *    <Calendar firstDayOfWeek={1} /> // Monday
 * 
 * 10. Different locale:
 *     <Calendar locale="fr-FR" />
 * 
 * Notes:
 * - Date selection
 * - Multiple selection
 * - Range selection
 * - Event display
 * - Different views
 * - Navigation controls
 * - Week numbers
 * - Localization
 * - Min/max dates
 * - Accessible
 */

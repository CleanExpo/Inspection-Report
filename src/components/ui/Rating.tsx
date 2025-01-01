import React, { useState } from 'react';
import { BaseProps } from '../../types/ui';

interface RatingProps extends BaseProps {
  /**
   * The current rating value
   */
  value?: number;

  /**
   * Callback when rating changes
   */
  onChange?: (value: number) => void;

  /**
   * The maximum rating value
   */
  max?: number;

  /**
   * The size of the rating icons
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Whether to allow half ratings
   */
  allowHalf?: boolean;

  /**
   * Whether to show the rating value
   */
  showValue?: boolean;

  /**
   * The precision of the rating value
   */
  precision?: number;

  /**
   * Whether the rating is read-only
   */
  readOnly?: boolean;

  /**
   * Whether the rating is disabled
   */
  disabled?: boolean;

  /**
   * The color of the rating icons
   */
  color?: string;

  /**
   * Custom icon for filled state
   */
  filledIcon?: React.ReactNode;

  /**
   * Custom icon for half-filled state
   */
  halfFilledIcon?: React.ReactNode;

  /**
   * Custom icon for empty state
   */
  emptyIcon?: React.ReactNode;

  /**
   * Label for accessibility
   */
  label?: string;
}

const Rating: React.FC<RatingProps> = ({
  value = 0,
  onChange,
  max = 5,
  size = 'md',
  allowHalf = false,
  showValue = false,
  precision = 2,
  readOnly = false,
  disabled = false,
  color = '#FCD34D',
  filledIcon,
  halfFilledIcon,
  emptyIcon,
  label = 'Rating',
  className = '',
  ...props
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const defaultIcon = (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );

  const getIconColor = (index: number) => {
    const displayValue = hoverValue ?? value;
    if (index + 1 <= displayValue) {
      return color;
    }
    if (allowHalf && index + 0.5 <= displayValue) {
      return color;
    }
    return '#E5E7EB';
  };

  const handleMouseMove = (event: React.MouseEvent, index: number) => {
    if (readOnly || disabled) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percent = x / rect.width;

    let newValue = index + 1;
    if (allowHalf) {
      newValue = index + (percent <= 0.5 ? 0.5 : 1);
    }

    setHoverValue(newValue);

    if (isDragging) {
      handleValueChange(newValue);
    }
  };

  const handleValueChange = (newValue: number) => {
    const roundedValue = Number(newValue.toFixed(precision));
    onChange?.(roundedValue);
  };

  const handleMouseLeave = () => {
    if (!readOnly && !disabled) {
      setHoverValue(null);
      setIsDragging(false);
    }
  };

  return (
    <div
      className={`inline-flex items-center space-x-2 ${className}`}
      role="radiogroup"
      aria-label={label}
      {...props}
    >
      <div
        className="flex"
        onMouseLeave={handleMouseLeave}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
      >
        {Array.from({ length: max }).map((_, index) => (
          <div
            key={index}
            className={`
              ${!readOnly && !disabled ? 'cursor-pointer' : ''}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            onClick={() => !readOnly && !disabled && handleValueChange(index + 1)}
            onMouseMove={(e) => handleMouseMove(e, index)}
            role="radio"
            aria-checked={value > index}
            aria-label={`${index + 1} stars`}
          >
            <div className={`${sizes[size]} text-${getIconColor(index)}`}>
              {filledIcon || defaultIcon}
            </div>
          </div>
        ))}
      </div>
      {showValue && (
        <span className="text-sm text-gray-600">
          {(hoverValue ?? value).toFixed(precision)}
        </span>
      )}
    </div>
  );
};

export default Rating;

/**
 * Rating Component Usage Guide:
 * 
 * 1. Basic rating:
 *    <Rating
 *      value={rating}
 *      onChange={setRating}
 *    />
 * 
 * 2. Different sizes:
 *    <Rating size="sm" />
 *    <Rating size="md" />
 *    <Rating size="lg" />
 * 
 * 3. Half ratings:
 *    <Rating
 *      allowHalf
 *      value={3.5}
 *      onChange={setRating}
 *    />
 * 
 * 4. Custom maximum:
 *    <Rating
 *      max={10}
 *      value={rating}
 *      onChange={setRating}
 *    />
 * 
 * 5. Show value:
 *    <Rating
 *      showValue
 *      value={rating}
 *      onChange={setRating}
 *    />
 * 
 * 6. Custom precision:
 *    <Rating
 *      precision={1}
 *      value={rating}
 *      onChange={setRating}
 *    />
 * 
 * 7. Read-only:
 *    <Rating
 *      readOnly
 *      value={4}
 *    />
 * 
 * 8. Disabled:
 *    <Rating
 *      disabled
 *      value={3}
 *    />
 * 
 * 9. Custom color:
 *    <Rating
 *      color="#F59E0B"
 *      value={rating}
 *      onChange={setRating}
 *    />
 * 
 * 10. Custom icons:
 *     <Rating
 *       filledIcon={<HeartFilledIcon />}
 *       emptyIcon={<HeartEmptyIcon />}
 *       value={rating}
 *       onChange={setRating}
 *     />
 * 
 * Notes:
 * - Multiple sizes
 * - Half ratings
 * - Custom maximum
 * - Value display
 * - Precision control
 * - Read-only mode
 * - Disabled state
 * - Custom colors
 * - Custom icons
 * - Accessible
 */

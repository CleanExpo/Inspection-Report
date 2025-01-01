import React, { forwardRef } from 'react';
import { BaseProps } from '../../types/ui';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>, BaseProps {
  /**
   * The label for the checkbox
   */
  label?: React.ReactNode;

  /**
   * The size of the checkbox
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * The color of the checkbox
   */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

  /**
   * Whether the checkbox is in an indeterminate state
   */
  indeterminate?: boolean;

  /**
   * Helper text to display below the checkbox
   */
  helperText?: string;

  /**
   * Error message to display
   */
  error?: string;

  /**
   * The position of the label
   */
  labelPosition?: 'left' | 'right';

  /**
   * Whether to show a ripple effect on click
   */
  ripple?: boolean;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  size = 'md',
  color = 'primary',
  indeterminate = false,
  helperText,
  error,
  labelPosition = 'right',
  ripple = true,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  const sizes = {
    sm: {
      checkbox: 'w-3.5 h-3.5',
      text: 'text-sm',
      icon: 'w-2.5 h-2.5',
    },
    md: {
      checkbox: 'w-4 h-4',
      text: 'text-base',
      icon: 'w-3 h-3',
    },
    lg: {
      checkbox: 'w-5 h-5',
      text: 'text-lg',
      icon: 'w-4 h-4',
    },
  };

  const colors = {
    primary: {
      bg: 'bg-primary-600',
      border: 'border-primary-600',
      hover: 'hover:bg-primary-700',
      focus: 'focus:ring-primary-500',
    },
    secondary: {
      bg: 'bg-gray-600',
      border: 'border-gray-600',
      hover: 'hover:bg-gray-700',
      focus: 'focus:ring-gray-500',
    },
    success: {
      bg: 'bg-green-600',
      border: 'border-green-600',
      hover: 'hover:bg-green-700',
      focus: 'focus:ring-green-500',
    },
    warning: {
      bg: 'bg-yellow-600',
      border: 'border-yellow-600',
      hover: 'hover:bg-yellow-700',
      focus: 'focus:ring-yellow-500',
    },
    error: {
      bg: 'bg-red-600',
      border: 'border-red-600',
      hover: 'hover:bg-red-700',
      focus: 'focus:ring-red-500',
    },
    info: {
      bg: 'bg-blue-600',
      border: 'border-blue-600',
      hover: 'hover:bg-blue-700',
      focus: 'focus:ring-blue-500',
    },
  };

  React.useEffect(() => {
    if (ref && 'current' in ref && ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [ref, indeterminate]);

  const renderIcon = () => {
    if (indeterminate) {
      return (
        <svg className={`${sizes[size].icon} text-white`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 12h16" />
        </svg>
      );
    }

    return (
      <svg className={`${sizes[size].icon} text-white`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
      </svg>
    );
  };

  const checkbox = (
    <div className="relative inline-flex">
      <input
        ref={ref}
        type="checkbox"
        className={`
          peer
          appearance-none
          rounded
          border
          transition-colors
          ${sizes[size].checkbox}
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          checked:${colors[color].bg}
          checked:${colors[color].border}
          checked:${colors[color].hover}
          focus:outline-none
          focus:ring-2
          focus:ring-offset-2
          ${colors[color].focus}
        `}
        disabled={disabled}
        {...props}
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 peer-checked:opacity-100">
        {renderIcon()}
      </div>
      {ripple && !disabled && (
        <div className="absolute -inset-2 transition-transform peer-active:scale-75 peer-active:bg-current peer-active:bg-opacity-5 rounded-full" />
      )}
    </div>
  );

  return (
    <div className={className}>
      <label className={`inline-flex items-center ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
        {labelPosition === 'left' && label && (
          <span className={`${sizes[size].text} mr-2 ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
            {label}
          </span>
        )}
        {checkbox}
        {labelPosition === 'right' && label && (
          <span className={`${sizes[size].text} ml-2 ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
            {label}
          </span>
        )}
      </label>
      {(helperText || error) && (
        <p className={`mt-1 ${sizes[size].text} ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;

/**
 * Checkbox Component Usage Guide:
 * 
 * 1. Basic checkbox:
 *    <Checkbox label="Check me" />
 * 
 * 2. Different sizes:
 *    <Checkbox size="sm" />
 *    <Checkbox size="md" />
 *    <Checkbox size="lg" />
 * 
 * 3. Different colors:
 *    <Checkbox color="primary" />
 *    <Checkbox color="secondary" />
 *    <Checkbox color="success" />
 *    <Checkbox color="warning" />
 *    <Checkbox color="error" />
 *    <Checkbox color="info" />
 * 
 * 4. Indeterminate state:
 *    <Checkbox
 *      indeterminate
 *      checked={false}
 *    />
 * 
 * 5. With helper text:
 *    <Checkbox
 *      label="Terms"
 *      helperText="Please accept the terms"
 *    />
 * 
 * 6. With error:
 *    <Checkbox
 *      label="Required"
 *      error="This field is required"
 *    />
 * 
 * 7. Label position:
 *    <Checkbox
 *      label="Left label"
 *      labelPosition="left"
 *    />
 * 
 * 8. Disabled state:
 *    <Checkbox
 *      disabled
 *      label="Disabled"
 *    />
 * 
 * 9. Without ripple:
 *    <Checkbox
 *      ripple={false}
 *      label="No ripple"
 *    />
 * 
 * 10. Controlled:
 *     <Checkbox
 *       checked={checked}
 *       onChange={(e) => setChecked(e.target.checked)}
 *     />
 * 
 * Notes:
 * - Multiple sizes
 * - Different colors
 * - Indeterminate state
 * - Helper text
 * - Error messages
 * - Label positioning
 * - Ripple effect
 * - Disabled state
 * - Accessible
 */

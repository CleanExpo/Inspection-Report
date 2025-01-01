import React, { forwardRef } from 'react';
import { BaseProps } from '../../types/ui';

type InputVariant = 'outlined' | 'filled' | 'underlined';
type InputSize = 'sm' | 'md' | 'lg';
type InputValidationState = 'success' | 'warning' | 'error';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>, BaseProps {
  /**
   * The variant of the input
   */
  variant?: InputVariant;

  /**
   * The size of the input
   */
  size?: InputSize;

  /**
   * The label for the input
   */
  label?: string;

  /**
   * Helper text to display below the input
   */
  helperText?: string;

  /**
   * Error message to display
   */
  error?: string;

  /**
   * The validation state of the input
   */
  validationState?: InputValidationState;

  /**
   * Whether the input is full width
   */
  fullWidth?: boolean;

  /**
   * The icon to display before the input
   */
  leftIcon?: React.ReactNode;

  /**
   * The icon to display after the input
   */
  rightIcon?: React.ReactNode;

  /**
   * Whether to show a clear button
   */
  clearable?: boolean;

  /**
   * Callback when the clear button is clicked
   */
  onClear?: () => void;

  /**
   * Whether the input is loading
   */
  loading?: boolean;

  /**
   * Whether to show the character count
   */
  showCount?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  variant = 'outlined',
  size = 'md',
  label,
  helperText,
  error,
  validationState,
  fullWidth = false,
  leftIcon,
  rightIcon,
  clearable = false,
  onClear,
  loading = false,
  showCount = false,
  disabled = false,
  required = false,
  className = '',
  value = '',
  maxLength,
  ...props
}, ref) => {
  const variants: Record<InputVariant, string> = {
    outlined: 'border border-gray-300 bg-white focus:ring-2 focus:ring-primary focus:ring-opacity-50',
    filled: 'border-0 border-b-2 border-gray-300 bg-gray-100 focus:bg-gray-50 focus:border-primary',
    underlined: 'border-0 border-b-2 border-gray-300 focus:border-primary',
  };

  const sizes: Record<InputSize, {
    padding: string;
    text: string;
    height: string;
    icon: string;
  }> = {
    sm: {
      padding: 'px-3 py-1.5',
      text: 'text-sm',
      height: 'h-8',
      icon: 'w-4 h-4',
    },
    md: {
      padding: 'px-4 py-2',
      text: 'text-base',
      height: 'h-10',
      icon: 'w-5 h-5',
    },
    lg: {
      padding: 'px-4 py-2.5',
      text: 'text-lg',
      height: 'h-12',
      icon: 'w-6 h-6',
    },
  };

  const validationStates: Record<InputValidationState, {
    ring: string;
    border: string;
    text: string;
    icon: string;
  }> = {
    success: {
      ring: 'focus:ring-green-500',
      border: 'border-green-500',
      text: 'text-green-600',
      icon: 'text-green-500',
    },
    warning: {
      ring: 'focus:ring-yellow-500',
      border: 'border-yellow-500',
      text: 'text-yellow-600',
      icon: 'text-yellow-500',
    },
    error: {
      ring: 'focus:ring-red-500',
      border: 'border-red-500',
      text: 'text-red-600',
      icon: 'text-red-500',
    },
  };

  const getValidationClasses = () => {
    if (error) {
      return validationStates.error;
    }
    if (validationState) {
      return validationStates[validationState];
    }
    return {
      ring: '',
      border: '',
      text: '',
      icon: '',
    };
  };

  const validationClasses = getValidationClasses();

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {/* Label */}
      {label && (
        <label className={`block font-medium text-gray-700 mb-1 ${sizes[size].text}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input wrapper */}
      <div className="relative">
        {/* Left icon */}
        {leftIcon && (
          <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${validationClasses.icon}`}>
            <span className={sizes[size].icon}>{leftIcon}</span>
          </div>
        )}

        {/* Input */}
        <input
          ref={ref}
          value={value}
          disabled={disabled || loading}
          required={required}
          maxLength={maxLength}
          className={`
            block
            rounded-md
            ${variants[variant]}
            ${sizes[size].padding}
            ${sizes[size].text}
            ${sizes[size].height}
            ${leftIcon ? 'pl-10' : ''}
            ${(rightIcon || clearable || loading || (showCount && maxLength)) ? 'pr-10' : ''}
            ${validationClasses.border}
            ${validationClasses.ring}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
            ${fullWidth ? 'w-full' : ''}
            transition-colors
            focus:outline-none
          `}
          {...props}
        />

        {/* Right content */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-1">
          {/* Character count */}
          {showCount && maxLength && (
            <span className="text-sm text-gray-400">
              {value.toString().length}/{maxLength}
            </span>
          )}

          {/* Clear button */}
          {clearable && value && !disabled && !loading && (
            <button
              type="button"
              onClick={onClear}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className={sizes[size].icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Loading spinner */}
          {loading && (
            <svg
              className={`animate-spin ${sizes[size].icon} text-gray-400`}
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}

          {/* Right icon */}
          {rightIcon && !loading && (
            <span className={`${sizes[size].icon} ${validationClasses.icon}`}>
              {rightIcon}
            </span>
          )}
        </div>
      </div>

      {/* Helper text or error message */}
      {(helperText || error) && (
        <p className={`mt-1 ${sizes[size].text} ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

/**
 * Input Component Usage Guide:
 * 
 * 1. Basic input:
 *    <Input placeholder="Enter text" />
 * 
 * 2. Different variants:
 *    <Input variant="outlined" />
 *    <Input variant="filled" />
 *    <Input variant="underlined" />
 * 
 * 3. Different sizes:
 *    <Input size="sm" />
 *    <Input size="md" />
 *    <Input size="lg" />
 * 
 * 4. With label:
 *    <Input
 *      label="Username"
 *      placeholder="Enter username"
 *    />
 * 
 * 5. With helper text:
 *    <Input
 *      helperText="This is a helper text"
 *      placeholder="Enter text"
 *    />
 * 
 * 6. With error:
 *    <Input
 *      error="This field is required"
 *      placeholder="Enter text"
 *    />
 * 
 * 7. With validation state:
 *    <Input validationState="success" />
 *    <Input validationState="warning" />
 *    <Input validationState="error" />
 * 
 * 8. With icons:
 *    <Input
 *      leftIcon={<Icon />}
 *      rightIcon={<Icon />}
 *    />
 * 
 * 9. Clearable:
 *    <Input
 *      clearable
 *      onClear={() => setValue('')}
 *    />
 * 
 * 10. Loading state:
 *     <Input loading />
 * 
 * 11. With character count:
 *     <Input
 *       showCount
 *       maxLength={100}
 *     />
 * 
 * Notes:
 * - Multiple variants
 * - Different sizes
 * - Label support
 * - Helper text
 * - Error messages
 * - Validation states
 * - Icon support
 * - Clearable
 * - Loading state
 * - Character count
 * - Accessible
 */

import React, { forwardRef } from 'react';
import { BaseProps } from '../../types/ui';

interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>, BaseProps {
  /**
   * The label for the toggle
   */
  label?: React.ReactNode;

  /**
   * The size of the toggle
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * The color of the toggle
   */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

  /**
   * Helper text to display below the toggle
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
   * Whether to show icons in the toggle
   */
  icons?: boolean;

  /**
   * Custom icon for the "on" state
   */
  onIcon?: React.ReactNode;

  /**
   * Custom icon for the "off" state
   */
  offIcon?: React.ReactNode;
}

const Toggle = forwardRef<HTMLInputElement, ToggleProps>(({
  label,
  size = 'md',
  color = 'primary',
  helperText,
  error,
  labelPosition = 'right',
  icons = false,
  onIcon,
  offIcon,
  disabled = false,
  checked = false,
  className = '',
  ...props
}, ref) => {
  const sizes = {
    sm: {
      toggle: 'w-8 h-4',
      thumb: 'w-3 h-3',
      translate: 'translate-x-4',
      text: 'text-sm',
      icon: 'w-2 h-2',
    },
    md: {
      toggle: 'w-11 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-5',
      text: 'text-base',
      icon: 'w-3 h-3',
    },
    lg: {
      toggle: 'w-14 h-8',
      thumb: 'w-7 h-7',
      translate: 'translate-x-6',
      text: 'text-lg',
      icon: 'w-4 h-4',
    },
  };

  const colors = {
    primary: 'bg-primary-600',
    secondary: 'bg-gray-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
  };

  const defaultIcons = {
    on: (
      <svg className={sizes[size].icon} fill="currentColor" viewBox="0 0 12 12">
        <path d="M3.707 5.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L5 6.586 3.707 5.293z" />
      </svg>
    ),
    off: (
      <svg className={sizes[size].icon} fill="currentColor" viewBox="0 0 12 12">
        <path d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  };

  return (
    <div className={className}>
      <label className={`inline-flex items-center ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
        {labelPosition === 'left' && label && (
          <span className={`${sizes[size].text} mr-3 ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
            {label}
          </span>
        )}

        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            className="sr-only peer"
            disabled={disabled}
            checked={checked}
            {...props}
          />
          <div
            className={`
              ${sizes[size].toggle}
              bg-gray-200
              peer-focus:outline-none
              peer-focus:ring-2
              peer-focus:ring-offset-2
              peer-focus:ring-${color}-500
              rounded-full
              peer
              peer-checked:${colors[color]}
              peer-disabled:opacity-50
              transition-colors
            `}
          >
            <div
              className={`
                ${sizes[size].thumb}
                absolute
                top-0.5
                left-0.5
                bg-white
                rounded-full
                shadow-sm
                transition-transform
                peer-checked:${sizes[size].translate}
                flex
                items-center
                justify-center
                ${icons ? 'text-gray-400 peer-checked:text-white' : ''}
              `}
            >
              {icons && (checked ? (onIcon || defaultIcons.on) : (offIcon || defaultIcons.off))}
            </div>
          </div>
        </div>

        {labelPosition === 'right' && label && (
          <span className={`${sizes[size].text} ml-3 ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
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

Toggle.displayName = 'Toggle';

export default Toggle;

/**
 * Toggle Component Usage Guide:
 * 
 * 1. Basic toggle:
 *    <Toggle label="Enable notifications" />
 * 
 * 2. Different sizes:
 *    <Toggle size="sm" />
 *    <Toggle size="md" />
 *    <Toggle size="lg" />
 * 
 * 3. Different colors:
 *    <Toggle color="primary" />
 *    <Toggle color="secondary" />
 *    <Toggle color="success" />
 *    <Toggle color="warning" />
 *    <Toggle color="error" />
 *    <Toggle color="info" />
 * 
 * 4. With icons:
 *    <Toggle icons />
 * 
 * 5. Custom icons:
 *    <Toggle
 *      icons
 *      onIcon={<CheckIcon />}
 *      offIcon={<CloseIcon />}
 *    />
 * 
 * 6. With helper text:
 *    <Toggle
 *      label="Notifications"
 *      helperText="Receive email notifications"
 *    />
 * 
 * 7. With error:
 *    <Toggle
 *      label="Required"
 *      error="This field is required"
 *    />
 * 
 * 8. Label position:
 *    <Toggle
 *      label="Left label"
 *      labelPosition="left"
 *    />
 * 
 * 9. Disabled state:
 *    <Toggle
 *      disabled
 *      label="Disabled"
 *    />
 * 
 * 10. Controlled:
 *     <Toggle
 *       checked={enabled}
 *       onChange={(e) => setEnabled(e.target.checked)}
 *     />
 * 
 * Notes:
 * - Multiple sizes
 * - Different colors
 * - Icon support
 * - Custom icons
 * - Helper text
 * - Error messages
 * - Label positioning
 * - Disabled state
 * - Accessible
 */

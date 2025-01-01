import React from 'react';
import { BaseProps, MergeElementProps } from '../../types/ui';

interface SwitchOwnProps extends BaseProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'pill';
  color?: string;
  label?: React.ReactNode;
  labelPosition?: 'left' | 'right';
  description?: string;
  error?: string;
  loading?: boolean;
  icon?: boolean;
}

type SwitchProps = MergeElementProps<'input', SwitchOwnProps>;

const Switch: React.FC<SwitchProps> = ({
  checked,
  defaultChecked,
  onChange,
  size = 'md',
  variant = 'default',
  color = 'primary',
  label,
  labelPosition = 'right',
  description,
  error,
  loading = false,
  icon = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.checked, event);
  };

  const sizes = {
    sm: {
      switch: 'w-8 h-4',
      thumb: 'w-3 h-3',
      translate: 'translate-x-4',
      text: 'text-sm',
    },
    md: {
      switch: 'w-11 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-5',
      text: 'text-base',
    },
    lg: {
      switch: 'w-14 h-8',
      thumb: 'w-7 h-7',
      translate: 'translate-x-6',
      text: 'text-lg',
    },
  };

  const variants = {
    default: 'rounded-full',
    pill: 'rounded-full',
  };

  const renderIcon = (isChecked: boolean) => {
    if (!icon) return null;

    return isChecked ? (
      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 12 12">
        <path
          d="M3.707 5.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L5 6.586 3.707 5.293z"
          fill="currentColor"
        />
      </svg>
    ) : (
      <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
        <path
          d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <label className={`inline-flex ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${className}`}>
      {/* Label (left) */}
      {label && labelPosition === 'left' && (
        <span className={`mr-3 ${sizes[size].text} ${disabled ? 'text-gray-400' : 'text-gray-900'}`}>
          {label}
        </span>
      )}

      {/* Switch */}
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          defaultChecked={defaultChecked}
          onChange={handleChange}
          disabled={disabled || loading}
          {...props}
        />
        <div
          className={`
            ${sizes[size].switch}
            ${variants[variant]}
            ${disabled ? 'bg-gray-200' : 'bg-gray-200'}
            ${checked ? `bg-${color}` : ''}
            transition-colors duration-200
            ${error ? 'ring-2 ring-red-500' : ''}
          `}
        >
          <div
            className={`
              ${sizes[size].thumb}
              ${variants[variant]}
              transform transition-transform duration-200
              ${checked ? sizes[size].translate : 'translate-x-0.5'}
              ${disabled ? 'bg-gray-400' : 'bg-white'}
              shadow-sm
              flex items-center justify-center
              ${loading ? 'animate-pulse' : ''}
            `}
          >
            {loading ? (
              <svg className="animate-spin h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              renderIcon(checked || false)
            )}
          </div>
        </div>

        {/* Label (right) */}
        {label && labelPosition === 'right' && (
          <span className={`ml-3 ${sizes[size].text} ${disabled ? 'text-gray-400' : 'text-gray-900'}`}>
            {label}
          </span>
        )}
      </div>

      {/* Description */}
      {description && (
        <p className="mt-1 text-sm text-gray-500">
          {description}
        </p>
      )}

      {/* Error */}
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </label>
  );
};

export default Switch;

/**
 * Switch Component Usage Guide:
 * 
 * 1. Basic switch:
 *    <Switch
 *      checked={checked}
 *      onChange={(checked) => setChecked(checked)}
 *    />
 * 
 * 2. With label:
 *    <Switch
 *      label="Notifications"
 *      checked={checked}
 *      onChange={(checked) => setChecked(checked)}
 *    />
 * 
 * 3. Different sizes:
 *    <Switch size="sm" />
 *    <Switch size="md" />
 *    <Switch size="lg" />
 * 
 * 4. With description:
 *    <Switch
 *      label="Notifications"
 *      description="Receive email notifications"
 *      checked={checked}
 *      onChange={(checked) => setChecked(checked)}
 *    />
 * 
 * 5. With error:
 *    <Switch
 *      label="Required field"
 *      error="This field is required"
 *      checked={checked}
 *      onChange={(checked) => setChecked(checked)}
 *    />
 * 
 * 6. Loading state:
 *    <Switch
 *      loading
 *      checked={checked}
 *      onChange={(checked) => setChecked(checked)}
 *    />
 * 
 * 7. With icons:
 *    <Switch
 *      icon
 *      checked={checked}
 *      onChange={(checked) => setChecked(checked)}
 *    />
 * 
 * 8. Custom color:
 *    <Switch
 *      color="blue"
 *      checked={checked}
 *      onChange={(checked) => setChecked(checked)}
 *    />
 * 
 * Notes:
 * - Controlled and uncontrolled modes
 * - Multiple sizes
 * - Loading state
 * - Error handling
 * - Icon support
 * - Custom colors
 * - Accessible
 */

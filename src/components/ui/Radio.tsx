import React, { forwardRef } from 'react';
import { BaseProps } from '../../types/ui';

interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>, BaseProps {
  /**
   * The label for the radio button
   */
  label?: React.ReactNode;

  /**
   * The size of the radio button
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * The color of the radio button
   */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

  /**
   * Helper text to display below the radio button
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

  /**
   * The value of the radio button
   */
  value?: string;
}

interface RadioGroupProps extends BaseProps {
  /**
   * The name for the radio group
   */
  name: string;

  /**
   * The selected value
   */
  value?: string;

  /**
   * Callback when selection changes
   */
  onChange?: (value: string) => void;

  /**
   * The layout direction of the radio buttons
   */
  direction?: 'horizontal' | 'vertical';

  /**
   * Whether the group is disabled
   */
  disabled?: boolean;

  /**
   * Error message to display
   */
  error?: string;
}

type RadioComponent = React.ForwardRefExoticComponent<RadioProps & React.RefAttributes<HTMLInputElement>> & {
  Group: React.FC<RadioGroupProps>;
};

const Radio = forwardRef<HTMLInputElement, RadioProps>(({
  label,
  size = 'md',
  color = 'primary',
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
      radio: 'w-3.5 h-3.5',
      text: 'text-sm',
      dot: 'w-1.5 h-1.5',
    },
    md: {
      radio: 'w-4 h-4',
      text: 'text-base',
      dot: 'w-2 h-2',
    },
    lg: {
      radio: 'w-5 h-5',
      text: 'text-lg',
      dot: 'w-2.5 h-2.5',
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

  const radio = (
    <div className="relative inline-flex">
      <input
        ref={ref}
        type="radio"
        className={`
          peer
          appearance-none
          rounded-full
          border
          transition-colors
          ${sizes[size].radio}
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
      <div
        className={`
          absolute
          top-1/2
          left-1/2
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-white
          pointer-events-none
          opacity-0
          peer-checked:opacity-100
          ${sizes[size].dot}
        `}
      />
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
        {radio}
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
}) as RadioComponent;

const RadioGroup: React.FC<RadioGroupProps> = ({
  children,
  name,
  value,
  onChange,
  direction = 'vertical',
  disabled = false,
  error,
  className = '',
  ...props
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.value);
  };

  return (
    <div
      className={`
        ${direction === 'horizontal' ? 'flex space-x-4' : 'space-y-2'}
        ${className}
      `}
      role="radiogroup"
      {...props}
    >
      {React.Children.map(children, child => {
        if (!React.isValidElement(child)) return null;

        return React.cloneElement(child, {
          ...child.props,
          name,
          checked: child.props.value === value,
          onChange: handleChange,
          disabled: disabled || child.props.disabled,
          error: error || child.props.error,
        });
      })}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

Radio.displayName = 'Radio';
Radio.Group = RadioGroup;

export default Radio;

/**
 * Radio Component Usage Guide:
 * 
 * 1. Basic radio button:
 *    <Radio label="Option 1" />
 * 
 * 2. Radio group:
 *    <Radio.Group
 *      name="options"
 *      value={value}
 *      onChange={setValue}
 *    >
 *      <Radio value="1" label="Option 1" />
 *      <Radio value="2" label="Option 2" />
 *      <Radio value="3" label="Option 3" />
 *    </Radio.Group>
 * 
 * 3. Different sizes:
 *    <Radio size="sm" />
 *    <Radio size="md" />
 *    <Radio size="lg" />
 * 
 * 4. Different colors:
 *    <Radio color="primary" />
 *    <Radio color="secondary" />
 *    <Radio color="success" />
 *    <Radio color="warning" />
 *    <Radio color="error" />
 *    <Radio color="info" />
 * 
 * 5. With helper text:
 *    <Radio
 *      label="Option"
 *      helperText="Additional information"
 *    />
 * 
 * 6. With error:
 *    <Radio
 *      label="Required"
 *      error="This field is required"
 *    />
 * 
 * 7. Label position:
 *    <Radio
 *      label="Left label"
 *      labelPosition="left"
 *    />
 * 
 * 8. Horizontal layout:
 *    <Radio.Group
 *      direction="horizontal"
 *      name="options"
 *    >
 *      <Radio value="1" label="Option 1" />
 *      <Radio value="2" label="Option 2" />
 *    </Radio.Group>
 * 
 * 9. Disabled state:
 *    <Radio
 *      disabled
 *      label="Disabled"
 *    />
 * 
 * 10. Without ripple:
 *     <Radio
 *       ripple={false}
 *       label="No ripple"
 *     />
 * 
 * Notes:
 * - Multiple sizes
 * - Different colors
 * - Group support
 * - Helper text
 * - Error messages
 * - Label positioning
 * - Layout direction
 * - Ripple effect
 * - Disabled state
 * - Accessible
 */

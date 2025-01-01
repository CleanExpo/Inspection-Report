import React from 'react';
import { BaseProps } from '../../types/ui';

type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'link' | 'text';
type ButtonColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'>, BaseProps {
  /**
   * The variant of the button
   */
  variant?: ButtonVariant;

  /**
   * The color of the button
   */
  color?: ButtonColor;

  /**
   * The size of the button
   */
  size?: ButtonSize;

  /**
   * Whether the button is full width
   */
  fullWidth?: boolean;

  /**
   * Whether to show a loading spinner
   */
  loading?: boolean;

  /**
   * The icon to display before the content
   */
  leftIcon?: React.ReactNode;

  /**
   * The icon to display after the content
   */
  rightIcon?: React.ReactNode;

  /**
   * Whether the button is rounded
   */
  rounded?: boolean;

  /**
   * Whether to show a ripple effect on click
   */
  ripple?: boolean;

  /**
   * Whether the button is elevated (has shadow)
   */
  elevated?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'solid',
  color = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  rounded = false,
  ripple = true,
  elevated = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const variants: Record<ButtonVariant, Record<ButtonColor, string>> = {
    solid: {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
      success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
      warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
      error: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      info: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    },
    outline: {
      primary: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
      secondary: 'border-2 border-gray-600 text-gray-600 hover:bg-gray-50 focus:ring-gray-500',
      success: 'border-2 border-green-600 text-green-600 hover:bg-green-50 focus:ring-green-500',
      warning: 'border-2 border-yellow-600 text-yellow-600 hover:bg-yellow-50 focus:ring-yellow-500',
      error: 'border-2 border-red-600 text-red-600 hover:bg-red-50 focus:ring-red-500',
      info: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
    },
    ghost: {
      primary: 'text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
      secondary: 'text-gray-600 hover:bg-gray-50 focus:ring-gray-500',
      success: 'text-green-600 hover:bg-green-50 focus:ring-green-500',
      warning: 'text-yellow-600 hover:bg-yellow-50 focus:ring-yellow-500',
      error: 'text-red-600 hover:bg-red-50 focus:ring-red-500',
      info: 'text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
    },
    link: {
      primary: 'text-primary-600 hover:underline focus:ring-primary-500',
      secondary: 'text-gray-600 hover:underline focus:ring-gray-500',
      success: 'text-green-600 hover:underline focus:ring-green-500',
      warning: 'text-yellow-600 hover:underline focus:ring-yellow-500',
      error: 'text-red-600 hover:underline focus:ring-red-500',
      info: 'text-blue-600 hover:underline focus:ring-blue-500',
    },
    text: {
      primary: 'text-primary-600 hover:text-primary-700 focus:ring-primary-500',
      secondary: 'text-gray-600 hover:text-gray-700 focus:ring-gray-500',
      success: 'text-green-600 hover:text-green-700 focus:ring-green-500',
      warning: 'text-yellow-600 hover:text-yellow-700 focus:ring-yellow-500',
      error: 'text-red-600 hover:text-red-700 focus:ring-red-500',
      info: 'text-blue-600 hover:text-blue-700 focus:ring-blue-500',
    },
  };

  const sizes: Record<ButtonSize, {
    padding: string;
    text: string;
    height: string;
    icon: string;
  }> = {
    xs: {
      padding: 'px-2.5',
      text: 'text-xs',
      height: 'h-6',
      icon: 'w-3 h-3',
    },
    sm: {
      padding: 'px-3',
      text: 'text-sm',
      height: 'h-8',
      icon: 'w-4 h-4',
    },
    md: {
      padding: 'px-4',
      text: 'text-base',
      height: 'h-10',
      icon: 'w-5 h-5',
    },
    lg: {
      padding: 'px-5',
      text: 'text-lg',
      height: 'h-12',
      icon: 'w-6 h-6',
    },
    xl: {
      padding: 'px-6',
      text: 'text-xl',
      height: 'h-14',
      icon: 'w-7 h-7',
    },
  };

  return (
    <button
      className={`
        inline-flex items-center justify-center
        ${sizes[size].padding} ${sizes[size].height}
        ${sizes[size].text}
        ${variants[variant][color]}
        ${fullWidth ? 'w-full' : ''}
        ${rounded ? 'rounded-full' : 'rounded-md'}
        ${elevated && variant !== 'link' && variant !== 'text' ? 'shadow-md hover:shadow-lg' : ''}
        ${ripple ? 'transform active:scale-95' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {/* Loading spinner */}
      {loading && (
        <svg
          className={`animate-spin -ml-1 mr-2 ${sizes[size].icon} text-current`}
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {/* Left icon */}
      {!loading && leftIcon && (
        <span className={`mr-2 ${sizes[size].icon}`}>
          {leftIcon}
        </span>
      )}

      {/* Content */}
      {children}

      {/* Right icon */}
      {!loading && rightIcon && (
        <span className={`ml-2 ${sizes[size].icon}`}>
          {rightIcon}
        </span>
      )}
    </button>
  );
};

export default Button;

/**
 * Button Component Usage Guide:
 * 
 * 1. Basic button:
 *    <Button>Click me</Button>
 * 
 * 2. Different variants:
 *    <Button variant="solid">Solid</Button>
 *    <Button variant="outline">Outline</Button>
 *    <Button variant="ghost">Ghost</Button>
 *    <Button variant="link">Link</Button>
 *    <Button variant="text">Text</Button>
 * 
 * 3. Different colors:
 *    <Button color="primary">Primary</Button>
 *    <Button color="secondary">Secondary</Button>
 *    <Button color="success">Success</Button>
 *    <Button color="warning">Warning</Button>
 *    <Button color="error">Error</Button>
 *    <Button color="info">Info</Button>
 * 
 * 4. Different sizes:
 *    <Button size="xs">Extra Small</Button>
 *    <Button size="sm">Small</Button>
 *    <Button size="md">Medium</Button>
 *    <Button size="lg">Large</Button>
 *    <Button size="xl">Extra Large</Button>
 * 
 * 5. With icons:
 *    <Button leftIcon={<Icon />}>Left Icon</Button>
 *    <Button rightIcon={<Icon />}>Right Icon</Button>
 * 
 * 6. Loading state:
 *    <Button loading>Loading</Button>
 * 
 * 7. Full width:
 *    <Button fullWidth>Full Width</Button>
 * 
 * 8. Rounded:
 *    <Button rounded>Rounded</Button>
 * 
 * 9. Elevated:
 *    <Button elevated>Elevated</Button>
 * 
 * 10. Disabled:
 *     <Button disabled>Disabled</Button>
 * 
 * Notes:
 * - Multiple variants
 * - Different colors
 * - Multiple sizes
 * - Icon support
 * - Loading state
 * - Full width option
 * - Rounded option
 * - Elevation support
 * - Ripple effect
 * - Disabled state
 * - Accessible
 */

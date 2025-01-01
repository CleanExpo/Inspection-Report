import React from 'react';
import { BaseProps } from '../../types/ui';

interface SpinnerProps extends BaseProps {
  /**
   * The size of the spinner
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  /**
   * The color of the spinner
   */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'light' | 'dark';

  /**
   * The variant of the spinner
   */
  variant?: 'border' | 'dots' | 'grow' | 'bars';

  /**
   * The speed of the animation in milliseconds
   */
  speed?: number;

  /**
   * The label for accessibility
   */
  label?: string;

  /**
   * Whether to show the label
   */
  showLabel?: boolean;

  /**
   * The thickness of the spinner (for border variant)
   */
  thickness?: number;
}

const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  variant = 'border',
  speed = 750,
  label = 'Loading...',
  showLabel = false,
  thickness = 2,
  className = '',
  ...props
}) => {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colors = {
    primary: 'text-primary',
    secondary: 'text-gray-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
    info: 'text-blue-600',
    light: 'text-gray-200',
    dark: 'text-gray-900',
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'border':
        return (
          <div
            className={`
              inline-block rounded-full
              border-current border-solid
              animate-spin
              border-t-transparent
              ${sizes[size]}
            `}
            style={{
              borderWidth: thickness,
              animationDuration: `${speed}ms`,
            }}
            role="status"
          />
        );

      case 'dots':
        return (
          <div className="inline-flex space-x-1" role="status">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`rounded-full ${sizes[size]} animate-pulse`}
                style={{
                  animationDelay: `${i * (speed / 3)}ms`,
                  backgroundColor: 'currentColor',
                }}
              />
            ))}
          </div>
        );

      case 'grow':
        return (
          <div
            className={`
              inline-block rounded-full
              animate-ping
              ${sizes[size]}
            `}
            style={{
              backgroundColor: 'currentColor',
              animationDuration: `${speed}ms`,
            }}
            role="status"
          />
        );

      case 'bars':
        return (
          <div className="inline-flex space-x-0.5 items-end" role="status">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-1 animate-pulse ${sizes[size]}`}
                style={{
                  height: `${(i + 1) * 25}%`,
                  animationDelay: `${i * (speed / 4)}ms`,
                  backgroundColor: 'currentColor',
                }}
              />
            ))}
          </div>
        );
    }
  };

  return (
    <div
      className={`
        inline-flex flex-col items-center justify-center
        ${colors[color]}
        ${className}
      `}
      {...props}
    >
      {renderSpinner()}
      {showLabel && (
        <span className="mt-2 text-sm">{label}</span>
      )}
      {!showLabel && (
        <span className="sr-only">{label}</span>
      )}
    </div>
  );
};

export default Spinner;

/**
 * Add these animations to your Tailwind config:
 * 
 * theme: {
 *   extend: {
 *     animation: {
 *       'spin': 'spin 1s linear infinite',
 *       'pulse': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
 *       'ping': 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
 *     },
 *     keyframes: {
 *       spin: {
 *         to: { transform: 'rotate(360deg)' },
 *       },
 *       pulse: {
 *         '0%, 100%': { opacity: '1' },
 *         '50%': { opacity: '.5' },
 *       },
 *       ping: {
 *         '75%, 100%': {
 *           transform: 'scale(2)',
 *           opacity: '0',
 *         },
 *       },
 *     },
 *   },
 * },
 */

/**
 * Spinner Component Usage Guide:
 * 
 * 1. Basic spinner:
 *    <Spinner />
 * 
 * 2. Different sizes:
 *    <Spinner size="xs" />
 *    <Spinner size="sm" />
 *    <Spinner size="md" />
 *    <Spinner size="lg" />
 *    <Spinner size="xl" />
 * 
 * 3. Different colors:
 *    <Spinner color="primary" />
 *    <Spinner color="secondary" />
 *    <Spinner color="success" />
 *    <Spinner color="warning" />
 *    <Spinner color="error" />
 *    <Spinner color="info" />
 * 
 * 4. Different variants:
 *    <Spinner variant="border" />
 *    <Spinner variant="dots" />
 *    <Spinner variant="grow" />
 *    <Spinner variant="bars" />
 * 
 * 5. Custom speed:
 *    <Spinner speed={1000} />
 * 
 * 6. With label:
 *    <Spinner
 *      showLabel
 *      label="Loading data..."
 *    />
 * 
 * 7. Custom thickness:
 *    <Spinner
 *      variant="border"
 *      thickness={4}
 *    />
 * 
 * 8. Combined props:
 *    <Spinner
 *      size="lg"
 *      color="primary"
 *      variant="dots"
 *      speed={500}
 *      showLabel
 *    />
 * 
 * Notes:
 * - Multiple variants
 * - Different sizes
 * - Custom colors
 * - Animation speed control
 * - Label support
 * - Thickness customization
 * - Accessible
 */

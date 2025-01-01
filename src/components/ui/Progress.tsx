import React from 'react';
import { BaseProps } from '../../types/ui';

interface ProgressProps extends BaseProps {
  /**
   * The value of the progress indicator (0-100)
   */
  value: number;

  /**
   * The variant of the progress indicator
   */
  variant?: 'line' | 'circle';

  /**
   * The color of the progress indicator
   */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

  /**
   * The size of the progress indicator
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Whether to show the progress value
   */
  showValue?: boolean;

  /**
   * The format of the progress value
   */
  valueFormat?: (value: number) => string;

  /**
   * Whether to show an indeterminate loading state
   */
  indeterminate?: boolean;

  /**
   * Whether to show stripes
   */
  striped?: boolean;

  /**
   * Whether the stripes should be animated
   */
  animated?: boolean;

  /**
   * The thickness of the progress bar or circle (in pixels)
   */
  thickness?: number;

  /**
   * The label to display above the progress bar
   */
  label?: React.ReactNode;
}

const Progress: React.FC<ProgressProps> = ({
  value,
  variant = 'line',
  color = 'primary',
  size = 'md',
  showValue = false,
  valueFormat = (value) => `${value}%`,
  indeterminate = false,
  striped = false,
  animated = false,
  thickness,
  label,
  className = '',
  ...props
}) => {
  const normalizedValue = Math.min(100, Math.max(0, value));

  const colors = {
    primary: {
      base: 'bg-primary-100',
      fill: 'bg-primary-600',
      text: 'text-primary-700',
    },
    secondary: {
      base: 'bg-gray-100',
      fill: 'bg-gray-600',
      text: 'text-gray-700',
    },
    success: {
      base: 'bg-green-100',
      fill: 'bg-green-600',
      text: 'text-green-700',
    },
    warning: {
      base: 'bg-yellow-100',
      fill: 'bg-yellow-600',
      text: 'text-yellow-700',
    },
    error: {
      base: 'bg-red-100',
      fill: 'bg-red-600',
      text: 'text-red-700',
    },
    info: {
      base: 'bg-blue-100',
      fill: 'bg-blue-600',
      text: 'text-blue-700',
    },
  };

  const sizes = {
    sm: {
      height: 'h-1',
      text: 'text-xs',
      circle: { size: 32, thickness: thickness ?? 3 },
    },
    md: {
      height: 'h-2',
      text: 'text-sm',
      circle: { size: 48, thickness: thickness ?? 4 },
    },
    lg: {
      height: 'h-3',
      text: 'text-base',
      circle: { size: 64, thickness: thickness ?? 5 },
    },
  };

  if (variant === 'circle') {
    const { size: circleSize, thickness: circleThickness } = sizes[size].circle;
    const radius = (circleSize - circleThickness) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;

    return (
      <div className={`inline-flex flex-col items-center ${className}`} {...props}>
        {label && (
          <div className={`mb-2 font-medium ${sizes[size].text}`}>
            {label}
          </div>
        )}
        <div className="relative">
          <svg
            className={`transform -rotate-90 ${indeterminate ? 'animate-spin' : ''}`}
            width={circleSize}
            height={circleSize}
          >
            {/* Background circle */}
            <circle
              className={colors[color].base}
              cx={circleSize / 2}
              cy={circleSize / 2}
              r={radius}
              strokeWidth={circleThickness}
              fill="none"
            />
            {/* Progress circle */}
            <circle
              className={`${colors[color].fill} transition-all duration-300`}
              cx={circleSize / 2}
              cy={circleSize / 2}
              r={radius}
              strokeWidth={circleThickness}
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={indeterminate ? 0 : strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          {showValue && (
            <div
              className={`
                absolute inset-0
                flex items-center justify-center
                ${sizes[size].text}
                font-medium
                ${colors[color].text}
              `}
            >
              {valueFormat(normalizedValue)}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={className} {...props}>
      {(label || showValue) && (
        <div className="flex justify-between mb-1">
          {label && (
            <div className={`font-medium ${sizes[size].text}`}>
              {label}
            </div>
          )}
          {showValue && (
            <div className={`${sizes[size].text} ${colors[color].text}`}>
              {valueFormat(normalizedValue)}
            </div>
          )}
        </div>
      )}
      <div
        className={`
          overflow-hidden
          rounded-full
          ${colors[color].base}
          ${sizes[size].height}
        `}
      >
        <div
          className={`
            ${colors[color].fill}
            h-full
            rounded-full
            transition-all
            duration-300
            ${striped ? 'bg-stripes' : ''}
            ${animated && striped ? 'animate-progress-stripes' : ''}
            ${indeterminate ? 'animate-progress-indeterminate w-2/3' : ''}
          `}
          style={{
            width: indeterminate ? undefined : `${normalizedValue}%`,
          }}
        />
      </div>
    </div>
  );
};

export default Progress;

/**
 * Add these styles to your global CSS or Tailwind config:
 * 
 * @keyframes progress-stripes {
 *   from { background-position: 1rem 0; }
 *   to { background-position: 0 0; }
 * }
 * 
 * @keyframes progress-indeterminate {
 *   from {
 *     left: -50%;
 *   }
 *   to {
 *     left: 100%;
 *   }
 * }
 * 
 * .animate-progress-stripes {
 *   animation: progress-stripes 1s linear infinite;
 * }
 * 
 * .animate-progress-indeterminate {
 *   position: relative;
 *   animation: progress-indeterminate 1.5s ease-in-out infinite;
 * }
 * 
 * .bg-stripes {
 *   background-image: linear-gradient(
 *     45deg,
 *     rgba(255, 255, 255, 0.15) 25%,
 *     transparent 25%,
 *     transparent 50%,
 *     rgba(255, 255, 255, 0.15) 50%,
 *     rgba(255, 255, 255, 0.15) 75%,
 *     transparent 75%,
 *     transparent
 *   );
 *   background-size: 1rem 1rem;
 * }
 */

/**
 * Progress Component Usage Guide:
 * 
 * 1. Basic progress bar:
 *    <Progress value={60} />
 * 
 * 2. Different variants:
 *    <Progress variant="line" value={60} />
 *    <Progress variant="circle" value={60} />
 * 
 * 3. Different colors:
 *    <Progress color="primary" value={60} />
 *    <Progress color="secondary" value={60} />
 *    <Progress color="success" value={60} />
 *    <Progress color="warning" value={60} />
 *    <Progress color="error" value={60} />
 *    <Progress color="info" value={60} />
 * 
 * 4. Different sizes:
 *    <Progress size="sm" value={60} />
 *    <Progress size="md" value={60} />
 *    <Progress size="lg" value={60} />
 * 
 * 5. Show value:
 *    <Progress
 *      showValue
 *      value={60}
 *    />
 * 
 * 6. Custom value format:
 *    <Progress
 *      showValue
 *      value={60}
 *      valueFormat={(value) => `${value} of 100`}
 *    />
 * 
 * 7. Indeterminate:
 *    <Progress indeterminate />
 * 
 * 8. Striped:
 *    <Progress
 *      striped
 *      value={60}
 *    />
 * 
 * 9. Animated stripes:
 *    <Progress
 *      striped
 *      animated
 *      value={60}
 *    />
 * 
 * 10. Custom thickness:
 *     <Progress
 *       variant="circle"
 *       thickness={8}
 *       value={60}
 *     />
 * 
 * 11. With label:
 *     <Progress
 *       label="Loading..."
 *       value={60}
 *     />
 * 
 * Notes:
 * - Line and circle variants
 * - Multiple colors
 * - Different sizes
 * - Value display
 * - Custom formatting
 * - Indeterminate state
 * - Striped style
 * - Animations
 * - Custom thickness
 * - Labels
 * - Accessible
 */

import React from 'react';
import { BaseProps } from '../../types/ui';

interface BadgeProps extends BaseProps {
  /**
   * The variant of the badge
   */
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

  /**
   * The size of the badge
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Whether the badge is outlined
   */
  outlined?: boolean;

  /**
   * Whether the badge is rounded
   */
  rounded?: boolean;

  /**
   * Whether the badge is pill-shaped
   */
  pill?: boolean;

  /**
   * The icon to display before the content
   */
  icon?: React.ReactNode;

  /**
   * Whether to show a dot indicator
   */
  dot?: boolean;

  /**
   * Whether to show a remove button
   */
  removable?: boolean;

  /**
   * Callback when the remove button is clicked
   */
  onRemove?: () => void;

  /**
   * Whether the badge is disabled
   */
  disabled?: boolean;

  /**
   * Whether to animate the badge when it appears
   */
  animated?: boolean;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  outlined = false,
  rounded = true,
  pill = false,
  icon,
  dot = false,
  removable = false,
  onRemove,
  disabled = false,
  animated = false,
  className = '',
  ...props
}) => {
  const variants = {
    default: {
      solid: 'bg-gray-100 text-gray-800',
      outlined: 'border border-gray-200 text-gray-800',
    },
    primary: {
      solid: 'bg-primary-100 text-primary-800',
      outlined: 'border border-primary-200 text-primary-800',
    },
    secondary: {
      solid: 'bg-gray-100 text-gray-800',
      outlined: 'border border-gray-200 text-gray-800',
    },
    success: {
      solid: 'bg-green-100 text-green-800',
      outlined: 'border border-green-200 text-green-800',
    },
    warning: {
      solid: 'bg-yellow-100 text-yellow-800',
      outlined: 'border border-yellow-200 text-yellow-800',
    },
    error: {
      solid: 'bg-red-100 text-red-800',
      outlined: 'border border-red-200 text-red-800',
    },
    info: {
      solid: 'bg-blue-100 text-blue-800',
      outlined: 'border border-blue-200 text-blue-800',
    },
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      onRemove?.();
    }
  };

  return (
    <span
      className={`
        inline-flex items-center
        font-medium
        ${outlined ? variants[variant].outlined : variants[variant].solid}
        ${sizes[size]}
        ${rounded ? 'rounded' : ''}
        ${pill ? 'rounded-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${animated ? 'animate-fade-in' : ''}
        ${className}
      `}
      {...props}
    >
      {dot && (
        <span
          className={`
            ${dotSizes[size]}
            rounded-full
            ${variant === 'default' ? 'bg-gray-500' : `bg-${variant}-500`}
            mr-1.5
          `}
        />
      )}
      {icon && (
        <span className={`mr-1.5 ${size === 'sm' ? 'text-xs' : ''}`}>
          {icon}
        </span>
      )}
      {children}
      {removable && (
        <button
          onClick={handleRemove}
          disabled={disabled}
          className={`
            ml-1.5
            text-current
            opacity-60
            hover:opacity-100
            focus:outline-none
            ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
          `}
          aria-label="Remove"
        >
          ×
        </button>
      )}
    </span>
  );
};

export default Badge;

/**
 * Add this to your global CSS or Tailwind config:
 * 
 * @keyframes fade-in {
 *   from {
 *     opacity: 0;
 *     transform: scale(0.95);
 *   }
 *   to {
 *     opacity: 1;
 *     transform: scale(1);
 *   }
 * }
 * 
 * .animate-fade-in {
 *   animation: fade-in 0.2s ease-out;
 * }
 */

/**
 * Badge Component Usage Guide:
 * 
 * 1. Basic badge:
 *    <Badge>Default</Badge>
 * 
 * 2. Different variants:
 *    <Badge variant="primary">Primary</Badge>
 *    <Badge variant="secondary">Secondary</Badge>
 *    <Badge variant="success">Success</Badge>
 *    <Badge variant="warning">Warning</Badge>
 *    <Badge variant="error">Error</Badge>
 *    <Badge variant="info">Info</Badge>
 * 
 * 3. Different sizes:
 *    <Badge size="sm">Small</Badge>
 *    <Badge size="md">Medium</Badge>
 *    <Badge size="lg">Large</Badge>
 * 
 * 4. Outlined style:
 *    <Badge outlined>Outlined</Badge>
 * 
 * 5. Pill shape:
 *    <Badge pill>Pill</Badge>
 * 
 * 6. With icon:
 *    <Badge icon={<Icon />}>With Icon</Badge>
 * 
 * 7. With dot:
 *    <Badge dot>With Dot</Badge>
 * 
 * 8. Removable:
 *    <Badge
 *      removable
 *      onRemove={() => console.log('removed')}
 *    >
 *      Removable
 *    </Badge>
 * 
 * 9. Disabled:
 *    <Badge disabled>Disabled</Badge>
 * 
 * 10. Animated:
 *     <Badge animated>Animated</Badge>
 * 
 * Notes:
 * - Multiple variants
 * - Different sizes
 * - Outlined style
 * - Pill shape
 * - Icon support
 * - Dot indicator
 * - Removable
 * - Disabled state
 * - Animation
 * - Accessible
 */

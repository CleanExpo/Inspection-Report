import React from 'react';
import { BaseProps } from '../../types/ui';

interface TagProps extends BaseProps {
  /**
   * The color of the tag
   */
  color?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | string;

  /**
   * The size of the tag
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Whether the tag is closable
   */
  closable?: boolean;

  /**
   * Callback when the close button is clicked
   */
  onClose?: () => void;

  /**
   * The icon to display before the content
   */
  icon?: React.ReactNode;

  /**
   * Whether the tag is bordered
   */
  bordered?: boolean;

  /**
   * Whether the tag is rounded
   */
  rounded?: boolean;

  /**
   * Whether the tag is clickable
   */
  clickable?: boolean;

  /**
   * Whether the tag is disabled
   */
  disabled?: boolean;
}

const Tag: React.FC<TagProps> = ({
  children,
  color = 'default',
  size = 'md',
  closable = false,
  onClose,
  icon,
  bordered = false,
  rounded = true,
  clickable = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const baseColors = {
    default: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-200',
      hover: 'hover:bg-gray-200',
    },
    primary: {
      bg: 'bg-primary-100',
      text: 'text-primary-800',
      border: 'border-primary-200',
      hover: 'hover:bg-primary-200',
    },
    success: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200',
      hover: 'hover:bg-green-200',
    },
    warning: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200',
      hover: 'hover:bg-yellow-200',
    },
    error: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200',
      hover: 'hover:bg-red-200',
    },
    info: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-200',
      hover: 'hover:bg-blue-200',
    },
  };

  const sizes = {
    sm: {
      base: 'text-xs px-2 py-0.5',
      icon: 'w-3 h-3',
      close: 'w-3 h-3',
    },
    md: {
      base: 'text-sm px-2.5 py-0.5',
      icon: 'w-4 h-4',
      close: 'w-4 h-4',
    },
    lg: {
      base: 'text-base px-3 py-1',
      icon: 'w-5 h-5',
      close: 'w-5 h-5',
    },
  };

  const getColorClasses = () => {
    if (color in baseColors) {
      return baseColors[color as keyof typeof baseColors];
    }
    // Custom color support
    return {
      bg: `bg-${color}-100`,
      text: `text-${color}-800`,
      border: `border-${color}-200`,
      hover: `hover:bg-${color}-200`,
    };
  };

  const colorClasses = getColorClasses();

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      onClose?.();
    }
  };

  return (
    <span
      className={`
        inline-flex items-center
        font-medium
        transition-colors
        ${sizes[size].base}
        ${colorClasses.bg}
        ${colorClasses.text}
        ${bordered ? `border ${colorClasses.border}` : ''}
        ${rounded ? 'rounded-full' : 'rounded'}
        ${clickable && !disabled ? `cursor-pointer ${colorClasses.hover}` : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      {...props}
    >
      {/* Icon */}
      {icon && (
        <span className={`mr-1.5 ${sizes[size].icon}`}>
          {icon}
        </span>
      )}

      {/* Content */}
      {children}

      {/* Close button */}
      {closable && !disabled && (
        <button
          onClick={handleClose}
          className={`
            ml-1.5
            rounded-full
            p-0.5
            hover:bg-black/10
            focus:outline-none
            transition-colors
          `}
          aria-label="Remove tag"
        >
          <svg
            className={sizes[size].close}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </span>
  );
};

export default Tag;

/**
 * Tag Component Usage Guide:
 * 
 * 1. Basic tag:
 *    <Tag>Default</Tag>
 * 
 * 2. Different colors:
 *    <Tag color="primary">Primary</Tag>
 *    <Tag color="success">Success</Tag>
 *    <Tag color="warning">Warning</Tag>
 *    <Tag color="error">Error</Tag>
 *    <Tag color="info">Info</Tag>
 * 
 * 3. Custom color:
 *    <Tag color="indigo">Custom</Tag>
 * 
 * 4. Different sizes:
 *    <Tag size="sm">Small</Tag>
 *    <Tag size="md">Medium</Tag>
 *    <Tag size="lg">Large</Tag>
 * 
 * 5. With icon:
 *    <Tag icon={<Icon />}>With Icon</Tag>
 * 
 * 6. Closable:
 *    <Tag
 *      closable
 *      onClose={() => console.log('closed')}
 *    >
 *      Closable
 *    </Tag>
 * 
 * 7. Bordered:
 *    <Tag bordered>Bordered</Tag>
 * 
 * 8. Square corners:
 *    <Tag rounded={false}>Square</Tag>
 * 
 * 9. Clickable:
 *    <Tag
 *      clickable
 *      onClick={() => console.log('clicked')}
 *    >
 *      Clickable
 *    </Tag>
 * 
 * 10. Disabled:
 *     <Tag disabled>Disabled</Tag>
 * 
 * 11. Combined props:
 *     <Tag
 *       color="primary"
 *       size="lg"
 *       icon={<Icon />}
 *       closable
 *       bordered
 *     >
 *       Combined
 *     </Tag>
 * 
 * Notes:
 * - Multiple colors
 * - Custom color support
 * - Different sizes
 * - Icon support
 * - Closable
 * - Bordered style
 * - Square corners option
 * - Clickable
 * - Disabled state
 * - Accessible
 */

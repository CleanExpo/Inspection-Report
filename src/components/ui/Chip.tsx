import React from 'react';
import { BaseProps } from '../../types/ui';

interface ChipProps extends BaseProps {
  /**
   * The variant of the chip
   */
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

  /**
   * The size of the chip
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Whether the chip is outlined
   */
  outlined?: boolean;

  /**
   * The icon to display before the content
   */
  icon?: React.ReactNode;

  /**
   * The avatar to display before the content
   */
  avatar?: React.ReactNode;

  /**
   * Whether the chip is clickable
   */
  clickable?: boolean;

  /**
   * Whether the chip is deletable
   */
  deletable?: boolean;

  /**
   * Callback when the delete button is clicked
   */
  onDelete?: () => void;

  /**
   * Callback when the chip is clicked
   */
  onClick?: () => void;

  /**
   * Whether the chip is disabled
   */
  disabled?: boolean;

  /**
   * Whether to show a loading state
   */
  loading?: boolean;

  /**
   * Whether to show a selected state
   */
  selected?: boolean;
}

const Chip: React.FC<ChipProps> = ({
  children,
  variant = 'default',
  size = 'md',
  outlined = false,
  icon,
  avatar,
  clickable = false,
  deletable = false,
  onDelete,
  onClick,
  disabled = false,
  loading = false,
  selected = false,
  className = '',
  ...props
}) => {
  const variants = {
    default: {
      solid: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
      outlined: 'border border-gray-300 text-gray-800 hover:bg-gray-50',
    },
    primary: {
      solid: 'bg-primary-100 text-primary-800 hover:bg-primary-200',
      outlined: 'border border-primary-300 text-primary-800 hover:bg-primary-50',
    },
    secondary: {
      solid: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
      outlined: 'border border-gray-300 text-gray-800 hover:bg-gray-50',
    },
    success: {
      solid: 'bg-green-100 text-green-800 hover:bg-green-200',
      outlined: 'border border-green-300 text-green-800 hover:bg-green-50',
    },
    warning: {
      solid: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
      outlined: 'border border-yellow-300 text-yellow-800 hover:bg-yellow-50',
    },
    error: {
      solid: 'bg-red-100 text-red-800 hover:bg-red-200',
      outlined: 'border border-red-300 text-red-800 hover:bg-red-50',
    },
    info: {
      solid: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      outlined: 'border border-blue-300 text-blue-800 hover:bg-blue-50',
    },
  };

  const sizes = {
    sm: {
      chip: 'h-6 text-xs',
      padding: avatar ? 'pl-1 pr-2' : 'px-2',
      icon: 'w-3 h-3',
      avatar: 'w-4 h-4',
    },
    md: {
      chip: 'h-8 text-sm',
      padding: avatar ? 'pl-1 pr-3' : 'px-3',
      icon: 'w-4 h-4',
      avatar: 'w-6 h-6',
    },
    lg: {
      chip: 'h-10 text-base',
      padding: avatar ? 'pl-2 pr-4' : 'px-4',
      icon: 'w-5 h-5',
      avatar: 'w-8 h-8',
    },
  };

  const handleClick = () => {
    if (!disabled && clickable) {
      onClick?.();
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      onDelete?.();
    }
  };

  return (
    <div
      className={`
        inline-flex items-center
        rounded-full
        font-medium
        transition-colors
        ${sizes[size].chip}
        ${sizes[size].padding}
        ${outlined ? variants[variant].outlined : variants[variant].solid}
        ${clickable && !disabled ? 'cursor-pointer' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${selected ? 'ring-2 ring-primary ring-offset-2' : ''}
        ${className}
      `}
      onClick={handleClick}
      {...props}
    >
      {/* Loading spinner */}
      {loading && (
        <div className="mr-2">
          <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${sizes[size].icon}`} />
        </div>
      )}

      {/* Avatar */}
      {avatar && !loading && (
        <div className={`-ml-1 mr-2 rounded-full overflow-hidden ${sizes[size].avatar}`}>
          {avatar}
        </div>
      )}

      {/* Icon */}
      {icon && !loading && !avatar && (
        <div className={`mr-2 ${sizes[size].icon}`}>
          {icon}
        </div>
      )}

      {/* Content */}
      <span className="truncate">
        {children}
      </span>

      {/* Delete button */}
      {deletable && !disabled && (
        <button
          onClick={handleDelete}
          className={`
            ml-1.5 -mr-1
            rounded-full
            p-0.5
            hover:bg-black/10
            focus:outline-none
          `}
          aria-label="Remove"
        >
          <svg
            className={sizes[size].icon}
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
    </div>
  );
};

export default Chip;

/**
 * Chip Component Usage Guide:
 * 
 * 1. Basic chip:
 *    <Chip>Default</Chip>
 * 
 * 2. Different variants:
 *    <Chip variant="primary">Primary</Chip>
 *    <Chip variant="secondary">Secondary</Chip>
 *    <Chip variant="success">Success</Chip>
 *    <Chip variant="warning">Warning</Chip>
 *    <Chip variant="error">Error</Chip>
 *    <Chip variant="info">Info</Chip>
 * 
 * 3. Different sizes:
 *    <Chip size="sm">Small</Chip>
 *    <Chip size="md">Medium</Chip>
 *    <Chip size="lg">Large</Chip>
 * 
 * 4. Outlined style:
 *    <Chip outlined>Outlined</Chip>
 * 
 * 5. With icon:
 *    <Chip icon={<Icon />}>With Icon</Chip>
 * 
 * 6. With avatar:
 *    <Chip avatar={<Avatar />}>With Avatar</Chip>
 * 
 * 7. Clickable:
 *    <Chip
 *      clickable
 *      onClick={() => console.log('clicked')}
 *    >
 *      Clickable
 *    </Chip>
 * 
 * 8. Deletable:
 *    <Chip
 *      deletable
 *      onDelete={() => console.log('deleted')}
 *    >
 *      Deletable
 *    </Chip>
 * 
 * 9. Loading state:
 *    <Chip loading>Loading</Chip>
 * 
 * 10. Selected state:
 *     <Chip selected>Selected</Chip>
 * 
 * 11. Disabled state:
 *     <Chip disabled>Disabled</Chip>
 * 
 * Notes:
 * - Multiple variants
 * - Different sizes
 * - Outlined style
 * - Icon support
 * - Avatar support
 * - Clickable
 * - Deletable
 * - Loading state
 * - Selected state
 * - Disabled state
 * - Accessible
 */

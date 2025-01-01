import React from 'react';
import { BaseProps } from '../../types/ui';

type ListSize = 'sm' | 'md' | 'lg';

interface ListItemProps extends BaseProps {
  /**
   * The icon to display before the content
   */
  icon?: React.ReactNode;

  /**
   * The action to display after the content
   */
  action?: React.ReactNode;

  /**
   * Whether the item is disabled
   */
  disabled?: boolean;

  /**
   * Whether the item is selected
   */
  selected?: boolean;

  /**
   * Whether the item is clickable
   */
  clickable?: boolean;

  /**
   * Callback when the item is clicked
   */
  onClick?: () => void;

  /**
   * Secondary text to display below the main content
   */
  secondary?: React.ReactNode;

  /**
   * The size of the list item
   */
  size?: ListSize;

  /**
   * Whether to show hover effect
   */
  hoverable?: boolean;

  /**
   * Whether to make the item compact
   */
  compact?: boolean;
}

interface ListProps extends BaseProps {
  /**
   * The variant of the list
   */
  variant?: 'default' | 'bordered' | 'separated';

  /**
   * The size of the list items
   */
  size?: ListSize;

  /**
   * Whether to disable all items
   */
  disabled?: boolean;

  /**
   * Whether to show dividers between items
   */
  dividers?: boolean;

  /**
   * Whether to make all items clickable
   */
  clickable?: boolean;

  /**
   * Whether to show hover effect on items
   */
  hoverable?: boolean;

  /**
   * Whether to make the list compact
   */
  compact?: boolean;
}

interface ListComposition {
  Item: React.FC<ListItemProps>;
  Divider: React.FC<BaseProps>;
  Subheader: React.FC<BaseProps>;
}

const sizes: Record<ListSize, {
  padding: string;
  text: string;
  icon: string;
}> = {
  sm: {
    padding: 'py-1.5 px-3',
    text: 'text-sm',
    icon: 'w-4 h-4',
  },
  md: {
    padding: 'py-2 px-4',
    text: 'text-base',
    icon: 'w-5 h-5',
  },
  lg: {
    padding: 'py-3 px-5',
    text: 'text-lg',
    icon: 'w-6 h-6',
  },
};

const List: React.FC<ListProps> & ListComposition = ({
  children,
  variant = 'default',
  size = 'md',
  disabled = false,
  dividers = false,
  clickable = false,
  hoverable = true,
  compact = false,
  className = '',
  ...props
}) => {
  const variants = {
    default: '',
    bordered: 'border border-gray-200 rounded-lg overflow-hidden',
    separated: 'space-y-2',
  };

  return (
    <ul
      className={`
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return null;

        // Don't add divider after the last item or before/after dividers/subheaders
        const showDivider = dividers &&
          index < React.Children.count(children) - 1 &&
          child.type !== List.Divider &&
          child.type !== List.Subheader;

        return (
          <>
            {React.cloneElement(child, {
              ...child.props,
              size,
              disabled: child.props.disabled || disabled,
              clickable: child.props.clickable || clickable,
              hoverable: child.props.hoverable ?? hoverable,
              compact: child.props.compact ?? compact,
            })}
            {showDivider && <List.Divider />}
          </>
        );
      })}
    </ul>
  );
};

const ListItem: React.FC<ListItemProps> = ({
  children,
  icon,
  action,
  disabled = false,
  selected = false,
  clickable = false,
  onClick,
  secondary,
  size = 'md',
  hoverable = true,
  compact = false,
  className = '',
  ...props
}) => {
  const handleClick = () => {
    if (!disabled && (clickable || onClick)) {
      onClick?.();
    }
  };

  const sizeStyles = sizes[size];
  const padding = compact
    ? sizeStyles.padding.replace(/py-\d+\.?\d*/, m => `py-${parseFloat(m.split('-')[1]) * 0.75}`)
    : sizeStyles.padding;

  return (
    <li
      className={`
        ${padding}
        ${sizeStyles.text}
        ${(clickable || onClick) && !disabled ? 'cursor-pointer' : ''}
        ${hoverable && !disabled ? 'hover:bg-gray-50' : ''}
        ${selected ? 'bg-primary-50' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        transition-colors
        ${className}
      `}
      onClick={handleClick}
      {...props}
    >
      <div className="flex items-center">
        {/* Icon */}
        {icon && (
          <span className={`mr-3 ${sizeStyles.icon} text-gray-400`}>
            {icon}
          </span>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <div className="truncate">{children}</div>
          </div>
          {secondary && (
            <div className="text-sm text-gray-500 truncate">
              {secondary}
            </div>
          )}
        </div>

        {/* Action */}
        {action && (
          <div className="ml-3 flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </li>
  );
};

const ListDivider: React.FC<BaseProps> = ({
  className = '',
  ...props
}) => (
  <li
    className={`border-t border-gray-200 ${className}`}
    role="separator"
    {...props}
  />
);

const ListSubheader: React.FC<BaseProps> = ({
  children,
  className = '',
  ...props
}) => (
  <li
    className={`
      px-3 py-2
      text-xs font-semibold text-gray-500
      uppercase tracking-wider
      bg-gray-50
      ${className}
    `}
    {...props}
  >
    {children}
  </li>
);

List.Item = ListItem;
List.Divider = ListDivider;
List.Subheader = ListSubheader;

export default List;

/**
 * List Component Usage Guide:
 * 
 * 1. Basic list:
 *    <List>
 *      <List.Item>Item 1</List.Item>
 *      <List.Item>Item 2</List.Item>
 *    </List>
 * 
 * 2. With icons:
 *    <List>
 *      <List.Item icon={<Icon />}>
 *        Item with icon
 *      </List.Item>
 *    </List>
 * 
 * 3. With actions:
 *    <List>
 *      <List.Item
 *        action={<Button>Action</Button>}
 *      >
 *        Item with action
 *      </List.Item>
 *    </List>
 * 
 * 4. With secondary text:
 *    <List>
 *      <List.Item
 *        secondary="Secondary text"
 *      >
 *        Primary text
 *      </List.Item>
 *    </List>
 * 
 * 5. Different variants:
 *    <List variant="default" />
 *    <List variant="bordered" />
 *    <List variant="separated" />
 * 
 * 6. With dividers:
 *    <List dividers>
 *      <List.Item>Item 1</List.Item>
 *      <List.Item>Item 2</List.Item>
 *    </List>
 * 
 * 7. With subheaders:
 *    <List>
 *      <List.Subheader>Section 1</List.Subheader>
 *      <List.Item>Item 1</List.Item>
 *      <List.Item>Item 2</List.Item>
 *      <List.Subheader>Section 2</List.Subheader>
 *      <List.Item>Item 3</List.Item>
 *    </List>
 * 
 * 8. Clickable items:
 *    <List>
 *      <List.Item
 *        clickable
 *        onClick={() => console.log('clicked')}
 *      >
 *        Clickable item
 *      </List.Item>
 *    </List>
 * 
 * 9. Selected state:
 *    <List>
 *      <List.Item selected>
 *        Selected item
 *      </List.Item>
 *    </List>
 * 
 * 10. Disabled state:
 *     <List>
 *       <List.Item disabled>
 *         Disabled item
 *       </List.Item>
 *     </List>
 * 
 * Notes:
 * - Multiple variants
 * - Icon support
 * - Action buttons
 * - Secondary text
 * - Dividers
 * - Subheaders
 * - Clickable items
 * - Selected state
 * - Disabled state
 * - Accessible
 */

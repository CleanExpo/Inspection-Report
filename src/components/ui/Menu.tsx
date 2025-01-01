import React, { useState, useRef, useEffect } from 'react';
import { BaseProps } from '../../types/ui';
import Portal from './Portal';

interface MenuItemProps extends BaseProps {
  /**
   * The icon to display before the content
   */
  icon?: React.ReactNode;

  /**
   * Whether the item is disabled
   */
  disabled?: boolean;

  /**
   * Whether the item is selected
   */
  selected?: boolean;

  /**
   * Callback when the item is clicked
   */
  onClick?: () => void;

  /**
   * The keyboard shortcut to display
   */
  shortcut?: string;

  /**
   * Secondary text to display
   */
  description?: string;
}

interface MenuGroupProps extends BaseProps {
  /**
   * The label of the group
   */
  label?: string;
}

interface MenuProps extends BaseProps {
  /**
   * The trigger element
   */
  trigger: React.ReactElement;

  /**
   * Whether the menu is open
   */
  open?: boolean;

  /**
   * Callback when the menu should close
   */
  onClose?: () => void;

  /**
   * The placement of the menu
   */
  placement?: 'top' | 'right' | 'bottom' | 'left';

  /**
   * The alignment of the menu
   */
  align?: 'start' | 'center' | 'end';

  /**
   * The offset from the trigger
   */
  offset?: number;

  /**
   * Whether to show an arrow
   */
  arrow?: boolean;

  /**
   * The width of the menu
   */
  width?: number | string;
}

interface MenuComposition {
  Item: React.FC<MenuItemProps>;
  Group: React.FC<MenuGroupProps>;
  Divider: React.FC<BaseProps>;
}

const Menu: React.FC<MenuProps> & MenuComposition = ({
  children,
  trigger,
  open: controlledOpen,
  onClose,
  placement = 'bottom',
  align = 'start',
  offset = 8,
  arrow = true,
  width = 'auto',
  className = '',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [activeIndex, setActiveIndex] = useState(-1);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const open = controlledOpen !== undefined ? controlledOpen : isOpen;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const calculatePosition = () => {
    if (!triggerRef.current || !menuRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const menuRect = menuRef.current.getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = triggerRect.top + scrollY - menuRect.height - offset;
        break;
      case 'bottom':
        top = triggerRect.bottom + scrollY + offset;
        break;
      case 'left':
        left = triggerRect.left + scrollX - menuRect.width - offset;
        top = triggerRect.top + scrollY;
        break;
      case 'right':
        left = triggerRect.right + scrollX + offset;
        top = triggerRect.top + scrollY;
        break;
    }

    // Horizontal alignment
    if (placement === 'top' || placement === 'bottom') {
      switch (align) {
        case 'start':
          left = triggerRect.left + scrollX;
          break;
        case 'center':
          left = triggerRect.left + scrollX + (triggerRect.width - menuRect.width) / 2;
          break;
        case 'end':
          left = triggerRect.right + scrollX - menuRect.width;
          break;
      }
    }

    // Vertical alignment
    if (placement === 'left' || placement === 'right') {
      switch (align) {
        case 'start':
          top = triggerRect.top + scrollY;
          break;
        case 'center':
          top = triggerRect.top + scrollY + (triggerRect.height - menuRect.height) / 2;
          break;
        case 'end':
          top = triggerRect.bottom + scrollY - menuRect.height;
          break;
      }
    }

    // Keep within viewport
    const padding = 8;
    const viewportWidth = window.innerWidth - padding;
    const viewportHeight = window.innerHeight - padding;

    if (left < padding) {
      left = padding;
    } else if (left + menuRect.width > viewportWidth) {
      left = viewportWidth - menuRect.width;
    }

    if (top < padding) {
      top = padding;
    } else if (top + menuRect.height > viewportHeight) {
      top = viewportHeight - menuRect.height;
    }

    setCoords({ top, left });
  };

  useEffect(() => {
    if (open) {
      calculatePosition();
      window.addEventListener('scroll', calculatePosition);
      window.addEventListener('resize', calculatePosition);
    }

    return () => {
      window.removeEventListener('scroll', calculatePosition);
      window.removeEventListener('resize', calculatePosition);
    };
  }, [open]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const items = menuRef.current?.querySelectorAll('[role="menuitem"]');
    if (!items?.length) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex(prev => (prev + 1) % items.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex(prev => (prev - 1 + items.length) % items.length);
        break;
      case 'Enter':
        event.preventDefault();
        if (activeIndex >= 0) {
          (items[activeIndex] as HTMLElement).click();
        }
        break;
    }
  };

  return (
    <>
      {React.cloneElement(trigger, {
        ref: triggerRef,
        onClick: () => setIsOpen(!isOpen),
      })}
      {open && (
        <Portal>
          <div
            ref={menuRef}
            style={{
              position: 'absolute',
              top: coords.top,
              left: coords.left,
              width,
            }}
            className={`
              z-50
              min-w-[12rem]
              py-1
              bg-white
              rounded-lg
              shadow-lg
              ring-1 ring-black ring-opacity-5
              focus:outline-none
              ${className}
            `}
            role="menu"
            onKeyDown={handleKeyDown}
            {...props}
          >
            {children}
          </div>
        </Portal>
      )}
    </>
  );
};

const MenuItem: React.FC<MenuItemProps> = ({
  children,
  icon,
  disabled = false,
  selected = false,
  onClick,
  shortcut,
  description,
  className = '',
  ...props
}) => {
  return (
    <div
      role="menuitem"
      className={`
        group
        flex items-center
        w-full px-4 py-2
        text-sm text-gray-700
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100'}
        ${selected ? 'bg-gray-100' : ''}
        ${className}
      `}
      onClick={() => !disabled && onClick?.()}
      {...props}
    >
      {icon && (
        <span className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500">
          {icon}
        </span>
      )}
      <div className="flex-1 min-w-0">
        <div>{children}</div>
        {description && (
          <p className="mt-1 text-xs text-gray-500">
            {description}
          </p>
        )}
      </div>
      {shortcut && (
        <span className="ml-3 text-xs text-gray-500">
          {shortcut}
        </span>
      )}
    </div>
  );
};

const MenuGroup: React.FC<MenuGroupProps> = ({
  children,
  label,
  className = '',
  ...props
}) => {
  return (
    <div role="group" className={className} {...props}>
      {label && (
        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {label}
        </div>
      )}
      {children}
    </div>
  );
};

const MenuDivider: React.FC<BaseProps> = ({
  className = '',
  ...props
}) => (
  <div
    className={`h-px my-1 bg-gray-200 ${className}`}
    role="separator"
    {...props}
  />
);

Menu.Item = MenuItem;
Menu.Group = MenuGroup;
Menu.Divider = MenuDivider;

export default Menu;

/**
 * Menu Component Usage Guide:
 * 
 * 1. Basic menu:
 *    <Menu trigger={<Button>Open Menu</Button>}>
 *      <Menu.Item>Option 1</Menu.Item>
 *      <Menu.Item>Option 2</Menu.Item>
 *    </Menu>
 * 
 * 2. With icons and shortcuts:
 *    <Menu trigger={<Button>Actions</Button>}>
 *      <Menu.Item
 *        icon={<Icon />}
 *        shortcut="⌘K"
 *      >
 *        Action
 *      </Menu.Item>
 *    </Menu>
 * 
 * 3. With groups:
 *    <Menu trigger={<Button>Menu</Button>}>
 *      <Menu.Group label="Group 1">
 *        <Menu.Item>Option 1</Menu.Item>
 *        <Menu.Item>Option 2</Menu.Item>
 *      </Menu.Group>
 *      <Menu.Divider />
 *      <Menu.Group label="Group 2">
 *        <Menu.Item>Option 3</Menu.Item>
 *      </Menu.Group>
 *    </Menu>
 * 
 * 4. With descriptions:
 *    <Menu trigger={<Button>Menu</Button>}>
 *      <Menu.Item description="This is a description">
 *        Option with description
 *      </Menu.Item>
 *    </Menu>
 * 
 * 5. Different placements:
 *    <Menu placement="top" />
 *    <Menu placement="right" />
 *    <Menu placement="bottom" />
 *    <Menu placement="left" />
 * 
 * 6. Different alignments:
 *    <Menu align="start" />
 *    <Menu align="center" />
 *    <Menu align="end" />
 * 
 * 7. Custom width:
 *    <Menu width={200} />
 * 
 * 8. Without arrow:
 *    <Menu arrow={false} />
 * 
 * 9. Controlled:
 *    <Menu
 *      open={isOpen}
 *      onClose={() => setIsOpen(false)}
 *    />
 * 
 * Notes:
 * - Multiple placements
 * - Different alignments
 * - Icon support
 * - Keyboard navigation
 * - Groups and dividers
 * - Descriptions
 * - Shortcuts
 * - Selected state
 * - Disabled state
 * - Accessible
 */

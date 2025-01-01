import React, { useState, useRef, useEffect } from 'react';
import { BaseProps } from '../../types/ui';

interface DropdownItemProps extends BaseProps {
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
  selected?: boolean;
  shortcut?: string;
}

interface DropdownProps extends BaseProps {
  trigger: React.ReactNode;
  align?: 'left' | 'right';
  width?: number | string;
  disabled?: boolean;
  closeOnClick?: boolean;
  closeOnClickOutside?: boolean;
  closeOnEsc?: boolean;
}

interface DropdownComposition {
  Item: React.FC<DropdownItemProps>;
  Divider: React.FC<BaseProps>;
  Group: React.FC<BaseProps>;
  Label: React.FC<BaseProps>;
}

const Dropdown: React.FC<DropdownProps> & DropdownComposition = ({
  children,
  trigger,
  align = 'left',
  width = 'auto',
  disabled = false,
  closeOnClick = true,
  closeOnClickOutside = true,
  closeOnEsc = true,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        closeOnClickOutside &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (closeOnEsc && event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closeOnClickOutside, closeOnEsc]);

  const handleClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      <div
        onClick={handleClick}
        className={disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`
            absolute z-50 mt-2
            ${align === 'right' ? 'right-0' : 'left-0'}
            bg-white rounded-md shadow-lg
            ring-1 ring-black ring-opacity-5
          `}
          style={{ width }}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="dropdown-button"
        >
          <div className="py-1" role="none">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

const DropdownItem: React.FC<DropdownItemProps> = ({
  children,
  icon,
  onClick,
  disabled = false,
  danger = false,
  selected = false,
  shortcut,
  className = '',
}) => {
  const handleClick = () => {
    if (!disabled) {
      onClick?.();
    }
  };

  return (
    <button
      className={`
        w-full text-left px-4 py-2 text-sm
        ${disabled
          ? 'text-gray-400 cursor-not-allowed'
          : danger
          ? 'text-red-600 hover:bg-red-50 focus:bg-red-50'
          : 'text-gray-700 hover:bg-gray-100 focus:bg-gray-100'
        }
        ${selected ? 'bg-gray-100' : ''}
        focus:outline-none
        ${className}
      `}
      onClick={handleClick}
      disabled={disabled}
      role="menuitem"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {icon && <span className="mr-3">{icon}</span>}
          {children}
        </div>
        {shortcut && (
          <span className="ml-3 text-xs text-gray-400">{shortcut}</span>
        )}
      </div>
    </button>
  );
};

const DropdownDivider: React.FC<BaseProps> = ({
  className = '',
}) => (
  <div
    className={`h-px my-1 bg-gray-200 ${className}`}
    role="separator"
  />
);

const DropdownGroup: React.FC<BaseProps> = ({
  children,
  className = '',
}) => (
  <div className={className} role="group">
    {children}
  </div>
);

const DropdownLabel: React.FC<BaseProps> = ({
  children,
  className = '',
}) => (
  <div className={`px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider ${className}`}>
    {children}
  </div>
);

Dropdown.Item = DropdownItem;
Dropdown.Divider = DropdownDivider;
Dropdown.Group = DropdownGroup;
Dropdown.Label = DropdownLabel;

export default Dropdown;

/**
 * Dropdown Component Usage Guide:
 * 
 * 1. Basic dropdown:
 *    <Dropdown trigger={<Button>Open</Button>}>
 *      <Dropdown.Item>Option 1</Dropdown.Item>
 *      <Dropdown.Item>Option 2</Dropdown.Item>
 *    </Dropdown>
 * 
 * 2. With icons and shortcuts:
 *    <Dropdown trigger={<Button>Actions</Button>}>
 *      <Dropdown.Item
 *        icon={<Icon />}
 *        shortcut="⌘K"
 *      >
 *        Action
 *      </Dropdown.Item>
 *    </Dropdown>
 * 
 * 3. With groups and labels:
 *    <Dropdown trigger={<Button>Menu</Button>}>
 *      <Dropdown.Label>Group 1</Dropdown.Label>
 *      <Dropdown.Group>
 *        <Dropdown.Item>Option 1</Dropdown.Item>
 *        <Dropdown.Item>Option 2</Dropdown.Item>
 *      </Dropdown.Group>
 *      <Dropdown.Divider />
 *      <Dropdown.Label>Group 2</Dropdown.Label>
 *      <Dropdown.Group>
 *        <Dropdown.Item>Option 3</Dropdown.Item>
 *        <Dropdown.Item>Option 4</Dropdown.Item>
 *      </Dropdown.Group>
 *    </Dropdown>
 * 
 * 4. With danger items:
 *    <Dropdown trigger={<Button>Actions</Button>}>
 *      <Dropdown.Item>Edit</Dropdown.Item>
 *      <Dropdown.Divider />
 *      <Dropdown.Item danger>Delete</Dropdown.Item>
 *    </Dropdown>
 * 
 * 5. Different alignments:
 *    <Dropdown
 *      align="right"
 *      trigger={<Button>Align Right</Button>}
 *    >
 *      <Dropdown.Item>Option</Dropdown.Item>
 *    </Dropdown>
 * 
 * 6. Custom width:
 *    <Dropdown
 *      width={200}
 *      trigger={<Button>Custom Width</Button>}
 *    >
 *      <Dropdown.Item>Option</Dropdown.Item>
 *    </Dropdown>
 * 
 * 7. Disabled state:
 *    <Dropdown
 *      disabled
 *      trigger={<Button>Disabled</Button>}
 *    >
 *      <Dropdown.Item>Option</Dropdown.Item>
 *    </Dropdown>
 * 
 * Notes:
 * - Multiple item types
 * - Keyboard navigation
 * - Click outside handling
 * - Escape key support
 * - Custom positioning
 * - Accessible
 */

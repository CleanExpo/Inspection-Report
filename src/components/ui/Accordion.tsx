import React, { useState } from 'react';
import { BaseProps } from '../../types/ui';

type AccordionVariant = 'default' | 'bordered' | 'separated';
type AccordionSize = 'sm' | 'md' | 'lg';

interface AccordionItemProps extends BaseProps {
  /**
   * The title of the accordion item
   */
  title: React.ReactNode;

  /**
   * Whether the accordion item is disabled
   */
  disabled?: boolean;

  /**
   * The icon to display before the title
   */
  icon?: React.ReactNode;

  /**
   * Whether the accordion item is expanded
   */
  expanded?: boolean;

  /**
   * Callback when the accordion item is toggled
   */
  onChange?: (expanded: boolean) => void;
}

interface AccordionProps extends BaseProps {
  /**
   * Whether to allow multiple items to be expanded at once
   */
  multiple?: boolean;

  /**
   * The variant of the accordion
   */
  variant?: AccordionVariant;

  /**
   * The size of the accordion
   */
  size?: AccordionSize;

  /**
   * Whether to expand all items by default
   */
  defaultExpanded?: boolean;

  /**
   * The index(es) of the expanded item(s)
   */
  value?: number | number[];

  /**
   * Callback when an item is toggled
   */
  onChange?: (value: number | number[]) => void;

  /**
   * Whether to disable all items
   */
  disabled?: boolean;
}

interface AccordionComposition {
  Item: React.FC<AccordionItemProps>;
}

interface AccordionContextType {
  variant: AccordionVariant;
  size: AccordionSize;
  multiple: boolean;
  expandedItems: number[];
  toggleItem: (index: number) => void;
  disabled: boolean;
}

const AccordionContext = React.createContext<AccordionContextType>({
  variant: 'default',
  size: 'md',
  multiple: false,
  expandedItems: [],
  toggleItem: () => {},
  disabled: false,
});

const variants: Record<AccordionVariant, string> = {
  default: 'divide-y divide-gray-200',
  bordered: 'border border-gray-200 rounded-lg divide-y divide-gray-200',
  separated: 'space-y-2',
};

const sizes: Record<AccordionSize, {
  title: string;
  content: string;
  padding: string;
  icon: string;
}> = {
  sm: {
    title: 'text-sm',
    content: 'text-sm',
    padding: 'py-2 px-3',
    icon: 'w-4 h-4',
  },
  md: {
    title: 'text-base',
    content: 'text-base',
    padding: 'py-3 px-4',
    icon: 'w-5 h-5',
  },
  lg: {
    title: 'text-lg',
    content: 'text-lg',
    padding: 'py-4 px-5',
    icon: 'w-6 h-6',
  },
};

const itemVariants: Record<AccordionVariant, string> = {
  default: '',
  bordered: '',
  separated: 'border border-gray-200 rounded-lg',
};

const Accordion: React.FC<AccordionProps> & AccordionComposition = ({
  children,
  multiple = false,
  variant = 'default',
  size = 'md',
  defaultExpanded = false,
  value,
  onChange,
  disabled = false,
  className = '',
  ...props
}) => {
  const [expandedItems, setExpandedItems] = useState<number[]>(() => {
    if (value !== undefined) {
      return Array.isArray(value) ? value : [value];
    }
    return defaultExpanded ? React.Children.map(children, (_, i) => i) || [] : [];
  });

  const toggleItem = (index: number) => {
    let newExpandedItems: number[];

    if (multiple) {
      newExpandedItems = expandedItems.includes(index)
        ? expandedItems.filter(i => i !== index)
        : [...expandedItems, index];
    } else {
      newExpandedItems = expandedItems.includes(index) ? [] : [index];
    }

    setExpandedItems(newExpandedItems);
    onChange?.(multiple ? newExpandedItems : newExpandedItems[0]);
  };

  return (
    <AccordionContext.Provider
      value={{
        variant,
        size,
        multiple,
        expandedItems,
        toggleItem,
        disabled,
      }}
    >
      <div
        className={`
          ${variants[variant]}
          ${className}
        `}
        {...props}
      >
        {React.Children.map(children, (child, index) => {
          if (!React.isValidElement(child)) return null;
          return React.cloneElement(child, {
            ...child.props,
            expanded: expandedItems.includes(index),
            onChange: (expanded: boolean) => {
              if (expanded) {
                toggleItem(index);
              } else {
                toggleItem(index);
              }
              child.props.onChange?.(expanded);
            },
          });
        })}
      </div>
    </AccordionContext.Provider>
  );
};

const AccordionItem: React.FC<AccordionItemProps> = ({
  children,
  title,
  disabled = false,
  icon,
  expanded,
  onChange,
  className = '',
  ...props
}) => {
  const { variant, size, disabled: groupDisabled } = React.useContext(AccordionContext);

  const isDisabled = disabled || groupDisabled;

  return (
    <div
      className={`
        ${itemVariants[variant]}
        ${className}
      `}
      {...props}
    >
      <button
        className={`
          w-full
          flex items-center justify-between
          ${sizes[size].padding}
          ${sizes[size].title}
          text-left
          ${isDisabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50'}
          transition-colors
        `}
        onClick={() => !isDisabled && onChange?.(!expanded)}
        disabled={isDisabled}
        aria-expanded={expanded}
      >
        <div className="flex items-center">
          {icon && (
            <span className="mr-3">{icon}</span>
          )}
          {title}
        </div>
        <svg
          className={`
            ${sizes[size].icon}
            transform transition-transform duration-200
            ${expanded ? 'rotate-180' : ''}
            text-gray-400
          `}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {expanded && (
        <div
          className={`
            ${sizes[size].padding}
            ${sizes[size].content}
            border-t border-gray-200
          `}
        >
          {children}
        </div>
      )}
    </div>
  );
};

Accordion.Item = AccordionItem;

export default Accordion;

/**
 * Accordion Component Usage Guide:
 * 
 * 1. Basic accordion:
 *    <Accordion>
 *      <Accordion.Item title="Section 1">
 *        Content 1
 *      </Accordion.Item>
 *      <Accordion.Item title="Section 2">
 *        Content 2
 *      </Accordion.Item>
 *    </Accordion>
 * 
 * 2. Multiple sections open:
 *    <Accordion multiple>
 *      <Accordion.Item title="Section 1">
 *        Content 1
 *      </Accordion.Item>
 *      <Accordion.Item title="Section 2">
 *        Content 2
 *      </Accordion.Item>
 *    </Accordion>
 * 
 * 3. Different variants:
 *    <Accordion variant="default" />
 *    <Accordion variant="bordered" />
 *    <Accordion variant="separated" />
 * 
 * 4. Different sizes:
 *    <Accordion size="sm" />
 *    <Accordion size="md" />
 *    <Accordion size="lg" />
 * 
 * 5. With icons:
 *    <Accordion>
 *      <Accordion.Item
 *        title="Section 1"
 *        icon={<Icon />}
 *      >
 *        Content 1
 *      </Accordion.Item>
 *    </Accordion>
 * 
 * 6. Disabled items:
 *    <Accordion>
 *      <Accordion.Item
 *        title="Section 1"
 *        disabled
 *      >
 *        Content 1
 *      </Accordion.Item>
 *    </Accordion>
 * 
 * 7. Controlled:
 *    <Accordion
 *      value={expandedItems}
 *      onChange={setExpandedItems}
 *    >
 *      <Accordion.Item title="Section 1">
 *        Content 1
 *      </Accordion.Item>
 *    </Accordion>
 * 
 * 8. Default expanded:
 *    <Accordion defaultExpanded>
 *      <Accordion.Item title="Section 1">
 *        Content 1
 *      </Accordion.Item>
 *    </Accordion>
 * 
 * Notes:
 * - Single or multiple open sections
 * - Multiple variants
 * - Different sizes
 * - Icon support
 * - Disabled state
 * - Controlled and uncontrolled modes
 * - Default expanded state
 * - Accessible
 */

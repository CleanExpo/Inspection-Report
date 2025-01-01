import React, { useState } from 'react';
import { BaseProps } from '../../types/ui';

type TabVariant = 'default' | 'contained' | 'pills';
type TabSize = 'sm' | 'md' | 'lg';
type TabOrientation = 'horizontal' | 'vertical';

interface TabProps extends BaseProps {
  /**
   * The label of the tab
   */
  label: React.ReactNode;

  /**
   * The value of the tab (used for selection)
   */
  value: string;

  /**
   * The icon to display before the label
   */
  icon?: React.ReactNode;

  /**
   * Whether the tab is disabled
   */
  disabled?: boolean;
}

interface TabsProps extends BaseProps {
  /**
   * The currently selected tab value
   */
  value?: string;

  /**
   * Callback when tab selection changes
   */
  onChange?: (value: string) => void;

  /**
   * The variant of the tabs
   */
  variant?: TabVariant;

  /**
   * The orientation of the tabs
   */
  orientation?: TabOrientation;

  /**
   * The size of the tabs
   */
  size?: TabSize;

  /**
   * Whether to stretch tabs to full width
   */
  fullWidth?: boolean;

  /**
   * Whether to center the tabs
   */
  centered?: boolean;

  /**
   * Whether to show a divider below the tabs
   */
  divider?: boolean;
}

interface TabsComposition {
  Tab: React.FC<TabProps>;
  Panel: React.FC<{ value: string } & BaseProps>;
}

interface TabContextType {
  selectedValue?: string;
  onChange?: (value: string) => void;
  variant: TabVariant;
  orientation: TabOrientation;
  size: TabSize;
}

const TabContext = React.createContext<TabContextType>({
  variant: 'default',
  orientation: 'horizontal',
  size: 'md',
});

const variants: Record<TabVariant, string> = {
  default: 'border-b border-gray-200',
  contained: 'bg-gray-100 p-1 rounded-lg',
  pills: 'space-x-1',
};

const sizes: Record<TabSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

const tabVariants: Record<TabVariant, string> = {
  default: 'border-b-2 hover:text-gray-700 hover:border-gray-300',
  contained: 'hover:text-gray-700',
  pills: 'rounded-full hover:text-gray-700 hover:bg-gray-100',
};

const tabSizes: Record<TabSize, string> = {
  sm: 'px-3 py-2',
  md: 'px-4 py-2.5',
  lg: 'px-5 py-3',
};

const Tabs: React.FC<TabsProps> & TabsComposition = ({
  children,
  value,
  onChange,
  variant = 'default',
  orientation = 'horizontal',
  size = 'md',
  fullWidth = false,
  centered = false,
  divider = true,
  className = '',
  ...props
}) => {
  const [selectedValue, setSelectedValue] = useState(value);

  const handleChange = (newValue: string) => {
    setSelectedValue(newValue);
    onChange?.(newValue);
  };

  return (
    <TabContext.Provider
      value={{
        selectedValue: value ?? selectedValue,
        onChange: handleChange,
        variant,
        orientation,
        size,
      }}
    >
      <div
        className={`
          ${orientation === 'vertical' ? 'flex' : ''}
          ${className}
        `}
        {...props}
      >
        <div
          className={`
            ${orientation === 'horizontal' ? 'flex' : 'flex-col'}
            ${variants[variant]}
            ${fullWidth ? 'w-full' : ''}
            ${centered ? 'justify-center' : ''}
            ${orientation === 'vertical' ? 'border-r border-gray-200' : ''}
          `}
          role="tablist"
        >
          {React.Children.map(children, (child) => {
            if (!React.isValidElement(child) || child.type !== Tab) {
              return null;
            }
            return child;
          })}
        </div>
        <div className={orientation === 'vertical' ? 'flex-1 ml-6' : 'mt-6'}>
          {React.Children.map(children, (child) => {
            if (!React.isValidElement(child) || child.type !== TabPanel) {
              return null;
            }
            return child;
          })}
        </div>
      </div>
    </TabContext.Provider>
  );
};

const Tab: React.FC<TabProps> = ({
  label,
  value,
  icon,
  disabled = false,
  className = '',
  ...props
}) => {
  const { selectedValue, onChange, variant, size } = React.useContext(TabContext);
  const isSelected = value === selectedValue;

  const getVariantClasses = () => {
    switch (variant) {
      case 'default':
        return `border-b-2 ${
          isSelected
            ? 'border-primary-600 text-primary-600'
            : 'border-transparent text-gray-500'
        }`;
      case 'contained':
        return isSelected
          ? 'bg-white shadow text-primary-600'
          : 'text-gray-500';
      case 'pills':
        return isSelected
          ? 'bg-primary-600 text-white'
          : 'text-gray-500';
      default:
        return '';
    }
  };

  return (
    <button
      role="tab"
      aria-selected={isSelected}
      aria-disabled={disabled}
      className={`
        flex items-center
        font-medium
        transition-colors
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
        ${getVariantClasses()}
        ${tabVariants[variant]}
        ${tabSizes[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      onClick={() => !disabled && onChange?.(value)}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </button>
  );
};

const TabPanel: React.FC<{ value: string } & BaseProps> = ({
  value,
  children,
  className = '',
  ...props
}) => {
  const { selectedValue } = React.useContext(TabContext);
  const isSelected = value === selectedValue;

  if (!isSelected) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      className={className}
      {...props}
    >
      {children}
    </div>
  );
};

Tabs.Tab = Tab;
Tabs.Panel = TabPanel;

export default Tabs;

/**
 * Tabs Component Usage Guide:
 * 
 * 1. Basic tabs:
 *    <Tabs>
 *      <Tabs.Tab label="Tab 1" value="1">
 *      <Tabs.Tab label="Tab 2" value="2">
 *      <Tabs.Panel value="1">Content 1</Tabs.Panel>
 *      <Tabs.Panel value="2">Content 2</Tabs.Panel>
 *    </Tabs>
 * 
 * 2. Different variants:
 *    <Tabs variant="default" />
 *    <Tabs variant="contained" />
 *    <Tabs variant="pills" />
 * 
 * 3. Different orientations:
 *    <Tabs orientation="horizontal" />
 *    <Tabs orientation="vertical" />
 * 
 * 4. Different sizes:
 *    <Tabs size="sm" />
 *    <Tabs size="md" />
 *    <Tabs size="lg" />
 * 
 * 5. With icons:
 *    <Tabs>
 *      <Tabs.Tab
 *        label="Settings"
 *        value="settings"
 *        icon={<SettingsIcon />}
 *      />
 *    </Tabs>
 * 
 * 6. Full width:
 *    <Tabs fullWidth>
 *      <Tabs.Tab label="Tab 1" value="1" />
 *      <Tabs.Tab label="Tab 2" value="2" />
 *    </Tabs>
 * 
 * 7. Centered:
 *    <Tabs centered>
 *      <Tabs.Tab label="Tab 1" value="1" />
 *      <Tabs.Tab label="Tab 2" value="2" />
 *    </Tabs>
 * 
 * 8. Disabled tabs:
 *    <Tabs>
 *      <Tabs.Tab label="Tab 1" value="1" />
 *      <Tabs.Tab label="Tab 2" value="2" disabled />
 *    </Tabs>
 * 
 * 9. Controlled:
 *    <Tabs
 *      value={value}
 *      onChange={setValue}
 *    >
 *      <Tabs.Tab label="Tab 1" value="1" />
 *      <Tabs.Tab label="Tab 2" value="2" />
 *    </Tabs>
 * 
 * Notes:
 * - Multiple variants
 * - Different orientations
 * - Multiple sizes
 * - Icon support
 * - Full width option
 * - Centered option
 * - Disabled state
 * - Controlled mode
 * - Accessible
 */

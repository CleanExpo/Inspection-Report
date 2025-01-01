import { HTMLAttributes, ButtonHTMLAttributes, InputHTMLAttributes } from 'react';

/**
 * Base props interface
 */
export interface BaseProps {
  /**
   * Child elements
   */
  children?: React.ReactNode;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Additional inline styles
   */
  style?: React.CSSProperties;

  /**
   * ID attribute
   */
  id?: string;

  /**
   * Data attributes
   */
  [key: `data-${string}`]: string | undefined;

  /**
   * ARIA attributes
   */
  [key: `aria-${string}`]: string | boolean | number | undefined;
}

/**
 * Props for components that render HTML elements
 */
export interface HTMLElementProps extends HTMLAttributes<HTMLElement>, BaseProps {}

/**
 * Props for button components
 */
export interface ButtonElementProps extends ButtonHTMLAttributes<HTMLButtonElement>, BaseProps {}

/**
 * Props for input components
 */
export interface InputElementProps extends InputHTMLAttributes<HTMLInputElement>, BaseProps {}

/**
 * Props for components that have a value and onChange
 */
export interface ValueProps<T> extends BaseProps {
  /**
   * Current value
   */
  value?: T;

  /**
   * Default value
   */
  defaultValue?: T;

  /**
   * Change handler
   */
  onChange?: (value: T) => void;
}

/**
 * Props for components that can be disabled
 */
export interface DisableableProps extends BaseProps {
  /**
   * Whether the component is disabled
   */
  disabled?: boolean;
}

/**
 * Props for components that can show errors
 */
export interface ErrorableProps extends BaseProps {
  /**
   * Error message to display
   */
  error?: string;
}

/**
 * Props for components that can have different sizes
 */
export interface SizeableProps extends BaseProps {
  /**
   * Component size
   */
  size?: Size;
}

/**
 * Props for components that can have different colors
 */
export interface ColorableProps extends BaseProps {
  /**
   * Component color
   */
  color?: ColorVariant | string;
}

/**
 * Props for components that can be selected
 */
export interface SelectableProps extends BaseProps {
  /**
   * Whether the component is selected
   */
  selected?: boolean;

  /**
   * Selection change handler
   */
  onSelect?: () => void;
}

/**
 * Props for form field components
 */
export interface FormFieldProps extends ValueProps<any>, DisableableProps, ErrorableProps {
  /**
   * Field name
   */
  name: string;

  /**
   * Field label
   */
  label?: React.ReactNode;

  /**
   * Whether the field is required
   */
  required?: boolean;

  /**
   * Whether the field is readonly
   */
  readOnly?: boolean;

  /**
   * Helper text to display
   */
  helperText?: React.ReactNode;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Blur handler
   */
  onBlur?: () => void;

  /**
   * Focus handler
   */
  onFocus?: () => void;
}

/**
 * Props for overlay components
 */
export interface OverlayProps extends BaseProps {
  /**
   * Whether the overlay is open
   */
  open: boolean;

  /**
   * Close handler
   */
  onClose?: () => void;

  /**
   * Whether to show backdrop
   */
  backdrop?: boolean;

  /**
   * Whether clicking backdrop closes overlay
   */
  closeOnBackdropClick?: boolean;

  /**
   * Whether pressing escape closes overlay
   */
  closeOnEsc?: boolean;

  /**
   * Whether to prevent scrolling when open
   */
  preventScroll?: boolean;
}

/**
 * Props for list item components
 */
export interface ListItemProps extends SelectableProps, DisableableProps {
  /**
   * Whether the item is focused
   */
  focused?: boolean;

  /**
   * Icon to display
   */
  icon?: React.ReactNode;

  /**
   * Secondary content
   */
  secondary?: React.ReactNode;

  /**
   * Click handler
   */
  onClick?: () => void;
}

/**
 * Common size options
 */
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Common color variants
 */
export type ColorVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

/**
 * Common position options
 */
export type Position = 'top' | 'right' | 'bottom' | 'left';

/**
 * Common alignment options
 */
export type Alignment = 'start' | 'center' | 'end';

/**
 * Common animation options
 */
export type Animation = 'none' | 'fade' | 'slide' | 'scale';

/**
 * Common status options
 */
export type Status = 'idle' | 'loading' | 'success' | 'error';

/**
 * Common validation state
 */
export interface ValidationState {
  /**
   * Whether the field is valid
   */
  isValid: boolean;

  /**
   * Error message if invalid
   */
  error?: string;

  /**
   * Whether the field has been touched
   */
  touched: boolean;
}

/**
 * Common table column definition
 */
export interface TableColumn<T = any> {
  /**
   * Column ID
   */
  id: string;

  /**
   * Column header
   */
  header: React.ReactNode;

  /**
   * Cell content accessor
   */
  accessor: (row: T) => React.ReactNode;

  /**
   * Whether column is sortable
   */
  sortable?: boolean;

  /**
   * Whether column is filterable
   */
  filterable?: boolean;

  /**
   * Column width
   */
  width?: number | string;

  /**
   * Text alignment
   */
  align?: 'left' | 'center' | 'right';
}

/**
 * Props for date/time components
 */
export interface DateTimeProps extends ValueProps<Date>, DisableableProps, ErrorableProps {
  /**
   * Minimum allowed value
   */
  min?: Date;

  /**
   * Maximum allowed value
   */
  max?: Date;

  /**
   * Locale for formatting
   */
  locale?: string;

  /**
   * Format string
   */
  format?: string;
}

/**
 * Props for file components
 */
export interface FileProps extends ValueProps<File[]>, DisableableProps, ErrorableProps {
  /**
   * Accepted file types
   */
  accept?: string;

  /**
   * Whether multiple files are allowed
   */
  multiple?: boolean;

  /**
   * Maximum file size
   */
  maxSize?: number;
}

/**
 * Props for color components
 */
export interface ColorProps extends ValueProps<string>, DisableableProps, ErrorableProps {
  /**
   * Whether to show opacity control
   */
  showAlpha?: boolean;

  /**
   * Color format
   */
  format?: 'hex' | 'rgb' | 'hsl';
}

/**
 * Props for portal components
 */
export interface PortalProps extends BaseProps {
  /**
   * Container element
   */
  container?: Element;

  /**
   * Whether portal is disabled
   */
  disabled?: boolean;

  /**
   * Mount handler
   */
  onMount?: () => void;

  /**
   * Unmount handler
   */
  onUnmount?: () => void;
}

/**
 * Props for transition components
 */
export interface TransitionProps extends BaseProps {
  /**
   * Whether component is showing
   */
  in: boolean;

  /**
   * Enter start handler
   */
  onEnter?: () => void;

  /**
   * Enter end handler
   */
  onEntered?: () => void;

  /**
   * Exit start handler
   */
  onExit?: () => void;

  /**
   * Exit end handler
   */
  onExited?: () => void;

  /**
   * Transition duration
   */
  duration?: number;
}

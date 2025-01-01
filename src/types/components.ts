import { BaseProps, ColorableProps, DisableableProps, ErrorableProps, SizeableProps, ValueProps } from './ui';

/**
 * Accordion component props
 */
export interface AccordionProps extends BaseProps {
  /**
   * Currently expanded panel(s)
   */
  expanded?: number | number[];

  /**
   * Change handler
   */
  onChange?: (expanded: number | number[]) => void;

  /**
   * Whether multiple panels can be expanded
   */
  multiple?: boolean;
}

/**
 * Alert component props
 */
export interface AlertProps extends BaseProps, ColorableProps {
  /**
   * Alert title
   */
  title?: React.ReactNode;

  /**
   * Alert variant
   */
  variant?: 'standard' | 'filled' | 'outlined';

  /**
   * Whether alert is dismissible
   */
  dismissible?: boolean;

  /**
   * Dismiss handler
   */
  onDismiss?: () => void;

  /**
   * Whether to show icon
   */
  icon?: boolean | React.ReactNode;
}

/**
 * Avatar component props
 */
export interface AvatarProps extends BaseProps, ColorableProps {
  /**
   * Image source URL
   */
  src?: string;

  /**
   * Alt text for image
   */
  alt?: string;

  /**
   * Fallback text when image fails to load
   */
  fallback?: string;

  /**
   * Avatar shape
   */
  shape?: 'circle' | 'square' | 'rounded';
}

/**
 * Badge component props
 */
export interface BadgeProps extends BaseProps, ColorableProps {
  /**
   * Badge content
   */
  content?: React.ReactNode;

  /**
   * Maximum value to display
   */
  max?: number;

  /**
   * Whether to show dot instead of content
   */
  dot?: boolean;

  /**
   * Badge placement
   */
  placement?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

/**
 * Button component props
 */
export interface ButtonProps extends BaseProps, ColorableProps, DisableableProps, SizeableProps {
  /**
   * Button variant
   */
  variant?: 'solid' | 'outline' | 'ghost' | 'link';

  /**
   * Whether button is in loading state
   */
  loading?: boolean;

  /**
   * Icon to display before text
   */
  startIcon?: React.ReactNode;

  /**
   * Icon to display after text
   */
  endIcon?: React.ReactNode;

  /**
   * Whether button takes full width
   */
  fullWidth?: boolean;
}

/**
 * Card component props
 */
export interface CardProps extends BaseProps {
  /**
   * Whether to show card border
   */
  bordered?: boolean;

  /**
   * Whether to show card shadow
   */
  elevated?: boolean;

  /**
   * Card padding size
   */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Checkbox component props
 */
export interface CheckboxProps extends BaseProps, DisableableProps, ErrorableProps {
  /**
   * Checkbox label
   */
  label?: React.ReactNode;

  /**
   * Whether checkbox is checked
   */
  checked?: boolean;

  /**
   * Whether checkbox is in indeterminate state
   */
  indeterminate?: boolean;

  /**
   * Label position
   */
  labelPosition?: 'left' | 'right';
}

/**
 * Chip component props
 */
export interface ChipProps extends BaseProps, ColorableProps, DisableableProps {
  /**
   * Chip variant
   */
  variant?: 'solid' | 'outline';

  /**
   * Whether chip is deletable
   */
  deletable?: boolean;

  /**
   * Delete handler
   */
  onDelete?: () => void;

  /**
   * Icon to display before label
   */
  icon?: React.ReactNode;
}

/**
 * ColorPicker component props
 */
export interface ColorPickerProps extends BaseProps, ValueProps<string>, DisableableProps {
  /**
   * Color format
   */
  format?: 'hex' | 'rgb' | 'hsl';

  /**
   * Whether to show opacity control
   */
  showAlpha?: boolean;

  /**
   * Whether to show color swatches
   */
  showSwatches?: boolean;

  /**
   * Custom color swatches
   */
  swatches?: string[];
}

/**
 * DataTable component props
 */
export interface DataTableProps<T = any> extends BaseProps {
  /**
   * Table data
   */
  data: T[];

  /**
   * Column definitions
   */
  columns: Array<{
    id: string;
    header: React.ReactNode;
    accessor: (row: T) => React.ReactNode;
    sortable?: boolean;
    filterable?: boolean;
    width?: number | string;
    align?: 'left' | 'center' | 'right';
  }>;

  /**
   * Whether to show pagination
   */
  pagination?: boolean;

  /**
   * Number of rows per page
   */
  pageSize?: number;

  /**
   * Whether to show row selection
   */
  selectable?: boolean;

  /**
   * Selected row IDs
   */
  selected?: string[];

  /**
   * Selection change handler
   */
  onSelectionChange?: (selected: string[]) => void;
}

/**
 * DatePicker component props
 */
export interface DatePickerProps extends BaseProps, ValueProps<Date>, DisableableProps {
  /**
   * Minimum selectable date
   */
  minDate?: Date;

  /**
   * Maximum selectable date
   */
  maxDate?: Date;

  /**
   * Whether to show today button
   */
  showToday?: boolean;

  /**
   * Whether to show clear button
   */
  showClear?: boolean;

  /**
   * Date format
   */
  format?: string;

  /**
   * Locale for formatting
   */
  locale?: string;
}

/**
 * Dialog component props
 */
export interface DialogProps extends BaseProps {
  /**
   * Whether dialog is open
   */
  open: boolean;

  /**
   * Close handler
   */
  onClose?: () => void;

  /**
   * Dialog size
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';

  /**
   * Whether to show backdrop
   */
  backdrop?: boolean;

  /**
   * Whether clicking backdrop closes dialog
   */
  closeOnBackdropClick?: boolean;

  /**
   * Whether pressing escape closes dialog
   */
  closeOnEsc?: boolean;
}

/**
 * Divider component props
 */
export interface DividerProps extends BaseProps {
  /**
   * Divider orientation
   */
  orientation?: 'horizontal' | 'vertical';

  /**
   * Text alignment for horizontal divider
   */
  align?: 'left' | 'center' | 'right';

  /**
   * Whether to add margin
   */
  spacing?: boolean;
}

/**
 * Drawer component props
 */
export interface DrawerProps extends BaseProps {
  /**
   * Whether drawer is open
   */
  open: boolean;

  /**
   * Close handler
   */
  onClose?: () => void;

  /**
   * Drawer position
   */
  position?: 'left' | 'right' | 'top' | 'bottom';

  /**
   * Drawer size
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

/**
 * FileUpload component props
 */
export interface FileUploadProps extends BaseProps, DisableableProps, ErrorableProps {
  /**
   * Accepted file types
   */
  accept?: string;

  /**
   * Whether multiple files are allowed
   */
  multiple?: boolean;

  /**
   * Maximum file size in bytes
   */
  maxSize?: number;

  /**
   * Maximum number of files
   */
  maxFiles?: number;

  /**
   * Whether to show file preview
   */
  preview?: boolean;

  /**
   * Whether to show drag and drop zone
   */
  dragDrop?: boolean;
}

/**
 * Input component props
 */
export interface InputProps extends BaseProps, DisableableProps, ErrorableProps, SizeableProps {
  /**
   * Input type
   */
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search';

  /**
   * Icon to display before input
   */
  startIcon?: React.ReactNode;

  /**
   * Icon to display after input
   */
  endIcon?: React.ReactNode;

  /**
   * Whether input takes full width
   */
  fullWidth?: boolean;
}

/**
 * List component props
 */
export interface ListProps extends BaseProps {
  /**
   * List variant
   */
  variant?: 'default' | 'ordered' | 'unordered';

  /**
   * Whether list items are selectable
   */
  selectable?: boolean;

  /**
   * Whether to show dividers between items
   */
  dividers?: boolean;
}

/**
 * Menu component props
 */
export interface MenuProps extends BaseProps {
  /**
   * Whether menu is open
   */
  open: boolean;

  /**
   * Close handler
   */
  onClose?: () => void;

  /**
   * Menu placement
   */
  placement?: 'top' | 'right' | 'bottom' | 'left';

  /**
   * Menu offset from anchor
   */
  offset?: number;
}

/**
 * Pagination component props
 */
export interface PaginationProps extends BaseProps, DisableableProps {
  /**
   * Total number of pages
   */
  total: number;

  /**
   * Current page
   */
  current: number;

  /**
   * Change handler
   */
  onChange?: (page: number) => void;

  /**
   * Whether to show first/last buttons
   */
  showFirstLast?: boolean;
}

/**
 * Progress component props
 */
export interface ProgressProps extends BaseProps, ColorableProps {
  /**
   * Progress value (0-100)
   */
  value: number;

  /**
   * Progress variant
   */
  variant?: 'determinate' | 'indeterminate';

  /**
   * Whether to show value label
   */
  label?: boolean;

  /**
   * Value formatter
   */
  valueFormat?: (value: number) => string;
}

/**
 * Radio component props
 */
export interface RadioProps extends BaseProps, DisableableProps, ErrorableProps {
  /**
   * Radio label
   */
  label?: React.ReactNode;

  /**
   * Radio value
   */
  value: string;

  /**
   * Whether radio is checked
   */
  checked?: boolean;

  /**
   * Label position
   */
  labelPosition?: 'left' | 'right';
}

/**
 * Rating component props
 */
export interface RatingProps extends BaseProps, DisableableProps {
  /**
   * Current rating value
   */
  value?: number;

  /**
   * Change handler
   */
  onChange?: (value: number) => void;

  /**
   * Maximum rating value
   */
  max?: number;

  /**
   * Whether to allow half ratings
   */
  allowHalf?: boolean;
}

/**
 * Skeleton component props
 */
export interface SkeletonProps extends BaseProps {
  /**
   * Skeleton variant
   */
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';

  /**
   * Animation type
   */
  animation?: 'pulse' | 'wave' | 'none';

  /**
   * Width of skeleton
   */
  width?: number | string;

  /**
   * Height of skeleton
   */
  height?: number | string;
}

/**
 * Spinner component props
 */
export interface SpinnerProps extends BaseProps, ColorableProps, SizeableProps {
  /**
   * Spinner variant
   */
  variant?: 'border' | 'grow';

  /**
   * Whether to show label
   */
  label?: boolean;
}

/**
 * Stepper component props
 */
export interface StepperProps extends BaseProps {
  /**
   * Active step
   */
  activeStep: number;

  /**
   * Change handler
   */
  onChange?: (step: number) => void;

  /**
   * Stepper orientation
   */
  orientation?: 'horizontal' | 'vertical';

  /**
   * Whether to alternate label alignment
   */
  alternativeLabel?: boolean;
}

/**
 * Tab component props
 */
export interface TabProps extends BaseProps, DisableableProps {
  /**
   * Tab label
   */
  label: React.ReactNode;

  /**
   * Tab value
   */
  value: string;

  /**
   * Tab icon
   */
  icon?: React.ReactNode;
}

/**
 * Tabs component props
 */
export interface TabsProps extends BaseProps, DisableableProps {
  /**
   * Selected value
   */
  value?: string;

  /**
   * Change handler
   */
  onChange?: (value: string) => void;

  /**
   * Tab variant
   */
  variant?: 'standard' | 'contained' | 'pills';

  /**
   * Tab orientation
   */
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Tag component props
 */
export interface TagProps extends BaseProps, ColorableProps {
  /**
   * Tag variant
   */
  variant?: 'solid' | 'outline';

  /**
   * Whether tag is closable
   */
  closable?: boolean;

  /**
   * Close handler
   */
  onClose?: () => void;
}

/**
 * TimePicker component props
 */
export interface TimePickerProps extends BaseProps, ValueProps<string>, DisableableProps {
  /**
   * Time format (12/24 hour)
   */
  format?: '12' | '24';

  /**
   * Time interval in minutes
   */
  interval?: number;

  /**
   * Minimum selectable time
   */
  minTime?: string;

  /**
   * Maximum selectable time
   */
  maxTime?: string;

  /**
   * Whether to show seconds
   */
  showSeconds?: boolean;
}

/**
 * Toggle component props
 */
export interface ToggleProps extends BaseProps, DisableableProps, ErrorableProps {
  /**
   * Toggle label
   */
  label?: React.ReactNode;

  /**
   * Whether toggle is checked
   */
  checked?: boolean;

  /**
   * Label position
   */
  labelPosition?: 'left' | 'right';

  /**
   * Whether to show icons
   */
  icons?: boolean;
}

/**
 * Tooltip component props
 */
export interface TooltipProps extends BaseProps {
  /**
   * Tooltip content
   */
  content: React.ReactNode;

  /**
   * Tooltip position
   */
  position?: 'top' | 'right' | 'bottom' | 'left';

  /**
   * Show delay in ms
   */
  showDelay?: number;

  /**
   * Hide delay in ms
   */
  hideDelay?: number;

  /**
   * Whether to show arrow
   */
  arrow?: boolean;
}

/**
 * TreeView component props
 */
export interface TreeViewProps extends BaseProps {
  /**
   * Tree data
   */
  data: Array<{
    id: string;
    label: React.ReactNode;
    children?: Array<any>;
  }>;

  /**
   * Selected node IDs
   */
  selected?: string[];

  /**
   * Selection change handler
   */
  onSelect?: (ids: string[]) => void;

  /**
   * Whether multiple selection is allowed
   */
  multiSelect?: boolean;
}

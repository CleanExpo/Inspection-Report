import React from 'react';
import { BaseProps } from '../../types/ui';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps extends BaseProps {
  /**
   * The variant of the alert
   */
  variant?: AlertVariant;

  /**
   * The title of the alert
   */
  title?: React.ReactNode;

  /**
   * Whether to show the icon
   */
  icon?: boolean;

  /**
   * Custom icon to display
   */
  customIcon?: React.ReactNode;

  /**
   * Whether the alert is dismissible
   */
  dismissible?: boolean;

  /**
   * Callback when the alert is dismissed
   */
  onDismiss?: () => void;

  /**
   * The action component to display
   */
  action?: React.ReactNode;

  /**
   * Whether the alert is outlined
   */
  outlined?: boolean;

  /**
   * Whether to show a loading state
   */
  loading?: boolean;
}

const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  title,
  icon = true,
  customIcon,
  dismissible = false,
  onDismiss,
  action,
  outlined = false,
  loading = false,
  className = '',
  ...props
}) => {
  const variants = {
    info: {
      base: outlined ? 'border-blue-500' : 'bg-blue-50',
      text: 'text-blue-800',
      icon: 'text-blue-400',
      ring: 'ring-blue-500',
    },
    success: {
      base: outlined ? 'border-green-500' : 'bg-green-50',
      text: 'text-green-800',
      icon: 'text-green-400',
      ring: 'ring-green-500',
    },
    warning: {
      base: outlined ? 'border-yellow-500' : 'bg-yellow-50',
      text: 'text-yellow-800',
      icon: 'text-yellow-400',
      ring: 'ring-yellow-500',
    },
    error: {
      base: outlined ? 'border-red-500' : 'bg-red-50',
      text: 'text-red-800',
      icon: 'text-red-400',
      ring: 'ring-red-500',
    },
  };

  const defaultIcons = {
    info: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
    success: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
  };

  return (
    <div
      className={`
        relative rounded-lg p-4
        ${outlined ? `border-2 ${variants[variant].base}` : variants[variant].base}
        ${variants[variant].text}
        ${className}
      `}
      role="alert"
      {...props}
    >
      <div className="flex">
        {/* Icon */}
        {icon && (
          <div className={`flex-shrink-0 ${variants[variant].icon}`}>
            {customIcon || defaultIcons[variant]}
          </div>
        )}

        {/* Content */}
        <div className={`${icon ? 'ml-3' : ''} flex-1`}>
          {/* Title */}
          {title && (
            <h3 className="text-sm font-medium">
              {title}
            </h3>
          )}

          {/* Message */}
          <div className={`${title ? 'mt-2' : ''} text-sm`}>
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                Loading...
              </div>
            ) : (
              children
            )}
          </div>

          {/* Action */}
          {action && (
            <div className="mt-4">
              {action}
            </div>
          )}
        </div>

        {/* Dismiss button */}
        {dismissible && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className={`
                  inline-flex rounded-md p-1.5
                  ${variants[variant].text}
                  hover:bg-opacity-10
                  hover:bg-current
                  focus:outline-none
                  focus:ring-2
                  focus:ring-offset-2
                  ${variants[variant].ring}
                `}
                onClick={onDismiss}
                aria-label="Dismiss"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;

/**
 * Alert Component Usage Guide:
 * 
 * 1. Basic alert:
 *    <Alert>This is an alert message</Alert>
 * 
 * 2. Different variants:
 *    <Alert variant="info">Info alert</Alert>
 *    <Alert variant="success">Success alert</Alert>
 *    <Alert variant="warning">Warning alert</Alert>
 *    <Alert variant="error">Error alert</Alert>
 * 
 * 3. With title:
 *    <Alert
 *      title="Alert Title"
 *      variant="info"
 *    >
 *      Alert content
 *    </Alert>
 * 
 * 4. Without icon:
 *    <Alert icon={false}>
 *      Alert without icon
 *    </Alert>
 * 
 * 5. Custom icon:
 *    <Alert
 *      customIcon={<CustomIcon />}
 *    >
 *      Alert with custom icon
 *    </Alert>
 * 
 * 6. Dismissible:
 *    <Alert
 *      dismissible
 *      onDismiss={() => console.log('dismissed')}
 *    >
 *      Dismissible alert
 *    </Alert>
 * 
 * 7. With action:
 *    <Alert
 *      action={
 *        <Button size="sm">
 *          Take action
 *        </Button>
 *      }
 *    >
 *      Alert with action
 *    </Alert>
 * 
 * 8. Outlined:
 *    <Alert outlined>
 *      Outlined alert
 *    </Alert>
 * 
 * 9. Loading state:
 *    <Alert loading>
 *      Loading alert
 *    </Alert>
 * 
 * Notes:
 * - Multiple variants
 * - Title support
 * - Icon customization
 * - Dismissible
 * - Action buttons
 * - Outlined style
 * - Loading state
 * - Accessible
 */

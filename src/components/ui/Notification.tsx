import React, { useEffect, useState } from 'react';
import { BaseProps } from '../../types/ui';
import Portal from './Portal';
import Transition from './Transition';

interface NotificationProps extends BaseProps {
  id: string;
  title?: string;
  description?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  position?: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center';
  onClose?: () => void;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

const Notification: React.FC<NotificationProps> = ({
  title,
  description,
  type = 'info',
  duration = 5000,
  position = 'top-right',
  onClose,
  action,
  icon,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const icons = {
    info: (
      <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    success: (
      <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    warning: (
      <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    error: (
      <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  };

  const backgrounds = {
    info: 'bg-blue-50 border-blue-200',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    error: 'bg-red-50 border-red-200',
  };

  const textColors = {
    info: 'text-blue-800',
    success: 'text-green-800',
    warning: 'text-yellow-800',
    error: 'text-red-800',
  };

  return (
    <Transition
      show={isVisible}
      enter="transition-all duration-300"
      enterFrom="opacity-0 scale-95"
      enterTo="opacity-100 scale-100"
      leave="transition-all duration-200"
      leaveFrom="opacity-100 scale-100"
      leaveTo="opacity-0 scale-95"
      afterLeave={onClose}
    >
      <div
        className={`
          flex w-full max-w-sm overflow-hidden rounded-lg border shadow-lg
          ${backgrounds[type]}
          ${className}
        `}
        role="alert"
      >
        {/* Icon */}
        {(icon || icons[type]) && (
          <div className="flex items-center justify-center px-4">
            {icon || icons[type]}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-4">
          {title && (
            <h4 className={`mb-1 font-medium ${textColors[type]}`}>
              {title}
            </h4>
          )}
          {description && (
            <p className={`text-sm ${textColors[type]}`}>
              {description}
            </p>
          )}
          {action && (
            <div className="mt-3">
              {action}
            </div>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className={`
            self-start p-2 opacity-70 hover:opacity-100 transition-opacity
            ${textColors[type]}
          `}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </Transition>
  );
};

interface NotificationContainerProps extends BaseProps {
  position?: NotificationProps['position'];
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({
  position = 'top-right',
  children,
  className = '',
}) => {
  const positions = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0',
    'top-center': 'top-0 left-1/2 -translate-x-1/2',
    'bottom-left': 'bottom-0 left-0',
    'bottom-right': 'bottom-0 right-0',
    'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2',
  };

  return (
    <Portal>
      <div
        className={`
          fixed z-50 p-4 space-y-4 pointer-events-none
          ${positions[position]}
          ${className}
        `}
      >
        {children}
      </div>
    </Portal>
  );
};

export default Notification;

/**
 * Notification Component Usage Guide:
 * 
 * 1. Basic Notification:
 *    <NotificationContainer>
 *      <Notification
 *        title="Success"
 *        description="Operation completed successfully"
 *        type="success"
 *      />
 *    </NotificationContainer>
 * 
 * 2. Different Types:
 *    - info: For general information
 *    - success: For successful operations
 *    - warning: For warnings
 *    - error: For errors
 * 
 * 3. Custom Duration:
 *    - Set duration in milliseconds
 *    - Use 0 for persistent notification
 * 
 * 4. Custom Position:
 *    - top-left
 *    - top-right (default)
 *    - top-center
 *    - bottom-left
 *    - bottom-right
 *    - bottom-center
 * 
 * 5. With Actions:
 *    - Add action buttons
 *    - Handle action clicks
 * 
 * 6. Custom Icons:
 *    - Override default icons
 *    - Add custom icons
 * 
 * 7. Auto Dismiss:
 *    - Automatically closes after duration
 *    - Manual close button
 * 
 * Notes:
 * - Uses Portal for proper stacking
 * - Supports transitions
 * - Accessible
 * - Customizable styling
 */

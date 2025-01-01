import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { BaseProps } from '../../types/ui';

interface ToastProps extends BaseProps {
  id: string;
  title?: string;
  description?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  onClose?: () => void;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

interface ToastContextType {
  addToast: (props: Omit<ToastProps, 'id'>) => string;
  removeToast: (id: string) => void;
  removeAll: () => void;
}

interface ToastProviderProps extends BaseProps {
  position?: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center';
  maxToasts?: number;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const Toast: React.FC<ToastProps> = ({
  title,
  description,
  type = 'info',
  duration = 5000,
  onClose,
  action,
  icon,
  className = '',
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

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
      </div>

      {/* Actions */}
      <div className="flex flex-col justify-between">
        {action && (
          <div className="px-4 py-2">
            {action}
          </div>
        )}
        <button
          onClick={onClose}
          className={`
            p-2 hover:bg-black/5 transition-colors
            ${textColors[type]}
          `}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = 'bottom-right',
  maxToasts = 5,
}) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const positions = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0',
    'top-center': 'top-0 left-1/2 -translate-x-1/2',
    'bottom-left': 'bottom-0 left-0',
    'bottom-right': 'bottom-0 right-0',
    'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2',
  };

  const addToast = useCallback((props: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((currentToasts) => {
      const newToasts = [{ ...props, id }, ...currentToasts];
      return newToasts.slice(0, maxToasts);
    });
    return id;
  }, [maxToasts]);

  const removeToast = useCallback((id: string) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id)
    );
  }, []);

  const removeAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, removeAll }}>
      {children}
      <div
        className={`
          fixed z-50 p-4 space-y-4 pointer-events-none
          ${positions[position]}
        `}
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast {...toast} onClose={() => removeToast(toast.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default Toast;

/**
 * Usage Examples:
 * 
 * Setup:
 * - Wrap app with ToastProvider
 * - Use useToast hook to access toast functions
 * 
 * Basic toast:
 * - toast.addToast({ title: 'Message' })
 * 
 * Different types:
 * - type="info" for information
 * - type="success" for success messages
 * - type="warning" for warnings
 * - type="error" for errors
 * 
 * Custom duration:
 * - Set duration in milliseconds
 * - duration={0} for persistent toast
 * 
 * With actions:
 * - Add action buttons
 * - Handle action clicks
 * 
 * Custom icons:
 * - Override default icons
 * - Add custom icons
 * 
 * Positioning:
 * - Configure toast position
 * - Control max toasts
 * 
 * Toast management:
 * - Remove individual toasts
 * - Clear all toasts
 * 
 * Example usage:
 * 
 * const App = () => {
 *   return (
 *     <ToastProvider position="top-right" maxToasts={3}>
 *       <YourApp />
 *     </ToastProvider>
 *   );
 * };
 * 
 * const Component = () => {
 *   const toast = useToast();
 * 
 *   const showToast = () => {
 *     toast.addToast({
 *       title: 'Success',
 *       description: 'Operation completed',
 *       type: 'success',
 *       duration: 3000,
 *       action: (
 *         <button onClick={handleAction}>
 *           Undo
 *         </button>
 *       ),
 *     });
 *   };
 * 
 *   return <button onClick={showToast}>Show Toast</button>;
 * };
 */

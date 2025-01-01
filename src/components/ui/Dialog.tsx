import React, { useEffect } from 'react';
import { BaseProps } from '../../types/ui';
import Portal from './Portal';

interface DialogProps extends BaseProps {
  /**
   * Whether the dialog is open
   */
  open: boolean;

  /**
   * Callback when the dialog should close
   */
  onClose?: () => void;

  /**
   * The size of the dialog
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';

  /**
   * Whether to show the backdrop
   */
  backdrop?: boolean;

  /**
   * Whether clicking the backdrop closes the dialog
   */
  closeOnBackdropClick?: boolean;

  /**
   * Whether pressing escape closes the dialog
   */
  closeOnEsc?: boolean;

  /**
   * Whether to center the dialog vertically
   */
  centered?: boolean;

  /**
   * Whether to show a close button
   */
  closable?: boolean;

  /**
   * Whether to show a loading state
   */
  loading?: boolean;

  /**
   * Whether to disable scrolling of the page body while dialog is open
   */
  preventScroll?: boolean;

  /**
   * Animation duration in milliseconds
   */
  duration?: number;
}

interface DialogComposition {
  Header: React.FC<BaseProps>;
  Body: React.FC<BaseProps>;
  Footer: React.FC<BaseProps>;
}

const Dialog: React.FC<DialogProps> & DialogComposition = ({
  children,
  open,
  onClose,
  size = 'md',
  backdrop = true,
  closeOnBackdropClick = true,
  closeOnEsc = true,
  centered = true,
  closable = true,
  loading = false,
  preventScroll = true,
  duration = 200,
  className = '',
  ...props
}) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (closeOnEsc && event.key === 'Escape') {
        onClose?.();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, closeOnEsc, onClose]);

  useEffect(() => {
    if (preventScroll) {
      if (open) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open, preventScroll]);

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full m-4',
  };

  if (!open) return null;

  return (
    <Portal>
      <div
        className={`
          fixed inset-0 z-50
          flex ${centered ? 'items-center' : 'items-start'}
          justify-center
          ${backdrop ? 'bg-black bg-opacity-50' : ''}
          transition-opacity duration-${duration}
        `}
        onClick={(e) => {
          if (closeOnBackdropClick && e.target === e.currentTarget) {
            onClose?.();
          }
        }}
        aria-modal="true"
        role="dialog"
      >
        <div
          className={`
            relative bg-white rounded-lg shadow-xl
            w-full ${sizes[size]}
            ${centered ? '' : 'mt-16'}
            transform transition-all duration-${duration}
            ${open ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
            ${className}
          `}
          {...props}
        >
          {/* Close button */}
          {closable && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 focus:outline-none"
              aria-label="Close"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Content */}
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </Portal>
  );
};

const DialogHeader: React.FC<BaseProps> = ({
  children,
  className = '',
  ...props
}) => (
  <div
    className={`px-6 py-4 border-b border-gray-200 ${className}`}
    {...props}
  >
    <h3 className="text-lg font-medium text-gray-900">
      {children}
    </h3>
  </div>
);

const DialogBody: React.FC<BaseProps> = ({
  children,
  className = '',
  ...props
}) => (
  <div
    className={`px-6 py-4 ${className}`}
    {...props}
  >
    {children}
  </div>
);

const DialogFooter: React.FC<BaseProps> = ({
  children,
  className = '',
  ...props
}) => (
  <div
    className={`px-6 py-4 border-t border-gray-200 ${className}`}
    {...props}
  >
    {children}
  </div>
);

Dialog.Header = DialogHeader;
Dialog.Body = DialogBody;
Dialog.Footer = DialogFooter;

export default Dialog;

/**
 * Dialog Component Usage Guide:
 * 
 * 1. Basic dialog:
 *    <Dialog
 *      open={isOpen}
 *      onClose={() => setIsOpen(false)}
 *    >
 *      <Dialog.Header>Title</Dialog.Header>
 *      <Dialog.Body>Content</Dialog.Body>
 *      <Dialog.Footer>
 *        <Button onClick={() => setIsOpen(false)}>Close</Button>
 *      </Dialog.Footer>
 *    </Dialog>
 * 
 * 2. Different sizes:
 *    <Dialog size="sm" />
 *    <Dialog size="md" />
 *    <Dialog size="lg" />
 *    <Dialog size="xl" />
 *    <Dialog size="full" />
 * 
 * 3. Without backdrop:
 *    <Dialog backdrop={false}>
 *      Content
 *    </Dialog>
 * 
 * 4. Without close on backdrop click:
 *    <Dialog closeOnBackdropClick={false}>
 *      Content
 *    </Dialog>
 * 
 * 5. Without close on escape:
 *    <Dialog closeOnEsc={false}>
 *      Content
 *    </Dialog>
 * 
 * 6. Not centered:
 *    <Dialog centered={false}>
 *      Content
 *    </Dialog>
 * 
 * 7. Without close button:
 *    <Dialog closable={false}>
 *      Content
 *    </Dialog>
 * 
 * 8. Loading state:
 *    <Dialog loading>
 *      Content
 *    </Dialog>
 * 
 * 9. Without scroll prevention:
 *    <Dialog preventScroll={false}>
 *      Content
 *    </Dialog>
 * 
 * 10. Custom animation duration:
 *     <Dialog duration={300}>
 *       Content
 *     </Dialog>
 * 
 * Notes:
 * - Multiple sizes
 * - Backdrop customization
 * - Close behavior options
 * - Positioning options
 * - Loading state
 * - Scroll behavior
 * - Animation control
 * - Accessible
 */

import React, { useEffect, useRef } from 'react';
import { BaseProps } from '../../types/ui';
import Portal from './Portal';

interface ModalProps extends BaseProps {
  /**
   * Controls whether the modal is displayed
   */
  open: boolean;

  /**
   * Callback fired when the modal should close
   */
  onClose?: () => void;

  /**
   * The size of the modal
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';

  /**
   * Whether to show the backdrop
   */
  backdrop?: boolean;

  /**
   * Whether clicking the backdrop closes the modal
   */
  closeOnBackdropClick?: boolean;

  /**
   * Whether pressing escape closes the modal
   */
  closeOnEsc?: boolean;

  /**
   * Whether to center the modal vertically
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
   * The title of the modal
   */
  title?: React.ReactNode;

  /**
   * The footer content of the modal
   */
  footer?: React.ReactNode;

  /**
   * Whether to disable scrolling of the page body while modal is open
   */
  preventScroll?: boolean;

  /**
   * Animation duration in milliseconds
   */
  duration?: number;
}

interface ModalComposition {
  Header: React.FC<BaseProps>;
  Body: React.FC<BaseProps>;
  Footer: React.FC<BaseProps>;
}

const Modal: React.FC<ModalProps> & ModalComposition = ({
  open,
  onClose,
  size = 'md',
  backdrop = true,
  closeOnBackdropClick = true,
  closeOnEsc = true,
  centered = true,
  closable = true,
  loading = false,
  title,
  footer,
  preventScroll = true,
  duration = 200,
  children,
  className = '',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

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

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      onClose?.();
    }
  };

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
        onClick={handleBackdropClick}
        aria-modal="true"
        role="dialog"
      >
        <div
          ref={modalRef}
          className={`
            relative bg-white rounded-lg shadow-xl
            w-full ${sizes[size]}
            ${centered ? '' : 'mt-16'}
            transform transition-all duration-${duration}
            ${open ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
            ${className}
          `}
        >
          {/* Close button */}
          {closable && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
              aria-label="Close"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Title */}
          {title && (
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            </div>
          )}

          {/* Content */}
          <div className="px-6 py-4">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              children
            )}
          </div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-gray-200">
              {footer}
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
};

const ModalHeader: React.FC<BaseProps> = ({
  children,
  className = '',
}) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
    <h3 className="text-lg font-medium text-gray-900">{children}</h3>
  </div>
);

const ModalBody: React.FC<BaseProps> = ({
  children,
  className = '',
}) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

const ModalFooter: React.FC<BaseProps> = ({
  children,
  className = '',
}) => (
  <div className={`px-6 py-4 border-t border-gray-200 ${className}`}>
    {children}
  </div>
);

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export default Modal;

/**
 * Modal Component Usage Guide:
 * 
 * 1. Basic modal:
 *    <Modal
 *      open={isOpen}
 *      onClose={() => setIsOpen(false)}
 *      title="Modal Title"
 *    >
 *      Modal content
 *    </Modal>
 * 
 * 2. Different sizes:
 *    <Modal size="sm">Small modal</Modal>
 *    <Modal size="md">Medium modal</Modal>
 *    <Modal size="lg">Large modal</Modal>
 *    <Modal size="xl">Extra large modal</Modal>
 *    <Modal size="full">Full screen modal</Modal>
 * 
 * 3. With footer:
 *    <Modal
 *      open={isOpen}
 *      onClose={() => setIsOpen(false)}
 *      footer={
 *        <div className="flex justify-end space-x-2">
 *          <Button onClick={() => setIsOpen(false)}>Cancel</Button>
 *          <Button variant="primary">Save</Button>
 *        </div>
 *      }
 *    >
 *      Modal content
 *    </Modal>
 * 
 * 4. Loading state:
 *    <Modal loading>
 *      This content will be replaced with a loading spinner
 *    </Modal>
 * 
 * 5. Using composition:
 *    <Modal open={isOpen} onClose={() => setIsOpen(false)}>
 *      <Modal.Header>Title</Modal.Header>
 *      <Modal.Body>Content</Modal.Body>
 *      <Modal.Footer>
 *        <Button onClick={() => setIsOpen(false)}>Close</Button>
 *      </Modal.Footer>
 *    </Modal>
 * 
 * 6. Without backdrop:
 *    <Modal backdrop={false}>
 *      Modal without backdrop
 *    </Modal>
 * 
 * 7. Custom animation duration:
 *    <Modal duration={300}>
 *      Modal with slower animation
 *    </Modal>
 * 
 * Notes:
 * - Uses Portal for rendering
 * - Multiple sizes
 * - Loading state
 * - Customizable backdrop
 * - Animation support
 * - Keyboard support
 * - Scroll lock
 * - Accessible
 */

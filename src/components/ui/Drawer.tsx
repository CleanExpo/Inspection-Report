import React, { useEffect } from 'react';
import { BaseProps } from '../../types/ui';
import Portal from './Portal';

interface DrawerProps extends BaseProps {
  /**
   * Whether the drawer is open
   */
  open: boolean;

  /**
   * Callback when the drawer should close
   */
  onClose?: () => void;

  /**
   * The position of the drawer
   */
  position?: 'left' | 'right' | 'top' | 'bottom';

  /**
   * The size of the drawer (width for left/right, height for top/bottom)
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';

  /**
   * Whether to show the backdrop
   */
  backdrop?: boolean;

  /**
   * Whether clicking the backdrop closes the drawer
   */
  closeOnBackdropClick?: boolean;

  /**
   * Whether pressing escape closes the drawer
   */
  closeOnEsc?: boolean;

  /**
   * Whether to show a close button
   */
  closable?: boolean;

  /**
   * Whether to show a loading state
   */
  loading?: boolean;

  /**
   * Whether to disable scrolling of the page body while drawer is open
   */
  preventScroll?: boolean;

  /**
   * Animation duration in milliseconds
   */
  duration?: number;
}

interface DrawerComposition {
  Header: React.FC<BaseProps>;
  Body: React.FC<BaseProps>;
  Footer: React.FC<BaseProps>;
}

const Drawer: React.FC<DrawerProps> & DrawerComposition = ({
  children,
  open,
  onClose,
  position = 'right',
  size = 'md',
  backdrop = true,
  closeOnBackdropClick = true,
  closeOnEsc = true,
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
    sm: position === 'left' || position === 'right' ? 'w-72' : 'h-72',
    md: position === 'left' || position === 'right' ? 'w-96' : 'h-96',
    lg: position === 'left' || position === 'right' ? 'w-120' : 'h-120',
    xl: position === 'left' || position === 'right' ? 'w-144' : 'h-144',
    full: position === 'left' || position === 'right' ? 'w-screen' : 'h-screen',
  };

  const positions = {
    left: 'left-0 h-full',
    right: 'right-0 h-full',
    top: 'top-0 w-full',
    bottom: 'bottom-0 w-full',
  };

  const transforms = {
    left: 'transform -translate-x-full',
    right: 'transform translate-x-full',
    top: 'transform -translate-y-full',
    bottom: 'transform translate-y-full',
  };

  if (!open) return null;

  return (
    <Portal>
      <div
        className={`
          fixed inset-0 z-50
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
            fixed ${positions[position]}
            bg-white shadow-xl
            ${sizes[size]}
            transition-transform duration-${duration}
            ${open ? 'transform-none' : transforms[position]}
            ${className}
          `}
          {...props}
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

          {/* Content */}
          <div className="flex flex-col h-full">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
              </div>
            ) : (
              children
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
};

const DrawerHeader: React.FC<BaseProps> = ({
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

const DrawerBody: React.FC<BaseProps> = ({
  children,
  className = '',
  ...props
}) => (
  <div
    className={`flex-1 overflow-y-auto px-6 py-4 ${className}`}
    {...props}
  >
    {children}
  </div>
);

const DrawerFooter: React.FC<BaseProps> = ({
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

Drawer.Header = DrawerHeader;
Drawer.Body = DrawerBody;
Drawer.Footer = DrawerFooter;

export default Drawer;

/**
 * Drawer Component Usage Guide:
 * 
 * 1. Basic drawer:
 *    <Drawer
 *      open={isOpen}
 *      onClose={() => setIsOpen(false)}
 *    >
 *      <Drawer.Header>Title</Drawer.Header>
 *      <Drawer.Body>Content</Drawer.Body>
 *      <Drawer.Footer>
 *        <Button onClick={() => setIsOpen(false)}>Close</Button>
 *      </Drawer.Footer>
 *    </Drawer>
 * 
 * 2. Different positions:
 *    <Drawer position="left" />
 *    <Drawer position="right" />
 *    <Drawer position="top" />
 *    <Drawer position="bottom" />
 * 
 * 3. Different sizes:
 *    <Drawer size="sm" />
 *    <Drawer size="md" />
 *    <Drawer size="lg" />
 *    <Drawer size="xl" />
 *    <Drawer size="full" />
 * 
 * 4. Without backdrop:
 *    <Drawer backdrop={false} />
 * 
 * 5. Without close on backdrop click:
 *    <Drawer closeOnBackdropClick={false} />
 * 
 * 6. Without close on escape:
 *    <Drawer closeOnEsc={false} />
 * 
 * 7. Without close button:
 *    <Drawer closable={false} />
 * 
 * 8. Loading state:
 *    <Drawer loading />
 * 
 * 9. Without scroll prevention:
 *    <Drawer preventScroll={false} />
 * 
 * 10. Custom animation duration:
 *     <Drawer duration={300} />
 * 
 * Notes:
 * - Multiple positions
 * - Different sizes
 * - Backdrop customization
 * - Close behavior options
 * - Loading state
 * - Scroll behavior
 * - Animation control
 * - Accessible
 */

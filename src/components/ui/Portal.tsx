import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { PortalProps } from '../../types/ui';

/**
 * Portal component for rendering content outside the current DOM hierarchy.
 * Useful for modals, dropdowns, tooltips, etc. that need to break out of
 * their parent's stacking context or overflow constraints.
 */
const Portal: React.FC<PortalProps> = ({
  children,
  container,
  disabled = false,
  onMount,
  onUnmount,
  className = '',
  ...props
}) => {
  const [mountNode, setMountNode] = useState<Element | null>(null);

  useEffect(() => {
    if (disabled) {
      return;
    }

    const defaultNode = container || document.body;
    setMountNode(defaultNode);
    onMount?.();

    return () => {
      onUnmount?.();
    };
  }, [container, disabled, onMount, onUnmount]);

  if (disabled || !mountNode) {
    return <>{children}</>;
  }

  return createPortal(
    <div className={className} {...props}>
      {children}
    </div>,
    mountNode
  );
};

export default Portal;

/**
 * Portal Component Usage Guide:
 * 
 * 1. Basic portal:
 *    <Portal>
 *      <div>This content will be rendered at the end of document.body</div>
 *    </Portal>
 * 
 * 2. Custom container:
 *    <Portal container={document.getElementById('modal-root')}>
 *      <div>This content will be rendered in the specified container</div>
 *    </Portal>
 * 
 * 3. Disabled portal:
 *    <Portal disabled>
 *      <div>This content will be rendered in place</div>
 *    </Portal>
 * 
 * 4. With mount callbacks:
 *    <Portal
 *      onMount={() => console.log('Portal mounted')}
 *      onUnmount={() => console.log('Portal unmounted')}
 *    >
 *      <div>Portal content</div>
 *    </Portal>
 * 
 * 5. Modal example:
 *    <Portal>
 *      <div className="fixed inset-0 bg-black bg-opacity-50">
 *        <div className="modal">
 *          Modal content
 *        </div>
 *      </div>
 *    </Portal>
 * 
 * 6. Dropdown example:
 *    <Portal>
 *      <div
 *        style={{
 *          position: 'absolute',
 *          top: buttonRect.bottom,
 *          left: buttonRect.left,
 *        }}
 *      >
 *        Dropdown content
 *      </div>
 *    </Portal>
 * 
 * 7. Tooltip example:
 *    <Portal>
 *      <div
 *        style={{
 *          position: 'absolute',
 *          top: elementRect.top,
 *          left: elementRect.right,
 *        }}
 *      >
 *        Tooltip content
 *      </div>
 *    </Portal>
 * 
 * Notes:
 * - Renders content outside current DOM hierarchy
 * - Useful for modals, dropdowns, tooltips
 * - Custom container support
 * - Mount/unmount callbacks
 * - Can be disabled
 * - Preserves event bubbling
 * - Maintains React context
 */

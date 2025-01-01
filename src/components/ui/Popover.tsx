import React, { useState, useRef, useEffect } from 'react';
import { BaseProps } from '../../types/ui';
import Portal from './Portal';

interface PopoverProps extends BaseProps {
  /**
   * The trigger element
   */
  trigger: React.ReactElement;

  /**
   * The position of the popover relative to the trigger
   */
  position?: 'top' | 'right' | 'bottom' | 'left';

  /**
   * The alignment of the popover
   */
  align?: 'start' | 'center' | 'end';

  /**
   * The trigger behavior
   */
  triggerType?: 'click' | 'hover';

  /**
   * The offset from the trigger element in pixels
   */
  offset?: number;

  /**
   * Whether the popover is open
   */
  open?: boolean;

  /**
   * Callback fired when the popover should close
   */
  onClose?: () => void;

  /**
   * Whether to show an arrow
   */
  arrow?: boolean;

  /**
   * Whether the popover is interactive (can receive hover/click events)
   */
  interactive?: boolean;

  /**
   * Delay before showing/hiding the popover (in ms)
   */
  delay?: number;

  /**
   * Animation duration in milliseconds
   */
  duration?: number;
}

const Popover: React.FC<PopoverProps> = ({
  children,
  trigger: triggerElement,
  position = 'bottom',
  align = 'center',
  triggerType = 'click',
  offset = 8,
  open: controlledOpen,
  onClose,
  arrow = true,
  interactive = true,
  delay = 200,
  duration = 200,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const open = controlledOpen !== undefined ? controlledOpen : isOpen;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const calculatePosition = () => {
    if (!triggerRef.current || !popoverRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const popoverRect = popoverRef.current.getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = triggerRect.top + scrollY - popoverRect.height - offset;
        break;
      case 'bottom':
        top = triggerRect.bottom + scrollY + offset;
        break;
      case 'left':
        left = triggerRect.left + scrollX - popoverRect.width - offset;
        top = triggerRect.top + scrollY;
        break;
      case 'right':
        left = triggerRect.right + scrollX + offset;
        top = triggerRect.top + scrollY;
        break;
    }

    // Horizontal alignment
    if (position === 'top' || position === 'bottom') {
      switch (align) {
        case 'start':
          left = triggerRect.left + scrollX;
          break;
        case 'center':
          left = triggerRect.left + scrollX + (triggerRect.width - popoverRect.width) / 2;
          break;
        case 'end':
          left = triggerRect.right + scrollX - popoverRect.width;
          break;
      }
    }

    // Vertical alignment
    if (position === 'left' || position === 'right') {
      switch (align) {
        case 'start':
          top = triggerRect.top + scrollY;
          break;
        case 'center':
          top = triggerRect.top + scrollY + (triggerRect.height - popoverRect.height) / 2;
          break;
        case 'end':
          top = triggerRect.bottom + scrollY - popoverRect.height;
          break;
      }
    }

    // Keep within viewport
    const padding = 8;
    const viewportWidth = window.innerWidth - padding;
    const viewportHeight = window.innerHeight - padding;

    // Adjust horizontal position
    if (left < padding) {
      left = padding;
    } else if (left + popoverRect.width > viewportWidth) {
      left = viewportWidth - popoverRect.width;
    }

    // Adjust vertical position
    if (top < padding) {
      top = padding;
    } else if (top + popoverRect.height > viewportHeight) {
      top = viewportHeight - popoverRect.height;
    }

    setCoords({ top, left });
  };

  const handleOpen = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, delay);
  };

  const handleClose = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      onClose?.();
    }, delay);
  };

  useEffect(() => {
    if (open) {
      calculatePosition();
      window.addEventListener('scroll', calculatePosition);
      window.addEventListener('resize', calculatePosition);
    }

    return () => {
      window.removeEventListener('scroll', calculatePosition);
      window.removeEventListener('resize', calculatePosition);
    };
  }, [open]);

  const triggerProps = {
    ref: triggerRef,
    ...(triggerType === 'click'
      ? {
          onClick: () => (open ? handleClose() : handleOpen()),
        }
      : {
          onMouseEnter: handleOpen,
          onMouseLeave: handleClose,
        }),
  };

  const popoverProps = {
    ...(triggerType === 'hover' && interactive
      ? {
          onMouseEnter: handleOpen,
          onMouseLeave: handleClose,
        }
      : {}),
  };

  const arrowSize = 8;

  const getArrowStyle = () => {
    switch (position) {
      case 'top':
        return {
          bottom: -arrowSize,
          transform: 'rotate(45deg)',
        };
      case 'bottom':
        return {
          top: -arrowSize,
          transform: 'rotate(225deg)',
        };
      case 'left':
        return {
          right: -arrowSize,
          transform: 'rotate(135deg)',
        };
      case 'right':
        return {
          left: -arrowSize,
          transform: 'rotate(315deg)',
        };
    }
  };

  return (
    <>
      {React.cloneElement(triggerElement, triggerProps)}
      {open && (
        <Portal>
          <div
            ref={popoverRef}
            style={{
              position: 'absolute',
              top: coords.top,
              left: coords.left,
            }}
            className={`
              z-50
              ${className}
            `}
            {...popoverProps}
          >
            <div
              className={`
                bg-white rounded-lg shadow-lg
                transition-opacity duration-${duration}
                ${open ? 'opacity-100' : 'opacity-0'}
              `}
            >
              {arrow && (
                <div
                  className="absolute w-2 h-2 bg-white transform rotate-45"
                  style={{
                    ...getArrowStyle(),
                    ...(align === 'start'
                      ? { left: '1rem' }
                      : align === 'end'
                      ? { right: '1rem' }
                      : { left: '50%', marginLeft: '-0.25rem' }),
                  }}
                />
              )}
              <div className="relative">{children}</div>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
};

export default Popover;

/**
 * Popover Component Usage Guide:
 * 
 * 1. Basic popover:
 *    <Popover
 *      trigger={<Button>Click me</Button>}
 *    >
 *      Popover content
 *    </Popover>
 * 
 * 2. Different positions:
 *    <Popover position="top">Top popover</Popover>
 *    <Popover position="right">Right popover</Popover>
 *    <Popover position="bottom">Bottom popover</Popover>
 *    <Popover position="left">Left popover</Popover>
 * 
 * 3. Different alignments:
 *    <Popover align="start">Start aligned</Popover>
 *    <Popover align="center">Center aligned</Popover>
 *    <Popover align="end">End aligned</Popover>
 * 
 * 4. Hover trigger:
 *    <Popover
 *      triggerType="hover"
 *      delay={200}
 *    >
 *      Hover popover
 *    </Popover>
 * 
 * 5. Without arrow:
 *    <Popover arrow={false}>
 *      No arrow
 *    </Popover>
 * 
 * 6. Interactive content:
 *    <Popover interactive>
 *      <Button onClick={() => console.log('Clicked')}>
 *        Click me
 *      </Button>
 *    </Popover>
 * 
 * 7. Controlled:
 *    <Popover
 *      open={isOpen}
 *      onClose={() => setIsOpen(false)}
 *    >
 *      Controlled popover
 *    </Popover>
 * 
 * Notes:
 * - Uses Portal for rendering
 * - Multiple positions
 * - Multiple alignments
 * - Click/hover triggers
 * - Arrow customization
 * - Interactive content
 * - Animation support
 * - Viewport awareness
 * - Accessible
 */

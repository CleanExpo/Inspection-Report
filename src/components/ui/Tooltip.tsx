import React, { useState, useRef, useEffect } from 'react';
import { BaseProps } from '../../types/ui';
import Portal from './Portal';

interface TooltipProps extends BaseProps {
  /**
   * The content to display in the tooltip
   */
  content: React.ReactNode;

  /**
   * The element that triggers the tooltip
   */
  children: React.ReactElement;

  /**
   * The position of the tooltip
   */
  position?: 'top' | 'right' | 'bottom' | 'left';

  /**
   * The alignment of the tooltip
   */
  align?: 'start' | 'center' | 'end';

  /**
   * The delay before showing/hiding the tooltip (in ms)
   */
  delay?: number;

  /**
   * Whether to show an arrow
   */
  arrow?: boolean;

  /**
   * The color variant of the tooltip
   */
  variant?: 'light' | 'dark' | 'custom';

  /**
   * The maximum width of the tooltip
   */
  maxWidth?: number | string;

  /**
   * Whether the tooltip is disabled
   */
  disabled?: boolean;

  /**
   * Whether to show the tooltip
   */
  visible?: boolean;

  /**
   * Callback when visibility changes
   */
  onVisibleChange?: (visible: boolean) => void;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  align = 'center',
  delay = 200,
  arrow = true,
  variant = 'dark',
  maxWidth = 200,
  disabled = false,
  visible: controlledVisible,
  onVisibleChange,
  className = '',
}) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const isVisible = controlledVisible !== undefined ? controlledVisible : visible;

  const variants = {
    light: 'bg-white text-gray-900 border border-gray-200 shadow-sm',
    dark: 'bg-gray-900 text-white',
    custom: '',
  };

  const handleShow = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setVisible(true);
      onVisibleChange?.(true);
    }, delay);
  };

  const handleHide = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setVisible(false);
      onVisibleChange?.(false);
    }, delay);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = triggerRect.top + scrollY - tooltipRect.height - 8;
        break;
      case 'bottom':
        top = triggerRect.bottom + scrollY + 8;
        break;
      case 'left':
        left = triggerRect.left + scrollX - tooltipRect.width - 8;
        top = triggerRect.top + scrollY;
        break;
      case 'right':
        left = triggerRect.right + scrollX + 8;
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
          left = triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2;
          break;
        case 'end':
          left = triggerRect.right + scrollX - tooltipRect.width;
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
          top = triggerRect.top + scrollY + (triggerRect.height - tooltipRect.height) / 2;
          break;
        case 'end':
          top = triggerRect.bottom + scrollY - tooltipRect.height;
          break;
      }
    }

    // Keep within viewport
    const padding = 8;
    const viewportWidth = window.innerWidth - padding;
    const viewportHeight = window.innerHeight - padding;

    if (left < padding) {
      left = padding;
    } else if (left + tooltipRect.width > viewportWidth) {
      left = viewportWidth - tooltipRect.width;
    }

    if (top < padding) {
      top = padding;
    } else if (top + tooltipRect.height > viewportHeight) {
      top = viewportHeight - tooltipRect.height;
    }

    setCoords({ top, left });
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
      window.addEventListener('scroll', calculatePosition);
      window.addEventListener('resize', calculatePosition);
    }

    return () => {
      window.removeEventListener('scroll', calculatePosition);
      window.removeEventListener('resize', calculatePosition);
    };
  }, [isVisible]);

  if (disabled) {
    return children;
  }

  const arrowSize = 6;
  const arrowOffset = arrow ? arrowSize : 0;

  const getArrowStyle = () => {
    const baseStyle = {
      borderWidth: arrowSize,
      position: 'absolute' as const,
    };

    switch (position) {
      case 'top':
        return {
          ...baseStyle,
          bottom: -arrowSize * 2,
          borderColor: `${variant === 'light' ? '#e5e7eb' : '#111827'} transparent transparent transparent`,
        };
      case 'bottom':
        return {
          ...baseStyle,
          top: -arrowSize * 2,
          borderColor: `transparent transparent ${variant === 'light' ? '#e5e7eb' : '#111827'} transparent`,
        };
      case 'left':
        return {
          ...baseStyle,
          right: -arrowSize * 2,
          borderColor: `transparent transparent transparent ${variant === 'light' ? '#e5e7eb' : '#111827'}`,
        };
      case 'right':
        return {
          ...baseStyle,
          left: -arrowSize * 2,
          borderColor: `transparent ${variant === 'light' ? '#e5e7eb' : '#111827'} transparent transparent`,
        };
    }
  };

  return (
    <>
      {React.cloneElement(children, {
        ref: triggerRef,
        onMouseEnter: handleShow,
        onMouseLeave: handleHide,
        onFocus: handleShow,
        onBlur: handleHide,
      })}
      {isVisible && (
        <Portal>
          <div
            ref={tooltipRef}
            style={{
              position: 'absolute',
              top: coords.top,
              left: coords.left,
              maxWidth,
            }}
            className={`
              z-50
              rounded-md
              py-1
              px-2
              text-sm
              ${variants[variant]}
              ${className}
            `}
            role="tooltip"
          >
            {arrow && (
              <div
                className="absolute w-0 h-0"
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
            {content}
          </div>
        </Portal>
      )}
    </>
  );
};

export default Tooltip;

/**
 * Tooltip Component Usage Guide:
 * 
 * 1. Basic tooltip:
 *    <Tooltip content="Helpful information">
 *      <Button>Hover me</Button>
 *    </Tooltip>
 * 
 * 2. Different positions:
 *    <Tooltip position="top" content="Top tooltip" />
 *    <Tooltip position="right" content="Right tooltip" />
 *    <Tooltip position="bottom" content="Bottom tooltip" />
 *    <Tooltip position="left" content="Left tooltip" />
 * 
 * 3. Different alignments:
 *    <Tooltip align="start" content="Start aligned" />
 *    <Tooltip align="center" content="Center aligned" />
 *    <Tooltip align="end" content="End aligned" />
 * 
 * 4. Different variants:
 *    <Tooltip variant="light" content="Light tooltip" />
 *    <Tooltip variant="dark" content="Dark tooltip" />
 * 
 * 5. Without arrow:
 *    <Tooltip
 *      arrow={false}
 *      content="No arrow"
 *    />
 * 
 * 6. Custom delay:
 *    <Tooltip
 *      delay={500}
 *      content="Delayed tooltip"
 *    />
 * 
 * 7. Custom max width:
 *    <Tooltip
 *      maxWidth={300}
 *      content="This is a tooltip with a longer description that will wrap to multiple lines when it exceeds the maximum width."
 *    />
 * 
 * 8. Disabled:
 *    <Tooltip
 *      disabled
 *      content="This tooltip won't show"
 *    />
 * 
 * 9. Controlled:
 *    <Tooltip
 *      visible={isVisible}
 *      onVisibleChange={setIsVisible}
 *      content="Controlled tooltip"
 *    />
 * 
 * Notes:
 * - Multiple positions
 * - Different alignments
 * - Light/dark variants
 * - Arrow customization
 * - Delay control
 * - Max width
 * - Disabled state
 * - Controlled mode
 * - Accessible
 */

import React, { useEffect, useState, useRef } from 'react';
import { BaseProps } from '../../types/ui';

interface TransitionProps extends BaseProps {
  show?: boolean;
  enter?: string;
  enterFrom?: string;
  enterTo?: string;
  leave?: string;
  leaveFrom?: string;
  leaveTo?: string;
  beforeEnter?: () => void;
  afterEnter?: () => void;
  beforeLeave?: () => void;
  afterLeave?: () => void;
  appear?: boolean;
  duration?: number;
  unmount?: boolean;
}

const Transition: React.FC<TransitionProps> = ({
  children,
  show = true,
  enter = '',
  enterFrom = '',
  enterTo = '',
  leave = '',
  leaveFrom = '',
  leaveTo = '',
  beforeEnter,
  afterEnter,
  beforeLeave,
  afterLeave,
  appear = false,
  duration = 150,
  unmount = true,
  className = '',
}) => {
  const [isShowing, setIsShowing] = useState(show);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [shouldRender, setShouldRender] = useState(show || !unmount);
  
  const initialRender = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      if (appear && show) {
        startTransition(true);
      }
      return;
    }

    if (show !== isShowing) {
      setIsShowing(show);
      startTransition(show);
    }
  }, [show]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const startTransition = (isEntering: boolean) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (isEntering && !shouldRender) {
      setShouldRender(true);
    }

    setIsTransitioning(true);

    if (isEntering) {
      beforeEnter?.();
    } else {
      beforeLeave?.();
    }

    // Wait for next frame to ensure CSS transitions work
    requestAnimationFrame(() => {
      if (!document.hidden) {
        timeoutRef.current = setTimeout(() => {
          setIsTransitioning(false);
          if (!isEntering && unmount) {
            setShouldRender(false);
          }
          if (isEntering) {
            afterEnter?.();
          } else {
            afterLeave?.();
          }
        }, duration);
      }
    });
  };

  if (!shouldRender) {
    return null;
  }

  const transitionClasses = [
    className,
    isTransitioning && isShowing ? enter : '',
    isTransitioning && isShowing ? enterFrom : '',
    isTransitioning && !isShowing ? leave : '',
    isTransitioning && !isShowing ? leaveFrom : '',
    !isTransitioning && isShowing ? enterTo : '',
    !isTransitioning && !isShowing ? leaveTo : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={transitionClasses} style={{ transitionDuration: `${duration}ms` }}>
      {children}
    </div>
  );
};

export default Transition;

/**
 * Transition Component Usage Guide:
 * 
 * 1. Basic Fade Transition:
 *    <Transition
 *      show={isVisible}
 *      enter="transition-opacity duration-150"
 *      enterFrom="opacity-0"
 *      enterTo="opacity-100"
 *      leave="transition-opacity duration-150"
 *      leaveFrom="opacity-100"
 *      leaveTo="opacity-0"
 *    >
 *      <div>Fade content</div>
 *    </Transition>
 * 
 * 2. Slide Transition:
 *    <Transition
 *      show={isOpen}
 *      enter="transition-transform duration-200"
 *      enterFrom="-translate-x-full"
 *      enterTo="translate-x-0"
 *      leave="transition-transform duration-200"
 *      leaveFrom="translate-x-0"
 *      leaveTo="-translate-x-full"
 *    >
 *      <div>Slide content</div>
 *    </Transition>
 * 
 * 3. Scale Transition:
 *    <Transition
 *      show={isVisible}
 *      enter="transition-all duration-200"
 *      enterFrom="scale-95 opacity-0"
 *      enterTo="scale-100 opacity-100"
 *      leave="transition-all duration-200"
 *      leaveFrom="scale-100 opacity-100"
 *      leaveTo="scale-95 opacity-0"
 *    >
 *      <div>Scale content</div>
 *    </Transition>
 * 
 * 4. With Lifecycle Hooks:
 *    <Transition
 *      show={isVisible}
 *      beforeEnter={() => console.log('Before enter')}
 *      afterEnter={() => console.log('After enter')}
 *      beforeLeave={() => console.log('Before leave')}
 *      afterLeave={() => console.log('After leave')}
 *      enter="transition-opacity"
 *      enterFrom="opacity-0"
 *      enterTo="opacity-100"
 *      leave="transition-opacity"
 *      leaveFrom="opacity-100"
 *      leaveTo="opacity-0"
 *    >
 *      <div>Content with hooks</div>
 *    </Transition>
 * 
 * 5. Custom Duration:
 *    <Transition
 *      show={isVisible}
 *      duration={300}
 *      enter="transition-all"
 *      enterFrom="opacity-0 scale-95"
 *      enterTo="opacity-100 scale-100"
 *      leave="transition-all"
 *      leaveFrom="opacity-100 scale-100"
 *      leaveTo="opacity-0 scale-95"
 *    >
 *      <div>Slower transition</div>
 *    </Transition>
 * 
 * 6. Initial Animation (Appear):
 *    <Transition
 *      appear
 *      show={true}
 *      enter="transition-opacity"
 *      enterFrom="opacity-0"
 *      enterTo="opacity-100"
 *    >
 *      <div>Animate on mount</div>
 *    </Transition>
 * 
 * Notes:
 * - Uses Tailwind CSS classes for transitions
 * - Supports enter/leave animations
 * - Handles mounting/unmounting
 * - Provides lifecycle hooks
 * - Customizable durations
 * - Initial animation support
 */

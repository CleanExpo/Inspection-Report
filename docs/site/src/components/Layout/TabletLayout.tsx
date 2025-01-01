import React, { useRef } from 'react';
import { useTouchInteraction } from '../../hooks/useTouchInteraction';
import './TabletLayout.css';

interface TabletLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
}

export function TabletLayout({ children, sidebar, header }: TabletLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  const { scale, resetScale } = useTouchInteraction(mainRef, {
    swipeThreshold: 100,
    minSwipeDistance: 50,
  });

  // Handle swipe gestures
  React.useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const handleSwipe = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail.direction === 'left' && !isSidebarCollapsed) {
        setIsSidebarCollapsed(true);
      } else if (customEvent.detail.direction === 'right' && isSidebarCollapsed) {
        setIsSidebarCollapsed(false);
      }
    };

    content.addEventListener('swipe', handleSwipe);
    return () => content.removeEventListener('swipe', handleSwipe);
  }, [isSidebarCollapsed]);

  // Handle double tap to reset zoom
  React.useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    const handleDoubleTap = () => {
      resetScale();
    };

    main.addEventListener('doubletap', handleDoubleTap);
    return () => main.removeEventListener('doubletap', handleDoubleTap);
  }, [resetScale]);

  // Handle orientation change
  React.useEffect(() => {
    const handleOrientationChange = () => {
      // Default to expanded in landscape, collapsed in portrait
      setIsSidebarCollapsed(window.orientation === 0);
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    // Initial check
    handleOrientationChange();

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return (
    <div className={`tablet-layout ${isSidebarCollapsed ? 'collapsed' : ''}`}>
      {header && <div className="tablet-header">{header}</div>}
      <div ref={contentRef} className="tablet-content">
        {sidebar && (
          <div className="tablet-sidebar">
            <button
              className="tablet-sidebar-toggle"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-expanded={!isSidebarCollapsed}
            >
              <svg
                className="tablet-toggle-icon"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {isSidebarCollapsed ? (
                  <path d="M9 18l6-6-6-6" />
                ) : (
                  <path d="M15 18l-6-6 6-6" />
                )}
              </svg>
            </button>
            {sidebar}
          </div>
        )}
        <main 
          ref={mainRef} 
          className="tablet-main"
          style={{ 
            transform: `scale(${scale})`,
            transformOrigin: 'center top'
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

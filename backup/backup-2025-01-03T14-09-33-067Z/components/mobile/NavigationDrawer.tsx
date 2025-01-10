import React, { useEffect, useState } from 'react';
import { useSwipeGesture, mobileNavigation } from '../../utils/mobileUtils';

interface NavItem {
  label: string;
  route: string;
  icon?: React.ReactNode;
}

interface NavigationDrawerProps {
  items: NavItem[];
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  items,
  header,
  footer,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState('/');

  useEffect(() => {
    const unsubscribe = mobileNavigation.subscribe((state) => {
      setIsOpen(state.isDrawerOpen);
      setActiveRoute(state.activeRoute);
    });
    return unsubscribe;
  }, []);

  const { handleTouchStart, handleTouchEnd } = useSwipeGesture({
    onSwipeRight: () => !isOpen && mobileNavigation.toggleDrawer(),
    onSwipeLeft: () => isOpen && mobileNavigation.toggleDrawer(),
  });

  const handleNavigation = (route: string) => {
    mobileNavigation.setRoute(route);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={() => mobileNavigation.toggleDrawer()}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header */}
        {header && (
          <div className="p-4 border-b border-gray-200">{header}</div>
        )}

        {/* Navigation Items */}
        <nav className="py-4">
          {items.map((item) => (
            <button
              key={item.route}
              onClick={() => handleNavigation(item.route)}
              className={`w-full px-6 py-3 flex items-center space-x-3 text-left transition-colors ${
                activeRoute === item.route
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {item.icon && <span className="w-6 h-6">{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        {footer && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
            {footer}
          </div>
        )}
      </div>
    </>
  );
};

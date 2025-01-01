import React from 'react';
import { LayoutProps } from '../../types/ui';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { theme } from '../../styles/theme';

const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  description,
  showHeader = true,
  showFooter = true,
  showSidebar = true,
  className = '',
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-background">
      {showHeader && (
        <Header 
          title={title} 
          onMenuClick={toggleSidebar}
        />
      )}

      <div className="flex min-h-[calc(100vh-4rem)]">
        {showSidebar && (
          <Sidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)}
          />
        )}

        <main className={`flex-1 p-6 ${className}`}>
          {children}
        </main>
      </div>

      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;

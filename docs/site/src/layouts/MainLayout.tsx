'use client';

import React, { useState } from 'react';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { useTheme } from '../components/ThemeProvider';
import SideNav from '../components/SideNav';

const inter = Inter({ subsets: ['latin'] });

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={`min-h-screen bg-white dark:bg-gray-900 ${inter.className}`}>
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link 
              href="/" 
              className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
            >
              Inspection Report Docs
            </Link>
            
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              <svg
                className="h-6 w-6 text-gray-600 dark:text-gray-300"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Toggle dark mode"
              >
                <svg
                  className="h-6 w-6 text-gray-600 dark:text-gray-300"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {theme === 'dark' ? (
                    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  ) : (
                    <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  )}
                </svg>
              </button>
              <Link 
                href="/docs" 
                className="doc-nav-link"
              >
                Home
              </Link>
              <Link 
                href="/docs/api" 
                className="doc-nav-link"
              >
                API
              </Link>
              <Link 
                href="/docs/components" 
                className="doc-nav-link"
              >
                Components
              </Link>
              <Link 
                href="/docs/guides" 
                className="doc-nav-link"
              >
                Guides
              </Link>
            </div>
          </nav>

          {/* Mobile navigation */}
          <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} pt-4`}>
            <div className="flex flex-col space-y-2">
              <Link 
                href="/docs" 
                className="doc-nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/docs/api" 
                className="doc-nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                API
              </Link>
              <Link 
                href="/docs/components" 
                className="doc-nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                Components
              </Link>
              <Link 
                href="/docs/guides" 
                className="doc-nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                Guides
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 flex">
        <SideNav />
        <main className="flex-1 max-w-5xl">
          {children}
        </main>
      </div>

      <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} Inspection Report Documentation
            </div>
            <div className="flex space-x-6">
              <a 
                href="https://github.com/your-repo" 
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
              <Link 
                href="/docs/changelog" 
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Changelog
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

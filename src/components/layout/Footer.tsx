import React from 'react';
import { BaseProps } from '../../types/ui';

const Footer: React.FC<BaseProps> = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-white border-t border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">
              Inspection Report System
            </h3>
            <p className="mt-4 text-sm text-gray-500">
              Professional inspection report management system for property assessments
              and damage documentation.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2">
              {[
                { name: 'New Report', href: '/reports/new' },
                { name: 'Templates', href: '/templates' },
                { name: 'Settings', href: '/settings' },
                { name: 'Help', href: '/help' },
              ].map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">
              Contact Support
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a
                  href="mailto:support@example.com"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  support@example.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+1234567890"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  (123) 456-7890
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-400 text-center">
            © {currentYear} Inspection Report System. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

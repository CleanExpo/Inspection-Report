import './globals.css';
import Navigation from '../components/Navigation';
import { Inter } from 'next/font/google';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Inspection Report System',
  description: 'Comprehensive digital tools for inspection reports and safety data management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <Navigation />
          <main className="flex-grow">
            {children}
          </main>
          <footer className="bg-gray-50 border-t">
            <div className="max-w-7xl mx-auto py-8 px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Company Info */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Inspection Report System
                  </h3>
                  <p className="mt-4 text-sm text-gray-500">
                    Professional inspection and safety management tools for your business.
                  </p>
                </div>

                {/* Quick Links */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Quick Links
                  </h3>
                  <ul className="mt-4 space-y-2">
                    <li>
                      <Link href="/inspection/new" className="text-sm text-gray-500 hover:text-gray-900">
                        New Inspection
                      </Link>
                    </li>
                    <li>
                      <Link href="/safety/sds" className="text-sm text-gray-500 hover:text-gray-900">
                        Safety Data Sheets
                      </Link>
                    </li>
                    <li>
                      <Link href="/clients" className="text-sm text-gray-500 hover:text-gray-900">
                        Client Management
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Contact Info */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Contact
                  </h3>
                  <ul className="mt-4 space-y-2">
                    <li className="text-sm text-gray-500">
                      Email: support@inspectionreport.com
                    </li>
                    <li className="text-sm text-gray-500">
                      Phone: (555) 123-4567
                    </li>
                    <li className="text-sm text-gray-500">
                      Hours: Mon-Fri 9am-5pm
                    </li>
                  </ul>
                </div>
              </div>

              {/* Copyright */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-400 text-center">
                  © {new Date().getFullYear()} Inspection Report System. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

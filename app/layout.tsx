import { Inter } from 'next/font/google';
import Navigation from '../components/Navigation';
import OfflineStatus from '../components/OfflineStatus/OfflineStatus';
import { Providers } from './providers/Providers';
import { Metadata, Viewport } from 'next';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1976d2'
};

export const metadata: Metadata = {
  title: 'Inspection Report',
  description: 'Professional inspection report management system with offline support'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navigation />
          <main>{children}</main>
          <OfflineStatus />
        </Providers>
      </body>
    </html>
  );
}

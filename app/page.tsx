import { Metadata } from 'next';

export const metadata: Metadata = {
  icons: {
    icon: '/icons/icon-192x192.png',
    shortcut: '/icons/icon-192x192.png',
    apple: '/apple-touch-icon.png',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/apple-touch-icon.png',
    },
  },
};

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-4">Welcome to Inspection Report</h1>
      <p className="text-lg text-gray-600">
        Select an option from the menu to get started
      </p>
    </div>
  );
}

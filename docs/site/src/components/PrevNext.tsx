import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

interface NavLink {
  path: string;
  title: string;
}

interface PrevNextProps {
  className?: string;
}

// This would typically be loaded from your documentation structure
const docPages: NavLink[] = [
  { path: '/docs/getting-started/installation', title: 'Installation' },
  { path: '/docs/getting-started/quick-start', title: 'Quick Start Guide' },
  { path: '/docs/features/export', title: 'Export Features' },
  { path: '/docs/features/optimization', title: 'Optimization' },
];

export function PrevNext({ className = '' }: PrevNextProps) {
  const router = useRouter();
  
  const { prev, next } = useMemo(() => {
    const currentIndex = docPages.findIndex(page => page.path === router.asPath);
    return {
      prev: currentIndex > 0 ? docPages[currentIndex - 1] : null,
      next: currentIndex < docPages.length - 1 ? docPages[currentIndex + 1] : null,
    };
  }, [router.asPath]);

  if (!prev && !next) return null;

  return (
    <nav
      className={`flex items-center justify-between border-t border-gray-200 dark:border-gray-800 pt-6 mt-8 ${className}`}
      aria-label="Pagination"
    >
      {prev ? (
        <Link
          href={prev.path}
          className="group inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <svg
            className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M18 10a.75.75 0 01-.75.75H4.66l2.1 1.95a.75.75 0 11-1.02 1.1l-3.5-3.25a.75.75 0 010-1.1l3.5-3.25a.75.75 0 111.02 1.1l-2.1 1.95h12.59A.75.75 0 0118 10z"
              clipRule="evenodd"
            />
          </svg>
          <span>
            Previous<br />
            <span className="block text-xs text-gray-500 dark:text-gray-400">
              {prev.title}
            </span>
          </span>
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          href={next.path}
          className="group inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <span className="text-right">
            Next<br />
            <span className="block text-xs text-gray-500 dark:text-gray-400">
              {next.title}
            </span>
          </span>
          <svg
            className="ml-3 h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M2 10a.75.75 0 01.75-.75h12.59l-2.1-1.95a.75.75 0 111.02-1.1l3.5 3.25a.75.75 0 010 1.1l-3.5 3.25a.75.75 0 11-1.02-1.1l2.1-1.95H2.75A.75.75 0 012 10z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}

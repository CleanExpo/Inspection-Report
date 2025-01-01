import { useRouter } from 'next/router';
import Link from 'next/link';

interface BreadcrumbProps {
  className?: string;
}

export function Breadcrumb({ className = '' }: BreadcrumbProps) {
  const router = useRouter();
  const segments = router.asPath
    .split('/')
    .filter(Boolean)
    .map(segment => decodeURIComponent(segment));

  // Convert path segments to readable text
  const formatSegment = (segment: string): string => {
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Build the breadcrumb path segments
  const breadcrumbSegments = segments.map((segment, index) => {
    const path = '/' + segments.slice(0, index + 1).join('/');
    const isLast = index === segments.length - 1;

    return {
      text: formatSegment(segment),
      path,
      isLast,
    };
  });

  // Add home as the first segment
  breadcrumbSegments.unshift({
    text: 'Home',
    path: '/',
    isLast: breadcrumbSegments.length === 0,
  });

  return (
    <nav aria-label="Breadcrumb" className={`text-sm ${className}`}>
      <ol className="flex items-center space-x-2">
        {breadcrumbSegments.map((segment, index) => (
          <li key={segment.path} className="flex items-center">
            {index > 0 && (
              <span className="mx-2 text-gray-400" aria-hidden="true">
                /
              </span>
            )}
            {segment.isLast ? (
              <span className="text-gray-600 dark:text-gray-300" aria-current="page">
                {segment.text}
              </span>
            ) : (
              <Link
                href={segment.path}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {segment.text}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

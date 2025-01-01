import { useBreakpoint } from '../hooks/useBreakpoint';
import { useTheme } from '../hooks/useTheme';

interface LoadingStateProps {
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
  text?: string;
}

export function LoadingState({ 
  size = 'medium', 
  fullScreen = false,
  text = 'Loading...'
}: LoadingStateProps) {
  const { theme } = useTheme();
  const { isMobile } = useBreakpoint();

  // Size mappings for the spinner
  const sizes = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const spinnerSize = sizes[size];
  const containerClasses = fullScreen 
    ? 'fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-50'
    : 'flex items-center justify-center p-4';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-3">
        <div 
          className={`${spinnerSize} border-4 border-gray-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400 rounded-full animate-spin`}
          role="status"
          aria-label="Loading"
        />
        {text && (
          <p className={`text-gray-600 dark:text-gray-300 ${isMobile ? 'text-sm' : 'text-base'}`}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
}

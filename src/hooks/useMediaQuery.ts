import { useEffect, useState } from 'react';
import { useEventListener } from './useEventListener';

export interface UseMediaQueryOptions {
  /**
   * Whether to initially match the media query
   */
  defaultMatches?: boolean;

  /**
   * Whether the media query matching is enabled
   */
  enabled?: boolean;

  /**
   * Server-side matches value
   */
  ssrMatchMedia?: (query: string) => boolean;
}

/**
 * Hook for matching media queries
 */
export function useMediaQuery(
  query: string,
  options: UseMediaQueryOptions = {}
): boolean {
  const {
    defaultMatches = false,
    enabled = true,
    ssrMatchMedia,
  } = options;

  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') {
      return ssrMatchMedia ? ssrMatchMedia(query) : defaultMatches;
    }

    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (!enabled) return;

    const mql = window.matchMedia(query);
    setMatches(mql.matches);
  }, [query, enabled]);

  useEventListener(
    'change',
    (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    },
    {
      enabled,
      target: typeof window !== 'undefined' ? window.matchMedia(query) : null,
    }
  );

  return matches;
}

/**
 * Common breakpoint queries
 */
export const breakpoints = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
  dark: '(prefers-color-scheme: dark)',
  light: '(prefers-color-scheme: light)',
  portrait: '(orientation: portrait)',
  landscape: '(orientation: landscape)',
  motion: '(prefers-reduced-motion: no-preference)',
  reducedMotion: '(prefers-reduced-motion: reduce)',
  retina: '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)',
  hover: '(hover: hover)',
  touch: '(hover: none) and (pointer: coarse)',
  keyboard: '(hover: hover) and (pointer: fine)',
} as const;

/**
 * useMediaQuery Hook Usage Guide:
 * 
 * 1. Basic usage:
 *    const isMobile = useMediaQuery('(max-width: 768px)');
 * 
 * 2. With predefined breakpoint:
 *    const isDesktop = useMediaQuery(breakpoints.lg);
 * 
 * 3. Dark mode detection:
 *    const isDarkMode = useMediaQuery(breakpoints.dark);
 * 
 * 4. With SSR:
 *    const isMobile = useMediaQuery('(max-width: 768px)', {
 *      ssrMatchMedia: (query) => {
 *        return myCustomSSRMediaMatcher(query);
 *      },
 *    });
 * 
 * 5. Enable/disable:
 *    const isTablet = useMediaQuery('(max-width: 1024px)', {
 *      enabled: shouldCheck,
 *    });
 * 
 * 6. In a component:
 *    function ResponsiveLayout() {
 *      const isMobile = useMediaQuery(breakpoints.sm);
 *      const prefersDark = useMediaQuery(breakpoints.dark);
 * 
 *      return (
 *        <div className={isMobile ? 'mobile' : 'desktop'}>
 *          <div className={prefersDark ? 'dark' : 'light'}>
 *            Content
 *          </div>
 *        </div>
 *      );
 *    }
 * 
 * Notes:
 * - SSR friendly
 * - Supports dynamic queries
 * - Handles cleanup
 * - Can be enabled/disabled
 * - Includes common breakpoints
 * - Uses window.matchMedia
 */

// Export hook functions
export { useClickOutside } from './useClickOutside';
export { useControlled } from './useControlled';
export { useDebounce, useDebouncedCallback } from './useDebounce';
export { useDisclosure } from './useDisclosure';
export { useEventListener } from './useEventListener';
export { useId } from './useId';
export { useIntersectionObserver } from './useIntersectionObserver';
export { useKeyboard, Keys } from './useKeyboard';
export { useLocalStorage } from './useLocalStorage';
export { useMediaQuery, breakpoints } from './useMediaQuery';
export { useMutationObserver } from './useMutationObserver';
export { useNetwork } from './useNetwork';
export { usePortal } from './usePortal';
export { usePrevious } from './usePrevious';
export { useResizeObserver } from './useResizeObserver';
export { useScript } from './useScript';
export { useSessionStorage } from './useSessionStorage';
export { useThrottle, useThrottledCallback } from './useThrottle';

// Export types
export type {
  UseClickOutsideOptions,
} from './useClickOutside';

export type {
  UseControlledOptions,
  UseControlledReturn,
} from './useControlled';

export type {
  UseDebounceOptions,
} from './useDebounce';

export type {
  UseDisclosureOptions,
  UseDisclosureReturn,
} from './useDisclosure';

export type {
  UseEventListenerOptions,
} from './useEventListener';

export type {
  UseIntersectionObserverOptions,
} from './useIntersectionObserver';

export type {
  UseKeyboardOptions,
} from './useKeyboard';

export type {
  UseLocalStorageOptions,
} from './useLocalStorage';

export type {
  UseMediaQueryOptions,
} from './useMediaQuery';

export type {
  UseMutationObserverOptions,
} from './useMutationObserver';

export type {
  UseNetworkOptions,
  NetworkState,
} from './useNetwork';

export type {
  UsePortalOptions,
  UsePortalReturn,
} from './usePortal';

export type {
  UseResizeObserverOptions,
  Size,
} from './useResizeObserver';

export type {
  UseScriptOptions,
  ScriptStatus,
} from './useScript';

export type {
  UseThrottleOptions,
} from './useThrottle';

/**
 * Custom React Hooks Collection
 * 
 * A set of reusable hooks for common UI patterns and behaviors.
 * 
 * Available Hooks:
 * 
 * - useClickOutside: Detect clicks outside a component
 * - useControlled: Manage controlled/uncontrolled component states
 * - useDebounce: Debounce values and callbacks
 * - useDisclosure: Manage open/close states
 * - useEventListener: Handle DOM events with type safety
 * - useId: Generate unique IDs
 * - useIntersectionObserver: Track element visibility
 * - useKeyboard: Handle keyboard interactions
 * - useLocalStorage: Persist state in localStorage
 * - useMediaQuery: Match media queries with SSR support
 * - useMutationObserver: Track DOM mutations
 * - useNetwork: Monitor network status and connection
 * - usePortal: Manage portal mounting
 * - usePrevious: Track previous values
 * - useResizeObserver: Track element size changes
 * - useScript: Load external scripts dynamically
 * - useSessionStorage: Persist state in sessionStorage
 * - useThrottle: Throttle values and callbacks
 * 
 * See individual hook files for detailed usage examples and documentation.
 */

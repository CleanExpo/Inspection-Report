import { useEffect, useState } from 'react';

export interface UsePortalOptions {
  /**
   * The container element to mount the portal into
   */
  container?: Element;

  /**
   * Whether the portal is disabled
   */
  disabled?: boolean;

  /**
   * Callback when portal is mounted
   */
  onMount?: () => void;

  /**
   * Callback when portal is unmounted
   */
  onUnmount?: () => void;
}

export interface UsePortalReturn {
  /**
   * The element to mount the portal into
   */
  mountNode: Element | null;

  /**
   * Whether the portal is mounted
   */
  isMounted: boolean;
}

/**
 * Hook for managing portal mounting and lifecycle
 */
export function usePortal({
  container,
  disabled = false,
  onMount,
  onUnmount,
}: UsePortalOptions = {}): UsePortalReturn {
  const [mountNode, setMountNode] = useState<Element | null>(null);

  useEffect(() => {
    if (disabled) {
      return;
    }

    const defaultNode = container || document.body;
    setMountNode(defaultNode);
    onMount?.();

    return () => {
      onUnmount?.();
    };
  }, [container, disabled, onMount, onUnmount]);

  return {
    mountNode,
    isMounted: !disabled && mountNode !== null,
  };
}

export default usePortal;

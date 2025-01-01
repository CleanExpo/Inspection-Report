import { useEffect, useRef } from 'react';

export interface UseMutationObserverOptions extends MutationObserverInit {
  /**
   * Whether the observer is enabled
   */
  enabled?: boolean;

  /**
   * Callback when mutations occur
   */
  onMutation?: (mutations: MutationRecord[], observer: MutationObserver) => void;
}

/**
 * Hook for observing DOM mutations
 */
export function useMutationObserver(
  elementRef: React.RefObject<Element>,
  options: UseMutationObserverOptions = {}
) {
  const {
    enabled = true,
    onMutation,
    attributes = true,
    characterData = true,
    childList = true,
    subtree = true,
    ...mutationOptions
  } = options;

  const observerRef = useRef<MutationObserver>();

  useEffect(() => {
    const element = elementRef?.current;
    if (!enabled || !element) {
      return;
    }

    const observer = new MutationObserver((mutations, observer) => {
      onMutation?.(mutations, observer);
    });

    observer.observe(element, {
      attributes,
      characterData,
      childList,
      subtree,
      ...mutationOptions,
    });

    observerRef.current = observer;

    return () => {
      observer.disconnect();
      observerRef.current = undefined;
    };
  }, [
    elementRef,
    enabled,
    onMutation,
    attributes,
    characterData,
    childList,
    subtree,
    ...Object.values(mutationOptions),
  ]);

  return observerRef.current;
}

/**
 * useMutationObserver Hook Usage Guide:
 * 
 * 1. Basic usage:
 *    function Component() {
 *      const ref = useRef(null);
 *      useMutationObserver(ref, {
 *        onMutation: (mutations) => {
 *          console.log('DOM changes:', mutations);
 *        },
 *      });
 * 
 *      return <div ref={ref}>Observed content</div>;
 *    }
 * 
 * 2. Specific mutation types:
 *    function AttributeObserver() {
 *      const ref = useRef(null);
 *      useMutationObserver(ref, {
 *        attributes: true,
 *        characterData: false,
 *        childList: false,
 *        attributeFilter: ['class', 'style'],
 *        onMutation: (mutations) => {
 *          mutations.forEach(mutation => {
 *            console.log(
 *              'Attribute changed:',
 *              mutation.attributeName,
 *              mutation.target
 *            );
 *          });
 *        },
 *      });
 * 
 *      return <div ref={ref}>Watch my attributes</div>;
 *    }
 * 
 * 3. Track child elements:
 *    function ChildObserver() {
 *      const ref = useRef(null);
 *      useMutationObserver(ref, {
 *        childList: true,
 *        subtree: false,
 *        onMutation: (mutations) => {
 *          mutations.forEach(mutation => {
 *            mutation.addedNodes.forEach(node => {
 *              console.log('Node added:', node);
 *            });
 *            mutation.removedNodes.forEach(node => {
 *              console.log('Node removed:', node);
 *            });
 *          });
 *        },
 *      });
 * 
 *      return <div ref={ref}>Watch my children</div>;
 *    }
 * 
 * 4. Track text changes:
 *    function TextObserver() {
 *      const ref = useRef(null);
 *      useMutationObserver(ref, {
 *        characterData: true,
 *        characterDataOldValue: true,
 *        onMutation: (mutations) => {
 *          mutations.forEach(mutation => {
 *            console.log(
 *              'Text changed from:',
 *              mutation.oldValue,
 *              'to:',
 *              mutation.target.textContent
 *            );
 *          });
 *        },
 *      });
 * 
 *      return <div ref={ref}>Watch my text</div>;
 *    }
 * 
 * 5. With enable/disable:
 *    function ConditionalObserver() {
 *      const ref = useRef(null);
 *      const [enabled, setEnabled] = useState(true);
 * 
 *      useMutationObserver(ref, {
 *        enabled,
 *        onMutation: (mutations) => {
 *          console.log('Changes:', mutations);
 *        },
 *      });
 * 
 *      return (
 *        <>
 *          <button onClick={() => setEnabled(e => !e)}>
 *            {enabled ? 'Disable' : 'Enable'} observer
 *          </button>
 *          <div ref={ref}>Observed content</div>
 *        </>
 *      );
 *    }
 * 
 * 6. Custom component:
 *    function AutoResizeTextarea() {
 *      const ref = useRef(null);
 * 
 *      useMutationObserver(ref, {
 *        characterData: true,
 *        subtree: true,
 *        onMutation: () => {
 *          if (ref.current) {
 *            ref.current.style.height = 'auto';
 *            ref.current.style.height = `${ref.current.scrollHeight}px`;
 *          }
 *        },
 *      });
 * 
 *      return <textarea ref={ref} />;
 *    }
 * 
 * Notes:
 * - Uses MutationObserver API
 * - Supports all MutationObserver options
 * - Can observe attributes, childList, and characterData
 * - Provides detailed mutation records
 * - Can be enabled/disabled
 * - Cleans up observer
 * - Type-safe
 * - Returns observer instance
 */

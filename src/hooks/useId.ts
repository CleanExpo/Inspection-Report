import { useState } from 'react';

let globalId = 0;

/**
 * Hook for generating unique IDs for accessibility purposes
 */
export function useId(prefix = 'ui'): string {
  const [id] = useState(() => `${prefix}-${globalId++}`);
  return id;
}

export default useId;

/**
 * useId Hook Usage Guide:
 * 
 * 1. Basic usage:
 *    const id = useId();
 *    // Returns: "ui-0"
 * 
 * 2. With custom prefix:
 *    const id = useId('button');
 *    // Returns: "button-0"
 * 
 * 3. In a form field:
 *    function Input({ label }) {
 *      const id = useId('input');
 *      return (
 *        <div>
 *          <label htmlFor={id}>{label}</label>
 *          <input id={id} />
 *        </div>
 *      );
 *    }
 * 
 * 4. With ARIA attributes:
 *    function Dialog({ title }) {
 *      const id = useId('dialog');
 *      return (
 *        <div
 *          role="dialog"
 *          aria-labelledby={`${id}-title`}
 *          aria-describedby={`${id}-desc`}
 *        >
 *          <h2 id={`${id}-title`}>{title}</h2>
 *          <p id={`${id}-desc`}>Description</p>
 *        </div>
 *      );
 *    }
 * 
 * Notes:
 * - Generates unique IDs
 * - Stable across re-renders
 * - Supports custom prefixes
 * - Useful for accessibility
 * - SSR safe
 */

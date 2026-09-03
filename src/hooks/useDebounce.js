import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce any fast-changing value (e.g. search query input).
 *
 * Contract Specification 7:
 * State updates or filtering logic based on the text input must be delayed
 * by a minimum of 300ms after the user stops typing.
 *
 * @param {any} value - The input value to debounce
 * @param {number} delay - Delay in milliseconds (default: 300ms)
 * @returns {any} The debounced value
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set a timer to update the debounced value after the delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clear the timer if value or delay changes before the timer resolves
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

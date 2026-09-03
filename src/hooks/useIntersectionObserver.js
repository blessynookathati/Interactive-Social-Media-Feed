import { useEffect, useRef } from 'react';

/**
 * Custom hook to trigger a callback when a target DOM element enters the viewport.
 *
 * @param {Object} options - IntersectionObserver options (root, rootMargin, threshold)
 * @param {Function} callback - Callback function to fire when intersecting
 * @returns {React.MutableRefObject} Ref to attach to the sentinel element
 */
export function useIntersectionObserver(options = {}, callback) {
  const targetRef = useRef(null);
  const callbackRef = useRef(callback);

  // Keep callbackRef up-to-date with the latest callback to prevent stale closures
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const currentTarget = targetRef.current;
    if (!currentTarget) return;

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && callbackRef.current) {
        callbackRef.current();
      }
    }, options);

    observer.observe(currentTarget);

    // Cleanup observer on unmount or options change to prevent memory leaks
    return () => {
      observer.unobserve(currentTarget);
      observer.disconnect();
    };
  }, [options.root, options.rootMargin, options.threshold]);

  return targetRef;
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchPosts } from '../services/api';
import { useIntersectionObserver } from './useIntersectionObserver';

const PAGE_SIZE = 10;

/**
 * Custom hook to manage infinite scroll pagination of posts.
 * Guards against duplicate fetches, supports AbortController cancellation,
 * and maintains lifted post state across pagination and remounts.
 *
 * @param {number} pageSize - Number of posts per page (default: 10)
 * @returns {Object} Feed state, helpers, and sentinel ref
 */
export function useInfinitePosts(pageSize = PAGE_SIZE) {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  // Ref to track in-flight pages and prevent duplicate calls for the same page
  const fetchedPagesRef = useRef(new Set());

  // Fetch posts for the current page
  useEffect(() => {
    // If this page is already fetched or no more items, skip
    if (fetchedPagesRef.current.has(page)) return;

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchPosts(page, pageSize, { signal: controller.signal })
      .then(({ posts: batch, hasMore: moreAvailable }) => {
        fetchedPagesRef.current.add(page);
        setPosts((prev) => {
          // Avoid duplicate posts by ID
          const existingIds = new Set(prev.map((p) => p.id));
          const filteredBatch = batch.filter((p) => !existingIds.has(p.id));
          return page === 1 ? batch : [...prev, ...filteredBatch];
        });
        setHasMore(moreAvailable && batch.length > 0);
      })
      .catch((err) => {
        if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
          setError(err.message || 'Failed to load posts. Please try again.');
        }
      })
      .finally(() => {
        setLoading(false);
        setIsInitialLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [page, pageSize]);

  // Observer callback when sentinel enters viewport
  const handleIntersect = useCallback(() => {
    if (!loading && hasMore && !isInitialLoading) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [loading, hasMore, isInitialLoading]);

  // Sentinel ref with 200px prefetch margin
  const sentinelRef = useIntersectionObserver(
    { rootMargin: '200px', threshold: 0.1 },
    handleIntersect
  );

  /**
   * Lifted state updater for a specific post.
   * Allows optimistic updates for likes or comments to persist across feed renders.
   *
   * @param {number} postId
   * @param {Function|Object} updater - Partial post object or updater function
   */
  const updatePost = useCallback((postId, updater) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          const updates = typeof updater === 'function' ? updater(post) : updater;
          return { ...post, ...updates };
        }
        return post;
      })
    );
  }, []);

  /**
   * Refetches or resets the feed
   */
  const retry = useCallback(() => {
    fetchedPagesRef.current.delete(page);
    setLoading(true);
    setError(null);
    fetchPosts(page, pageSize)
      .then(({ posts: batch, hasMore: moreAvailable }) => {
        fetchedPagesRef.current.add(page);
        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const filteredBatch = batch.filter((p) => !existingIds.has(p.id));
          return page === 1 ? batch : [...prev, ...filteredBatch];
        });
        setHasMore(moreAvailable);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page, pageSize]);

  return {
    posts,
    loading,
    isInitialLoading,
    hasMore,
    error,
    sentinelRef,
    updatePost,
    retry
  };
}

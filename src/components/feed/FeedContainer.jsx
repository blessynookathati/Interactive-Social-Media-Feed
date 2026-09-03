import React, { useMemo } from 'react';
import { PostCard } from './PostCard';
import { Loader2, Sparkles, AlertCircle, SearchX, CheckCircle2 } from 'lucide-react';

/**
 * Filter and sort posts in memory without mutating the original posts array.
 * Contract Specification 7 & 8.
 *
 * @param {Array} posts
 * @param {string} searchNeedle - Debounced search term
 * @param {'all' | 'popular' | 'recent'} sortKey
 * @returns {Array} New filtered and sorted array
 */
export function applyFeedFilters(posts, searchNeedle, sortKey) {
  const needle = (searchNeedle || '').trim().toLowerCase();

  // 1. Filter by hashtags (case-insensitive)
  let result = needle
    ? posts.filter((post) =>
        post.hashtags?.some((tag) => tag.toLowerCase().includes(needle))
      )
    : posts.slice();

  // 2. Sort by criteria
  if (sortKey === 'popular') {
    // Sort descending by likeCount
    result.sort((a, b) => b.likeCount - a.likeCount);
  } else if (sortKey === 'recent') {
    // Sort descending by createdAt
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return result;
}

/**
 * FeedContainer component
 * Renders post cards, initial skeletons, empty states,
 * and the IntersectionObserver bottom sentinel element.
 */
export function FeedContainer({
  posts,
  loading,
  isInitialLoading,
  hasMore,
  error,
  sentinelRef,
  debouncedSearch,
  sortKey,
  onUpdatePost,
  onOpenComments,
  onSelectHashtag,
  onClearSearch,
  onRetry,
  simulateError
}) {
  // Apply memoized filtering and sorting
  const visiblePosts = useMemo(() => {
    return applyFeedFilters(posts, debouncedSearch, sortKey);
  }, [posts, debouncedSearch, sortKey]);

  return (
    <main className="feed-main-container">
      {/* Search status notification banner if active */}
      {debouncedSearch && (
        <div className="active-filter-banner">
          <span>
            Filtering by tag: <strong>{debouncedSearch}</strong> ({visiblePosts.length} matches)
          </span>
          <button
            type="button"
            className="clear-banner-btn"
            onClick={onClearSearch}
          >
            Reset
          </button>
        </div>
      )}

      {/* Initial Loading Skeletons */}
      {isInitialLoading && (
        <div className="skeleton-feed">
          {[1, 2, 3].map((index) => (
            <div key={index} className="skeleton-card">
              <div className="skeleton-header">
                <div className="skeleton-avatar shimmer"></div>
                <div className="skeleton-author-info">
                  <div className="skeleton-line shimmer short"></div>
                  <div className="skeleton-line shimmer micro"></div>
                </div>
              </div>
              <div className="skeleton-title shimmer"></div>
              <div className="skeleton-paragraph shimmer"></div>
              <div className="skeleton-paragraph shimmer half"></div>
              <div className="skeleton-footer">
                <div className="skeleton-action shimmer"></div>
                <div className="skeleton-action shimmer"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Initial Error State */}
      {!isInitialLoading && error && posts.length === 0 && (
        <div className="feed-error-container">
          <AlertCircle size={40} className="error-icon" />
          <h3>Unable to Load Feed</h3>
          <p>{error}</p>
          <button type="button" className="retry-btn" onClick={onRetry}>
            Try Again
          </button>
        </div>
      )}

      {/* Empty State when search returns 0 matches */}
      {!isInitialLoading && posts.length > 0 && visiblePosts.length === 0 && (
        <div className="feed-empty-state">
          <div className="empty-state-icon-box">
            <SearchX size={44} />
          </div>
          <h3>No posts found matching "{debouncedSearch}"</h3>
          <p>
            Try searching for a different hashtag like <code>#react</code>, <code>#frontend</code>, or clear the search.
          </p>
          <button
            type="button"
            className="clear-search-btn"
            onClick={onClearSearch}
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Post List */}
      {!isInitialLoading && visiblePosts.length > 0 && (
        <div className="feed-posts-list">
          {visiblePosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onUpdatePost={onUpdatePost}
              onOpenComments={onOpenComments}
              onTagClick={onSelectHashtag}
              simulateError={simulateError}
            />
          ))}
        </div>
      )}

      {/* Sentinel Element for Intersection Observer */}
      {!isInitialLoading && (
        <div
          ref={sentinelRef}
          className="feed-sentinel"
          id="feed-bottom-sentinel"
          aria-hidden="true"
        >
          {loading && (
            <div className="sentinel-loading">
              <Loader2 className="spinning-loader" size={24} />
              <span>Loading more stories...</span>
            </div>
          )}

          {!hasMore && posts.length > 0 && (
            <div className="sentinel-end">
              <CheckCircle2 size={20} className="end-icon" />
              <span>You're all caught up! ({posts.length} posts loaded)</span>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

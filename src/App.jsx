import React, { useState, useMemo, useCallback } from 'react';
import { ToastProvider } from './components/ui/Toast';
import { Navbar } from './components/ui/Navbar';
import { FeedContainer } from './components/feed/FeedContainer';
import { CommentModal } from './components/feed/CommentModal';
import { useInfinitePosts } from './hooks/useInfinitePosts';
import { useDebounce } from './hooks/useDebounce';

function FeedApp() {
  // Feed & custom infinite posts hook
  const {
    posts,
    loading,
    isInitialLoading,
    hasMore,
    error,
    sentinelRef,
    updatePost,
    retry
  } = useInfinitePosts(10);

  // Search and Debouncing state (Contract Specification 7)
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Dropdown Sort State: 'all' | 'popular' | 'recent' (Contract Specification 8)
  const [sortKey, setSortKey] = useState('all');

  // Error simulation mode for reviewer verification (Contract Specification 5)
  const [simulateError, setSimulateError] = useState(false);

  // Comment Modal state (Contract Specification 6)
  const [activeModalPost, setActiveModalPost] = useState(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  // Extract all distinct hashtags across all currently loaded posts for autocomplete
  const availableHashtags = useMemo(() => {
    const tags = new Set();
    posts.forEach((post) => {
      post.hashtags?.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags);
  }, [posts]);

  // Open comments modal for a specific post
  const handleOpenComments = useCallback((post) => {
    setActiveModalPost(post);
    setIsCommentModalOpen(true);
  }, []);

  // Close comments modal
  const handleCloseComments = useCallback(() => {
    setIsCommentModalOpen(false);
    setActiveModalPost(null);
  }, []);

  // Increment comment count when a new comment is added inside the modal
  const handleAddCommentToPost = useCallback((postId) => {
    updatePost(postId, (prev) => ({
      commentCount: (prev.commentCount || 0) + 1
    }));
  }, [updatePost]);

  // Handle clicking a hashtag on a post card to quick-filter
  const handleSelectHashtag = useCallback((tag) => {
    setSearchTerm(tag);
    // Smooth scroll to top when changing filter
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Clear search filter
  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  return (
    <div className="app-layout">
      {/* Top Navigation Bar with Search, Filter & Controls */}
      <Navbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortKey={sortKey}
        onSortChange={setSortKey}
        availableHashtags={availableHashtags}
        simulateError={simulateError}
        onToggleSimulateError={() => setSimulateError((prev) => !prev)}
        totalPostsLoaded={posts.length}
      />

      {/* Main Feed Section */}
      <div className="feed-wrapper">
        <FeedContainer
          posts={posts}
          loading={loading}
          isInitialLoading={isInitialLoading}
          hasMore={hasMore}
          error={error}
          sentinelRef={sentinelRef}
          debouncedSearch={debouncedSearch}
          sortKey={sortKey}
          onUpdatePost={updatePost}
          onOpenComments={handleOpenComments}
          onSelectHashtag={handleSelectHashtag}
          onClearSearch={handleClearSearch}
          onRetry={retry}
          simulateError={simulateError}
        />
      </div>

      {/* Comment Modal via React Portal */}
      <CommentModal
        post={activeModalPost}
        isOpen={isCommentModalOpen}
        onClose={handleCloseComments}
        onAddComment={handleAddCommentToPost}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <FeedApp />
    </ToastProvider>
  );
}

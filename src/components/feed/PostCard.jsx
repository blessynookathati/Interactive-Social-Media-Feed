import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, User } from 'lucide-react';
import { formatRelativeTime, formatCompactNumber } from '../../utils/formatters';
import { patchPostLike } from '../../services/api';
import { useToast } from '../ui/Toast';

/**
 * PostCard Component
 * Implements optimistic UI like toggling with snapshot rollback,
 * lazy-loaded media, accessible attributes, and comments trigger.
 *
 * Contract Specification 3:
 * Identifiable by data-testid="post-card". Displays title, body, author, likeCount.
 * Interactive Like and Comments buttons.
 */
export function PostCard({
  post,
  onUpdatePost,
  onOpenComments,
  onTagClick,
  simulateError = false
}) {
  const [isLikingInProgress, setIsLikingInProgress] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { showToast } = useToast();

  /**
   * Handle Like button click with Optimistic UI update & rollback sequence.
   * Contract Specification 5.
   */
  const handleLikeToggle = async () => {
    if (isLikingInProgress) return;

    // 1. Capture snapshot of previous state for rollback
    const previousIsLiked = post.isLiked;
    const previousLikeCount = post.likeCount;

    const nextIsLiked = !previousIsLiked;
    const nextLikeCount = previousIsLiked ? previousLikeCount - 1 : previousLikeCount + 1;

    // 2. Synchronous optimistic UI update via lifted state
    onUpdatePost(post.id, {
      isLiked: nextIsLiked,
      likeCount: nextLikeCount
    });

    setIsLikingInProgress(true);

    try {
      // 3. Asynchronous PATCH request to JSONPlaceholder (or simulated failure)
      await patchPostLike(post.id, nextIsLiked, { forceFailure: simulateError });

      // 4. Success toast
      showToast(
        nextIsLiked ? 'Liked post!' : 'Removed like',
        'success',
        2500
      );
    } catch (error) {
      // 5. Rollback on failure to the previous state snapshot
      onUpdatePost(post.id, {
        isLiked: previousIsLiked,
        likeCount: previousLikeCount
      });

      // Show error toast explaining the failure
      showToast(
        error.message || 'Failed to update like status. Reverting change.',
        'error',
        4000
      );
    } finally {
      setIsLikingInProgress(false);
    }
  };

  const handleShareClick = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!', 'info', 2500);
    }
  };

  const handleSaveToggle = () => {
    setIsSaved(!isSaved);
    showToast(!isSaved ? 'Post saved to bookmarks' : 'Removed from bookmarks', 'info', 2000);
  };

  return (
    <article
      className="post-card"
      data-testid="post-card"
      id={`post-${post.id}`}
    >
      {/* Post Header */}
      <header className="post-header">
        <div className="post-author-group">
          <div className="author-avatar-wrapper">
            {post.author?.avatar ? (
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="author-avatar"
                loading="lazy"
              />
            ) : (
              <div className="author-avatar-fallback">
                <User size={18} />
              </div>
            )}
          </div>
          <div className="author-details">
            <div className="author-name-row">
              <span className="author-name">{post.author?.name || `Author #${post.userId}`}</span>
              <span className="author-handle">{post.author?.handle || `@user${post.userId}`}</span>
            </div>
            <div className="post-meta-row">
              <time dateTime={post.createdAt} className="post-timestamp">
                {formatRelativeTime(post.createdAt)}
              </time>
              <span className="meta-separator">•</span>
              <span className="author-id-badge">ID: #{post.id}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="post-more-btn"
          aria-label="More post options"
          onClick={() => showToast(`Post ID #${post.id} options`, 'info', 2000)}
        >
          <MoreHorizontal size={18} />
        </button>
      </header>

      {/* Post Content */}
      <div className="post-content">
        <h3 className="post-title">{post.title}</h3>
        <p className="post-body">{post.body}</p>
      </div>

      {/* Optional Featured Media */}
      {post.imageUrl && (
        <div className="post-media-container">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="post-image"
            loading="lazy"
          />
        </div>
      )}

      {/* Hashtags */}
      {post.hashtags && post.hashtags.length > 0 && (
        <div className="post-hashtags" aria-label="Post hashtags">
          {post.hashtags.map((tag) => (
            <button
              key={tag}
              type="button"
              className="hashtag-pill"
              onClick={() => onTagClick && onTagClick(tag)}
              title={`Filter feed by ${tag}`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Post Actions Footer */}
      <footer className="post-actions-footer">
        <div className="actions-left">
          {/* Like Button */}
          <button
            type="button"
            className={`action-btn like-btn ${post.isLiked ? 'liked' : ''} ${isLikingInProgress ? 'loading' : ''}`}
            onClick={handleLikeToggle}
            aria-label="Like post"
            aria-pressed={post.isLiked}
          >
            <Heart
              size={18}
              className={`heart-icon ${post.isLiked ? 'fill-heart' : ''}`}
            />
            <span className="action-count">{formatCompactNumber(post.likeCount)}</span>
          </button>

          {/* Comments Button */}
          <button
            type="button"
            className="action-btn comment-btn"
            onClick={() => onOpenComments(post)}
            aria-label={`View comments on post #${post.id}`}
          >
            <MessageCircle size={18} className="comment-icon" />
            <span className="action-count">{formatCompactNumber(post.commentCount || 0)}</span>
          </button>

          {/* Share Button */}
          <button
            type="button"
            className="action-btn share-btn"
            onClick={handleShareClick}
            aria-label="Share post"
          >
            <Share2 size={17} />
          </button>
        </div>

        <div className="actions-right">
          {/* Bookmark Button */}
          <button
            type="button"
            className={`action-btn bookmark-btn ${isSaved ? 'saved' : ''}`}
            onClick={handleSaveToggle}
            aria-label={isSaved ? 'Remove bookmark' : 'Bookmark post'}
          >
            <Bookmark size={17} className={isSaved ? 'fill-bookmark' : ''} />
          </button>
        </div>
      </footer>
    </article>
  );
}

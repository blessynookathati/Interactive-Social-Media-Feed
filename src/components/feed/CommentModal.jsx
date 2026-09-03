import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, MessageSquare, Send, User, Mail, Loader2, AlertCircle } from 'lucide-react';
import { fetchComments } from '../../services/api';
import { useToast } from '../ui/Toast';

/**
 * Accessible Comment Modal using React Portal.
 * Lazily loads comments for the specified post ID upon opening.
 *
 * @param {Object} props
 * @param {Object|null} props.post - Active post object
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Modal close handler
 * @param {Function} props.onAddComment - Optional callback to increment comment count
 */
export function CommentModal({ post, isOpen, onClose, onAddComment }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const closeBtnRef = useRef(null);
  const modalContentRef = useRef(null);
  const { showToast } = useToast();

  // Lazy fetch comments when modal opens and post exists
  useEffect(() => {
    if (!isOpen || !post?.id) {
      setComments([]);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchComments(post.id, { signal: controller.signal })
      .then((data) => {
        setComments(data);
      })
      .catch((err) => {
        if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
          setError('Failed to load comments. Please try again.');
        }
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [isOpen, post?.id]);

  // Handle Escape key to close modal and focus management
  useEffect(() => {
    if (!isOpen) return;

    // Focus close button on open for accessibility
    setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Prevent background scrolling when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !post) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleAddCommentSubmit = (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment = {
      id: Date.now(),
      postId: post.id,
      name: authorName.trim() || 'You',
      email: 'you@developer.io',
      body: newCommentText.trim()
    };

    setComments((prev) => [newComment, ...prev]);
    setNewCommentText('');
    showToast('Comment posted successfully!', 'success');
    if (onAddComment) {
      onAddComment(post.id);
    }
  };

  const modalRoot = document.getElementById('modal-root') || document.body;

  return createPortal(
    <div
      className="modal-backdrop"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="comment-modal-title"
        ref={modalContentRef}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-header-info">
            <div className="modal-icon-badge">
              <MessageSquare size={18} />
            </div>
            <div>
              <h2 id="comment-modal-title" className="modal-title">
                Comments
              </h2>
              <p className="modal-subtitle">
                Post #{post.id} by {post.author?.name || 'Author'}
              </p>
            </div>
          </div>
          <button
            type="button"
            ref={closeBtnRef}
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close comment modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Post Brief Snippet */}
        <div className="modal-post-snippet">
          <p className="modal-post-title">{post.title}</p>
        </div>

        {/* New Comment Input */}
        <form onSubmit={handleAddCommentSubmit} className="add-comment-form">
          <div className="add-comment-inputs">
            <input
              type="text"
              placeholder="Your name (optional)"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="comment-name-input"
            />
            <div className="comment-textarea-row">
              <input
                type="text"
                placeholder="Write a thoughtful comment..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="comment-text-input"
                required
              />
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="comment-submit-btn"
                aria-label="Post comment"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </form>

        {/* Comment List Body */}
        <div className="modal-body custom-scrollbar">
          {loading ? (
            <div className="modal-loading-state">
              <Loader2 className="spinning-loader" size={32} />
              <p>Fetching comments...</p>
            </div>
          ) : error ? (
            <div className="modal-error-state">
              <AlertCircle size={28} />
              <p>{error}</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="modal-empty-state">
              <MessageSquare size={36} className="empty-icon" />
              <p>No comments yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="comments-list">
              {comments.map((comment) => (
                <div key={comment.id} className="comment-card">
                  <div className="comment-header">
                    <div className="comment-avatar">
                      <User size={15} />
                    </div>
                    <div className="comment-meta">
                      <span className="comment-author">{comment.name}</span>
                      <span className="comment-email">
                        <Mail size={11} className="email-icon" />
                        {comment.email}
                      </span>
                    </div>
                  </div>
                  <p className="comment-body">{comment.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    modalRoot
  );
}

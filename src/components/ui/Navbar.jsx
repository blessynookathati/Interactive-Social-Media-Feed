import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Sparkles, SlidersHorizontal, Flame, Clock, Hash, Bug } from 'lucide-react';

/**
 * Navbar component with debounced search, hashtag autocomplete,
 * feed sort filter, and error simulation toggle for reviewers.
 */
export function Navbar({
  searchTerm,
  onSearchChange,
  sortKey,
  onSortChange,
  availableHashtags = [],
  simulateError,
  onToggleSimulateError,
  totalPostsLoaded
}) {
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);
  const searchContainerRef = useRef(null);

  // Suggestions based on the raw search input (instant feedback)
  const matchingHashtags = searchTerm.trim()
    ? availableHashtags.filter((tag) =>
        tag.toLowerCase().includes(searchTerm.trim().toLowerCase())
      ).slice(0, 6)
    : [];

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsAutocompleteOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectHashtag = (tag) => {
    onSearchChange(tag);
    setIsAutocompleteOpen(false);
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Brand Logo & Name */}
        <div className="navbar-brand">
          <div className="brand-icon-wrapper">
            <Sparkles className="brand-icon" size={22} />
          </div>
          <div className="brand-text">
            <span className="brand-title">PulseFeed</span>
            <span className="brand-badge">{totalPostsLoaded} posts</span>
          </div>
        </div>

        {/* Search Bar with Autocomplete */}
        <div className="search-wrapper" ref={searchContainerRef}>
          <div className="search-input-box">
            <Search className="search-icon" size={18} />
            <input
              id="feed-search-input"
              type="text"
              placeholder="Search hashtags (e.g. #react, #frontend)..."
              value={searchTerm}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setIsAutocompleteOpen(true);
              }}
              onFocus={() => setIsAutocompleteOpen(true)}
              className="search-input"
              autoComplete="off"
              aria-label="Filter posts by hashtag"
            />
            {searchTerm && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => {
                  onSearchChange('');
                  setIsAutocompleteOpen(false);
                }}
                aria-label="Clear search input"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Instant Autocomplete Suggestions */}
          {isAutocompleteOpen && matchingHashtags.length > 0 && (
            <div className="autocomplete-dropdown" role="listbox">
              <div className="autocomplete-header">Matching Hashtags</div>
              {matchingHashtags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  role="option"
                  aria-selected={searchTerm === tag}
                  className="autocomplete-item"
                  onClick={() => handleSelectHashtag(tag)}
                >
                  <Hash size={14} className="hashtag-icon" />
                  <span>{tag}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Controls: Sort Select & Sim Error Toggle */}
        <div className="navbar-controls">
          {/* Dropdown Filter */}
          <div className="sort-dropdown-container">
            <SlidersHorizontal size={15} className="sort-icon" />
            <select
              id="feed-sort-select"
              value={sortKey}
              onChange={(e) => onSortChange(e.target.value)}
              className="sort-select"
              aria-label="Sort feed posts"
            >
              <option value="all">All Posts</option>
              <option value="popular">🔥 Popular (Likes)</option>
              <option value="recent">⏱️ Recent (Newest)</option>
            </select>
          </div>

          {/* Reviewer Demo: Simulate API Error */}
          <button
            type="button"
            className={`simulate-error-btn ${simulateError ? 'is-active' : ''}`}
            onClick={onToggleSimulateError}
            title={simulateError ? 'Simulating API Errors (Likes will fail)' : 'API Normal (Likes will succeed)'}
            aria-pressed={simulateError}
            aria-label="Toggle network error simulation"
          >
            <Bug size={15} />
            <span className="error-btn-text">
              {simulateError ? 'Error Mode: ON' : 'Simulate Error'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

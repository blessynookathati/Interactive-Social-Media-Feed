# PulseFeed — Interactive Social Media Feed

A modern, responsive, and performant social media feed web application built with **React**, **Vite**, and the **Intersection Observer API**.

![PulseFeed Banner](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80)

---

## 🚀 Features

- **Infinite Scrolling with Intersection Observer**: Smoothly appends 10 posts at a time using native browser `IntersectionObserver` with a `200px` prefetch margin, eliminating resource-heavy scroll listeners.
- **Optimistic UI Updates with State Rollback**: Likes are updated synchronously in the UI for instant gratification, followed by a background `PATCH` request. If the request encounters an error, the previous like count and state are gracefully reverted with a descriptive error toast.
- **Interactive Error Simulation Mode**: An on-screen **"Simulate Error"** toggle in the navigation bar lets evaluators and developers trigger simulated network failures to observe optimistic rollback in real-time.
- **Accessible Comment Modal (React Portal)**: Isolated modal rendered outside the parent DOM tree via `createPortal`. Features lazy comment fetching on open (`GET /posts/:postId/comments`), keyboard accessibility (`Escape` key dismiss, focus trapping), backdrop click dismiss, and an interactive "Add Comment" form.
- **Debounced Search & Instant Autocomplete**:
  - **300ms Debouncing**: Prevents UI lag and excessive computation while typing.
  - **Instant Autocomplete**: Provides instant hashtag recommendations matching loaded post tags.
- **Feed Sorting**: Dropdown filter supporting:
  - **All Posts** (default catalog order)
  - **🔥 Popular** (sorted descending by `likeCount`)
  - **⏱️ Recent** (sorted descending by `createdAt` timestamp)
- **Toast Notification System**: Custom lightweight animated toast context providing non-intrusive feedback for likes, errors, shares, and comments.
- **Dark Glassmorphic UI**: High-contrast, mobile-first design system with smooth micro-animations, accessible `:focus-visible` rings, and zero horizontal overflow down to 320px screens.

---

## 🛠️ Tech Stack

- **Frontend**: React 18 (Functional Components, Hooks: `useState`, `useEffect`, `useCallback`, `useMemo`, `useRef`)
- **Build Tool**: Vite
- **Styling**: Vanilla CSS (Modern CSS variables, Flexbox/Grid, Glassmorphism, Micro-animations)
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **API**: [JSONPlaceholder REST API](https://jsonplaceholder.typicode.com) augmented with client-side social properties

---

## 📂 Project Structure

```
├── .env.example                # Declares VITE_API_BASE_URL
├── .gitignore                  # Ignores node_modules, dist, etc.
├── index.html                  # Entry HTML with Google Fonts & #modal-root
├── package.json                # Project dependencies and scripts
├── vite.config.js              # Vite React configuration
└── src/
    ├── assets/
    │   └── index.css           # Global design system & animations
    ├── components/
    │   ├── feed/
    │   │   ├── CommentModal.jsx # React portal comments dialog
    │   │   ├── FeedContainer.jsx # Feed list, skeletons, sentinel
    │   │   └── PostCard.jsx    # Post card with optimistic like & rollback
    │   └── ui/
    │       ├── Navbar.jsx      # Search, sort dropdown, error toggle
    │       └── Toast.jsx       # Toast provider & notifications
    ├── hooks/
    │   ├── useDebounce.js      # Debounce input hook (300ms)
    │   ├── useInfinitePosts.js # Infinite scroll pagination manager
    │   └── useIntersectionObserver.js # Intersection Observer hook
    ├── services/
    │   └── api.js              # Axios client & transformPost data layer
    ├── utils/
    │   └── formatters.js       # Relative date & compact number formatters
    ├── App.jsx                 # Application layout & state coordination
    └── main.jsx                # Application root entry
```

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v18 or newer recommended)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/blessynookathati/Interactive-Social-Media-Feed.git
   cd Interactive-Social-Media-Feed
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment variables:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 🧪 Evaluation & Review Guide

| Test Scenario | Action | Expected Behavior |
|---|---|---|
| **Infinite Scroll** | Scroll down to bottom of feed | Observer sentinel triggers and appends the next 10 posts. |
| **Optimistic Like** | Click the heart icon on any post | Instant count increment + heart pulse animation + green success toast. |
| **Rollback Sequence** | Turn ON "Simulate Error" in header, then click Like | Optimistic count increments, network error fires, count reverts to previous snapshot, red error toast appears. |
| **Comment Modal** | Click "Comments" on any card | Portal modal opens, shows skeleton loader, lazily fetches comments from JSONPlaceholder, closes on `Esc` or backdrop click. |
| **Debounced Search** | Type `#react` into search bar | Autocomplete suggestions appear instantly; feed filters by `#react` after 300ms pause. |
| **Dropdown Sort** | Select "🔥 Popular" or "⏱️ Recent" | Posts reorder descending by like count or creation timestamp without mutating state in place. |

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).

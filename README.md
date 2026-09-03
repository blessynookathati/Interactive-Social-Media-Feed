# 📰 Social Feed Application

> A modern React-based social feed application that demonstrates real-world frontend patterns including dynamic data fetching, debounced search, filtering, infinite scrolling, optimistic UI updates with rollback, comments, and toast notifications.

![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![REST API](https://img.shields.io/badge/API-REST-orange)

---

## 📖 Overview

The **Social Feed Application** is a responsive frontend application designed to simulate the behavior of a modern social media feed.

The application fetches and displays posts from an external API and provides features such as search, filtering, infinite scrolling, comments, likes, optimistic updates, rollback handling, and toast notifications.

A major focus of this project is implementing a responsive and reliable user experience using **React Hooks**, reusable components, asynchronous API handling, and efficient state management.

---

## ✨ Features

- 📰 Dynamic post feed
- 🔍 Search functionality
- 🎯 Post filtering
- ♾️ Infinite scrolling
- 👀 Intersection Observer integration
- ❤️ Optimistic like updates
- 🔄 Automatic rollback on failed requests
- 💬 Comments modal
- 🔔 Success and error toast notifications
- ⏳ Loading states
- ❌ Error handling
- 📡 REST API integration
- 📱 Responsive user interface
- ⚡ Performance-focused interactions
- 🧩 Reusable component architecture

---

# 🏗️ System Architecture

The application is divided into three major layers:

```text
┌─────────────────────────────────────────────┐
│               USER INTERFACE                │
│                                             │
│  Feed Container                             │
│  Post Cards                                 │
│  Navigation / Search / Filter               │
│  Like Button                                │
│  Comments Modal                             │
│  Toast Notification System                  │
└───────────────────┬─────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│         STATE MANAGEMENT & HOOKS            │
│                                             │
│  useState                                   │
│  useEffect                                  │
│  useRef                                     │
│  useDebounce                                │
│  useIntersectionObserver                    │
│  Custom Data Fetching Logic                 │
└───────────────────┬─────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│             EXTERNAL SERVICES               │
│                                             │
│          JSONPlaceholder REST API           │
└─────────────────────────────────────────────┘
```

---

# 🔄 Application Workflow

```text
Application Starts
        │
        ▼
Initialize Application State
        │
        ▼
Fetch Initial Posts
        │
        ▼
Store Posts in Feed State
        │
        ▼
Render Post Feed
        │
        ├───────────────────────────────┐
        │                               │
        ▼                               ▼
User Searches                     User Scrolls
        │                               │
        ▼                               ▼
Debounce Input                  Bottom Marker
        │                               │
        ▼                               ▼
Update Query                 Intersection Observer
        │                               │
        ▼                               ▼
Filter / Fetch Posts          Fetch Next Page
        │                               │
        ▼                               ▼
Update Feed                   Append New Posts
        │
        ▼
Render Updated Results
```

---

# 📰 Dynamic Feed Workflow

The feed is responsible for displaying posts and managing paginated content.

```text
Initial Page Load
        │
        ▼
Fetch Posts
        │
        ▼
Loading State
        │
        ├───────────────┐
        │               │
     Success          Failure
        │               │
        ▼               ▼
Render Posts      Display Error
        │
        ▼
User Scrolls
        │
        ▼
Bottom Trigger Visible
        │
        ▼
Load Next Posts
        │
        ▼
Append to Existing Feed
```

Instead of replacing existing posts, newly fetched data is appended to the current feed.

---

# ♾️ Infinite Scrolling

The application uses the **Intersection Observer API** to detect when the user reaches the bottom of the feed.

```text
Post Feed
    │
    ▼
Post 1
Post 2
Post 3
Post 4
    │
    ▼
Infinite Scroll Trigger
    │
    ▼
Intersection Observer
    │
    ▼
Trigger Next Data Fetch
    │
    ▼
Append New Posts
```

### Benefits

- Avoids continuous scroll event listeners
- Reduces unnecessary main-thread work
- Improves scrolling performance
- Provides a smoother browsing experience

---

# 🔍 Search and Filtering Workflow

Search and filter functionality allows users to find relevant posts efficiently.

```text
User Enters Search Query
        │
        ▼
useDebounce Hook
        │
        ▼
Wait for User to Stop Typing
        │
        ▼
Update Debounced Query
        │
        ▼
Apply Search / Filter Logic
        │
        ▼
Update Feed State
        │
        ▼
Render Matching Posts
```

---

# ⚡ Debounced Search

The application uses debouncing to avoid processing every keystroke immediately.

### Without Debouncing

```text
r      → Update
re     → Update
rea    → Update
reac   → Update
react  → Update
```

### With Debouncing

```text
r → re → rea → reac → react
                        │
                     Delay
                        │
                        ▼
                   One Update
```

### Benefits

- Reduces unnecessary API requests
- Prevents excessive state updates
- Improves responsiveness
- Reduces network usage

---

# ❤️ Optimistic Like Updates

The Like functionality follows an **Optimistic UI Update** pattern.

When a user clicks the Like button, the interface updates immediately without waiting for the server response.

```text
User Clicks Like
        │
        ▼
Save Previous State
        │
        ▼
Optimistically Update UI
        │
        ▼
Update isLiked
Update likeCount
        │
        ▼
Send PATCH Request
        │
        ├───────────────────┐
        │                   │
        ▼                   ▼
     Success              Failure
        │                   │
        ▼                   ▼
Keep New State       Restore Previous State
        │                   │
        ▼                   ▼
Success Toast         Error Toast
```

---

# 🔄 Optimistic Update Rollback Sequence

The rollback mechanism ensures that the application state remains consistent when an API request fails.

```text
User
 │
 │ Clicks Like
 ▼
PostCard
 │
 │ Optimistically toggle isLiked
 │ Update likeCount
 ▼
App State
 │
 │ PATCH /posts/:id
 ▼
API
 │
 ├──────────── Request Success ────────────┐
 │                                         │
 ▼                                         ▼
200 Response                         Keep Updated State
 │                                         │
 ▼                                         ▼
Success Toast                         User Sees Success


API Request Failure
        │
        ▼
Return Error
        │
        ▼
Restore Previous isLiked Value
        │
        ▼
Restore Previous likeCount
        │
        ▼
Show Error Toast
```

This approach provides a fast user experience while still handling failures correctly.

---

# 💬 Comments Workflow

Users can view comments associated with a post through a dedicated modal.

```text
User Clicks Comments
        │
        ▼
Open Comments Modal
        │
        ▼
Request Comments
        │
        ├───────────────┐
        │               │
     Success          Failure
        │               │
        ▼               ▼
Display Comments   Display Error State
        │
        ▼
User Closes Modal
```

The comments functionality is separated from the main feed to maintain clean component responsibilities.

---

# 🔔 Toast Notification System

Toast notifications provide immediate feedback for user actions.

### Supported Feedback

- Success notifications
- Error notifications
- Action confirmation
- Failed request feedback

### Example Flow

```text
User Performs Action
        │
        ▼
Action Completes
        │
        ├───────────────┐
        │               │
     Success          Failure
        │               │
        ▼               ▼
Success Toast       Error Toast
```

---

# 📂 Folder Structure

```text
social-feed-app/
│
├── public/
│
├── src/
│   │
│   ├── components/
│   │   │
│   │   ├── FeedContainer.tsx
│   │   ├── PostCard.tsx
│   │   ├── LikeButton.tsx
│   │   ├── CommentModal.tsx
│   │   ├── Navigation.tsx
│   │   ├── SearchAndFilter.tsx
│   │   ├── Toast.tsx
│   │   ├── Loading.tsx
│   │   └── ErrorState.tsx
│   │
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   ├── useIntersectionObserver.ts
│   │   └── usePosts.ts
│   │
│   ├── services/
│   │   └── api.ts
│   │
│   ├── types/
│   │   ├── post.ts
│   │   └── comment.ts
│   │
│   ├── utils/
│   │   └── helpers.ts
│   │
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
│
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

# 🛠️ Tech Stack

## Frontend

- React
- TypeScript
- Vite

## React Hooks

- `useState`
- `useEffect`
- `useRef`

## Custom Hooks

- `useDebounce`
- `useIntersectionObserver`
- Custom data-fetching logic

## API

- REST API
- JSONPlaceholder

## Browser APIs

- Intersection Observer API

## Styling

- CSS3
- Responsive CSS
- Media Queries

## Development Tools

- Node.js
- npm
- ESLint
- TypeScript

## Version Control

- Git
- GitHub

---

# 🧩 State Management

The application manages its state using React's built-in state management capabilities.

### Main State Areas

```text
Posts
Search Query
Filters
Loading State
Error State
Current Page
Has More Data
Selected Post
Comments Modal State
Like State
Toast State
```

The state is kept close to the components that require it, while shared feed-level state is managed at a higher application level.

---

# 🌐 API Integration

The application interacts with an external REST API for post and comment data.

### Fetch Posts

```text
GET /posts
```

### Fetch Comments

```text
GET /posts/:id/comments
```

### Update Post

```text
PATCH /posts/:id
```

API requests are handled asynchronously with proper loading and error states.

---

# ⚡ Performance Optimizations

The application incorporates several techniques to improve performance.

## 1. Debouncing

Prevents search logic from running on every keystroke.

## 2. Infinite Scrolling

Loads additional content only when required.

## 3. Intersection Observer

Efficiently detects when additional content should be loaded.

## 4. Incremental Data Loading

Posts are fetched and appended in batches rather than loading everything at once.

## 5. Optimistic Updates

Provides immediate UI feedback without waiting for API responses.

## 6. Reusable Components

Reduces duplicate rendering logic and improves maintainability.

## 7. Custom Hooks

Separates reusable behavior from UI components.

## 8. Efficient State Updates

Updates only the required parts of the feed when user interactions occur.

---

# 🛡️ Error Handling

The application handles different application states to provide a reliable user experience.

### Application States

```text
Loading
Success
Empty
Error
```

### Error Flow

```text
API Request
        │
        ▼
    Processing
        │
        ├───────────────┐
        │               │
     Success          Failure
        │               │
        ▼               ▼
Update UI        Update Error State
                        │
                        ▼
                  Display Error
                        │
                        ▼
                  Allow Recovery
```

---

# ♿ Accessibility

The application follows accessibility-focused frontend practices.

### Accessibility Considerations

- Semantic HTML elements
- Accessible buttons
- Keyboard navigation
- Focus management
- Clear interaction states
- Accessible modal behavior
- Meaningful labels
- Readable error messages
- Responsive layouts

---

# 📱 Responsive Design

The application is designed to provide a consistent experience across multiple screen sizes.

### Supported Devices

- Mobile
- Tablet
- Laptop
- Desktop

Responsive styling ensures that the feed, navigation, buttons, and modal components adapt to available screen space.

---

# 🚀 Getting Started

## Prerequisites

Make sure the following are installed:

- Node.js
- npm
- Git

---

## Installation

Clone the repository:

```bash
git clone <repository-url>
```

Navigate to the project directory:

```bash
cd social-feed-app
```

Install dependencies:

```bash
npm install
```

---

## Run the Development Server

```bash
npm run dev
```

The Vite development server will start and display the local application URL in the terminal.

---

# 🏭 Production Build

Create an optimized production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

---

# 🧪 Testing Strategy

The application can be tested across several important areas.

## Component Testing

- Post rendering
- Like button interactions
- Search input
- Filter interactions
- Comments modal
- Toast notifications

## State Testing

- Feed updates
- Pagination
- Loading states
- Error states
- Search state
- Filter state

## Infinite Scroll Testing

- Trigger visibility
- Observer activation
- Next-page loading
- Appending new posts

## Optimistic Update Testing

### Success Case

```text
Click Like
    │
    ▼
UI Updates Immediately
    │
    ▼
API Request Succeeds
    │
    ▼
Keep Updated State
```

### Failure Case

```text
Click Like
    │
    ▼
UI Updates Immediately
    │
    ▼
API Request Fails
    │
    ▼
Restore Previous State
    │
    ▼
Show Error Toast
```

---

# 📊 Feature Summary

| Feature | Status |
|---|---|
| Dynamic Post Feed | ✅ |
| REST API Integration | ✅ |
| Search | ✅ |
| Filtering | ✅ |
| Debounced Search | ✅ |
| Infinite Scrolling | ✅ |
| Intersection Observer | ✅ |
| Pagination | ✅ |
| Optimistic Updates | ✅ |
| Rollback Handling | ✅ |
| Comments Modal | ✅ |
| Toast Notifications | ✅ |
| Loading States | ✅ |
| Error Handling | ✅ |
| React Hooks | ✅ |
| Custom Hooks | ✅ |
| Responsive Design | ✅ |
| TypeScript | ✅ |

---

# 🧠 Key Concepts Demonstrated

This project demonstrates practical experience with:

- React component architecture
- React Hooks
- State management
- Custom Hooks
- REST API integration
- Asynchronous data handling
- Debouncing
- Search and filtering
- Infinite scrolling
- Intersection Observer API
- Optimistic UI updates
- State rollback
- Error recovery
- Modal management
- Toast notifications
- Responsive web design
- Frontend performance optimization

---

# 🔮 Future Enhancements

- User authentication
- Persistent likes
- Create and delete comments
- Save or bookmark posts
- Advanced filtering
- Server-side pagination
- API caching
- Dark mode
- Real-time updates using WebSockets
- User profiles
- Progressive Web App support
- Enhanced accessibility testing

---

# 📚 Learning Outcomes

Through this project, the following practical concepts are demonstrated:

- Managing complex application state in React
- Handling asynchronous API operations
- Building reusable and maintainable components
- Creating custom hooks for reusable logic
- Implementing efficient infinite scrolling
- Using Intersection Observer for viewport detection
- Optimizing search interactions with debouncing
- Implementing optimistic UI patterns
- Recovering from failed API requests using rollback
- Providing immediate feedback through toast notifications
- Designing scalable frontend application architecture
- Improving user experience through loading and error states

---

# 📄 License

This project is licensed under the MIT License.

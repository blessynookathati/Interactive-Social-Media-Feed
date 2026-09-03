import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://jsonplaceholder.typicode.com';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Curated author names and avatars for realistic social feed feel
const AUTHORS = [
  { name: 'Alex Rivera', handle: '@alexrivera', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { name: 'Sarah Chen', handle: '@sarahcodes', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
  { name: 'Marcus Brody', handle: '@marcus_b', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { name: 'Elena Rostova', handle: '@elenarostova', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
  { name: 'David Kim', handle: '@davidkim_dev', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
  { name: 'Chloe Martin', handle: '@chloemartin', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80' },
  { name: 'Liam O\'Connor', handle: '@liam_ux', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80' },
  { name: 'Zoe Washington', handle: '@zoewash', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80' },
  { name: 'Priya Sharma', handle: '@priyacodes', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' },
  { name: 'Devon Vance', handle: '@devon_v', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80' }
];

// Curated tech/creative post images
const POST_IMAGES = [
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=900&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=900&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=900&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=900&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=900&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=900&auto=format&fit=crop&q=80'
];

// Hashtag categories
const TAG_POOL = [
  '#react', '#frontend', '#javascript', '#webdev', '#css',
  '#performance', '#uiux', '#coding', '#tech', '#opensource'
];

/**
 * Transforms a raw API post into the application's required Post entity.
 * Contract Specification 2:
 * Must map returned data to include likeCount (integer), isLiked (boolean),
 * hashtags (array of strings), and createdAt (ISO date string).
 *
 * @param {Object} rawPost - The post from JSONPlaceholder.
 * @returns {Object} Augmented post with likes, date, author, and hashtags.
 */
export function transformPost(rawPost) {
  const authorIndex = (rawPost.userId ? rawPost.userId - 1 : 0) % AUTHORS.length;
  const author = AUTHORS[authorIndex];

  // Select 2-3 hashtags deterministically based on post ID
  const primaryTag = TAG_POOL[rawPost.id % TAG_POOL.length];
  const secondaryTag = TAG_POOL[(rawPost.id * 3) % TAG_POOL.length];
  const postSpecificTag = `#post${rawPost.id}`;
  const hashtags = Array.from(new Set([primaryTag, secondaryTag, postSpecificTag]));

  // Realistic random likes between 12 and 180 (deterministic per post id so reloads keep consistent initial count)
  const initialLikes = ((rawPost.id * 17 + 23) % 150) + 12;

  // Stagger creation dates: post 1 is recent, higher ids are older
  const hoursAgo = rawPost.id * 3.5;
  const createdAt = new Date(Date.now() - hoursAgo * 3600 * 1000).toISOString();

  // Every 2nd or 3rd post has a featured showcase image
  const hasImage = rawPost.id % 2 === 0;
  const imageUrl = hasImage ? POST_IMAGES[rawPost.id % POST_IMAGES.length] : null;

  return {
    ...rawPost,
    authorId: rawPost.userId,
    author,
    likeCount: initialLikes,
    isLiked: false,
    hashtags,
    createdAt,
    imageUrl,
    commentCount: ((rawPost.id * 7) % 15) + 3
  };
}

/**
 * Fetch paginated posts from JSONPlaceholder
 * @param {number} page
 * @param {number} limit
 * @param {Object} options - signal, etc.
 * @returns {Promise<{posts: Array, totalCount: number, hasMore: boolean}>}
 */
export async function fetchPosts(page = 1, limit = 10, options = {}) {
  const response = await apiClient.get('/posts', {
    params: {
      _page: page,
      _limit: limit
    },
    signal: options.signal
  });

  const totalHeader = response.headers['x-total-count'];
  const totalCount = totalHeader ? parseInt(totalHeader, 10) : 100;
  const rawPosts = response.data;
  const posts = rawPosts.map(transformPost);
  const hasMore = page * limit < totalCount && rawPosts.length === limit;

  return {
    posts,
    totalCount,
    hasMore
  };
}

/**
 * Fetch comments for a specific post
 * @param {number} postId
 * @param {Object} options - signal, etc.
 * @returns {Promise<Array>}
 */
export async function fetchComments(postId, options = {}) {
  const response = await apiClient.get(`/posts/${postId}/comments`, {
    signal: options.signal
  });
  return response.data;
}

/**
 * Simulate PATCH request to update a post's like status.
 * Supports forceFailure to demonstrate optimistic rollback.
 *
 * @param {number} postId
 * @param {boolean} isLiked
 * @param {Object} options - forceFailure flag or abort signal
 * @returns {Promise<Object>}
 */
export async function patchPostLike(postId, isLiked, options = {}) {
  // If forceFailure is requested (for reviewer testing or demo), reject immediately
  if (options.forceFailure) {
    // Artificial network delay before failure
    await new Promise((resolve) => setTimeout(resolve, 600));
    throw new Error('Simulated network failure: Server rejected like update (500).');
  }

  // Real request to JSONPlaceholder PATCH endpoint
  const response = await apiClient.patch(
    `/posts/${postId}`,
    { isLiked },
    { signal: options.signal }
  );

  return response.data;
}

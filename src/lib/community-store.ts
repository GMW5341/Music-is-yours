// ============================================================================
// Community Store
// 유저가 공유한 곡을 localStorage에 저장하고 커뮤니티 피드를 제공
// ============================================================================

export interface CommunityPost {
  id: string;
  songTitle: string;
  genre: string;
  bpm: number;
  key: string;
  scale: string;
  trackCount: number;
  authorId: string;
  authorName: string;
  message: string;
  createdAt: string;
  likes: string[];   // userId[]
  plays: number;
}

const STORE_KEY = "miy_community_posts";

function loadPosts(): CommunityPost[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CommunityPost[];
  } catch {
    return [];
  }
}

function savePosts(posts: CommunityPost[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORE_KEY, JSON.stringify(posts));
}

export function getCommunityPosts(sort: "latest" | "popular" = "latest"): CommunityPost[] {
  const posts = loadPosts();
  if (sort === "popular") {
    return posts.sort((a, b) => b.likes.length - a.likes.length);
  }
  return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function addCommunityPost(post: Omit<CommunityPost, "id" | "createdAt" | "likes" | "plays">): CommunityPost {
  const posts = loadPosts();
  const newPost: CommunityPost = {
    ...post,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    likes: [],
    plays: 0,
  };
  posts.unshift(newPost);
  savePosts(posts);
  return newPost;
}

export function toggleLike(postId: string, userId: string): boolean {
  const posts = loadPosts();
  const post = posts.find((p) => p.id === postId);
  if (!post) return false;

  const idx = post.likes.indexOf(userId);
  if (idx >= 0) {
    post.likes.splice(idx, 1);
  } else {
    post.likes.push(userId);
  }
  savePosts(posts);
  return idx < 0; // true if now liked
}

export function incrementPlays(postId: string): void {
  const posts = loadPosts();
  const post = posts.find((p) => p.id === postId);
  if (post) {
    post.plays++;
    savePosts(posts);
  }
}

export function getMyPosts(userId: string): CommunityPost[] {
  return loadPosts().filter((p) => p.authorId === userId);
}

import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { COMMUNITY, STORAGE_KEYS } from "./constants";
import type { CategoryBreakdown } from "@/types";

export type PostCategory = keyof CategoryBreakdown | "general";

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  category: PostCategory;
  co2SavedKg: number;
  createdAt: number; // epoch ms
  likedBy: string[];
}

export interface NewPost {
  text: string;
  category: PostCategory;
  co2SavedKg: number;
}

export interface CommunityStats {
  totalCo2Saved: number;
  contributors: number;
  steps: number;
  byCategory: { category: PostCategory; value: number }[];
  leaderboard: { name: string; co2: number; steps: number }[];
}

const LS_POSTS = STORAGE_KEYS.communityPosts;
const POSTS_LIMIT = COMMUNITY.postsLimit;

// ── Demo-mode store (localStorage) — keeps the feature usable without Firebase
function readLocal(): CommunityPost[] {
  try {
    return JSON.parse(localStorage.getItem(LS_POSTS) || "[]") as CommunityPost[];
  } catch {
    return [];
  }
}
function writeLocal(posts: CommunityPost[]) {
  localStorage.setItem(LS_POSTS, JSON.stringify(posts));
}

/** Subscribe to the community feed (newest first). Returns an unsubscribe fn. */
export function subscribePosts(cb: (posts: CommunityPost[]) => void): () => void {
  if (isFirebaseConfigured && db) {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(POSTS_LIMIT));
    return onSnapshot(q, (snap) => {
      const posts = snap.docs.map((d) => {
        const data = d.data({ serverTimestamps: "estimate" });
        const ts = data.createdAt;
        return {
          id: d.id,
          authorId: data.authorId,
          authorName: data.authorName,
          text: data.text,
          category: data.category,
          co2SavedKg: data.co2SavedKg ?? 0,
          createdAt: ts && typeof ts.toMillis === "function" ? ts.toMillis() : Date.now(),
          likedBy: data.likedBy ?? [],
        } as CommunityPost;
      });
      cb(posts);
    });
  }
  cb(readLocal());
  // React to posts made in other tabs (demo mode).
  const handler = (e: StorageEvent) => {
    if (e.key === LS_POSTS) cb(readLocal());
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

export async function createPost(
  author: { uid: string; displayName: string },
  input: NewPost,
): Promise<void> {
  const text = input.text.trim().slice(0, COMMUNITY.maxPostLength);
  if (!text) return;
  const co2 = Math.max(0, Math.min(100000, Math.round(input.co2SavedKg || 0)));

  if (isFirebaseConfigured && db) {
    await addDoc(collection(db, "posts"), {
      authorId: author.uid,
      authorName: author.displayName,
      text,
      category: input.category,
      co2SavedKg: co2,
      createdAt: serverTimestamp(),
      likedBy: [],
    });
    return;
  }
  const posts = readLocal();
  posts.unshift({
    id: `local-${posts.length}-${Math.round(performance.now())}`,
    authorId: author.uid,
    authorName: author.displayName,
    text,
    category: input.category,
    co2SavedKg: co2,
    createdAt: Date.now(),
    likedBy: [],
  });
  writeLocal(posts.slice(0, POSTS_LIMIT));
  window.dispatchEvent(new StorageEvent("storage", { key: LS_POSTS }));
}

export async function toggleLike(post: CommunityPost, uid: string): Promise<void> {
  const liked = post.likedBy.includes(uid);
  if (isFirebaseConfigured && db) {
    await updateDoc(doc(db, "posts", post.id), {
      likedBy: liked ? arrayRemove(uid) : arrayUnion(uid),
    });
    return;
  }
  const posts = readLocal().map((p) =>
    p.id === post.id
      ? { ...p, likedBy: liked ? p.likedBy.filter((u) => u !== uid) : [...p.likedBy, uid] }
      : p,
  );
  writeLocal(posts);
  window.dispatchEvent(new StorageEvent("storage", { key: LS_POSTS }));
}

export async function deletePost(postId: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    await deleteDoc(doc(db, "posts", postId));
    return;
  }
  writeLocal(readLocal().filter((p) => p.id !== postId));
  window.dispatchEvent(new StorageEvent("storage", { key: LS_POSTS }));
}

export function computeStats(posts: CommunityPost[]): CommunityStats {
  const totalCo2Saved = posts.reduce((s, p) => s + (p.co2SavedKg || 0), 0);
  const contributors = new Set(posts.map((p) => p.authorId)).size;

  const catMap = new Map<PostCategory, number>();
  for (const p of posts)
    catMap.set(p.category, (catMap.get(p.category) || 0) + (p.co2SavedKg || 0));
  const byCategory = [...catMap.entries()]
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value);

  const board = new Map<string, { name: string; co2: number; steps: number }>();
  for (const p of posts) {
    const cur = board.get(p.authorId) || { name: p.authorName, co2: 0, steps: 0 };
    cur.co2 += p.co2SavedKg || 0;
    cur.steps += 1;
    board.set(p.authorId, cur);
  }
  const leaderboard = [...board.values()]
    .sort((a, b) => b.co2 - a.co2 || b.steps - a.steps)
    .slice(0, 5);

  return { totalCo2Saved, contributors, steps: posts.length, byCategory, leaderboard };
}

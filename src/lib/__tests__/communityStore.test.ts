import { describe, it, expect, vi, type Mock } from "vitest";
import {
  createPost,
  subscribePosts,
  toggleLike,
  deletePost,
  type CommunityPost,
} from "@/lib/community";

// In the test env Firebase is unconfigured, so the community store uses its
// localStorage demo-mode path. `setup.ts` clears localStorage between tests.
const author = { uid: "u1", displayName: "Aarav" };

/** The most recent posts array a subscriber callback received. */
const latestPosts = (cb: Mock): CommunityPost[] => {
  const { calls } = cb.mock;
  return calls[calls.length - 1][0] as CommunityPost[];
};

describe("community store (demo mode)", () => {
  it("createPost adds a post that subscribers receive", async () => {
    const cb = vi.fn();
    const unsub = subscribePosts(cb); // initial call with []
    await createPost(author, { text: "Switched to LED bulbs", category: "home", co2SavedKg: 90 });

    const latest = latestPosts(cb);
    expect(latest).toHaveLength(1);
    expect(latest[0]).toMatchObject({
      text: "Switched to LED bulbs",
      authorId: "u1",
      authorName: "Aarav",
      co2SavedKg: 90,
      likedBy: [],
    });
    unsub();
  });

  it("trims the text and clamps a negative CO2 value", async () => {
    const cb = vi.fn();
    const unsub = subscribePosts(cb);
    await createPost(author, { text: "  spaced out  ", category: "general", co2SavedKg: -5 });

    const post = latestPosts(cb)[0];
    expect(post.text).toBe("spaced out");
    expect(post.co2SavedKg).toBe(0);
    unsub();
  });

  it("ignores an empty post", async () => {
    const cb = vi.fn();
    const unsub = subscribePosts(cb);
    await createPost(author, { text: "   ", category: "general", co2SavedKg: 0 });
    expect(latestPosts(cb)).toHaveLength(0);
    unsub();
  });

  it("toggleLike adds then removes the caller's uid", async () => {
    await createPost(author, { text: "post", category: "general", co2SavedKg: 0 });
    let posts: CommunityPost[] = [];
    const unsub = subscribePosts((p) => (posts = p));

    await toggleLike(posts[0], "u2");
    expect(posts[0].likedBy).toContain("u2");

    await toggleLike(posts[0], "u2");
    expect(posts[0].likedBy).not.toContain("u2");
    unsub();
  });

  it("deletePost removes the post", async () => {
    await createPost(author, { text: "to delete", category: "general", co2SavedKg: 0 });
    let posts: CommunityPost[] = [];
    const unsub = subscribePosts((p) => (posts = p));
    expect(posts).toHaveLength(1);

    await deletePost(posts[0].id);
    expect(posts).toHaveLength(0);
    unsub();
  });
});

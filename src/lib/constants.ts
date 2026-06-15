/**
 * App-wide constants and configuration.
 *
 * Single source of truth for values that would otherwise be repeated as magic
 * strings/numbers across the codebase (storage keys, region, limits). Keeping
 * them here makes the app easier to reason about and safer to change.
 */

export const APP_NAME = "Prithvi";

/** Region the callable Cloud Functions are deployed to (must match functions/). */
export const FUNCTIONS_REGION = "asia-south1";

/** Namespaced localStorage keys (theme, demo-mode auth/data, community feed). */
export const STORAGE_KEYS = {
  theme: "prithvi.theme",
  demoUsers: "prithvi.demo.users",
  demoSession: "prithvi.demo.session",
  communityPosts: "prithvi.community.posts",
  /** Per-user data document key used in demo mode. */
  userData: (uid: string) => `prithvi.data.${uid}`,
} as const;

/** Community forum limits, mirrored by the Firestore security rules. */
export const COMMUNITY = {
  postsLimit: 200,
  maxPostLength: 1000,
  maxBillSizeMb: 4,
} as const;

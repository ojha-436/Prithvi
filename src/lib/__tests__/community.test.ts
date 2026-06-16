import { describe, it, expect } from "vitest";
import { computeStats, type CommunityPost } from "@/lib/community";

const mk = (over: Partial<CommunityPost>): CommunityPost => ({
  id: Math.random().toString(36).slice(2),
  authorId: "a",
  authorName: "A",
  text: "did a thing",
  category: "general",
  co2SavedKg: 0,
  createdAt: 0,
  likedBy: [],
  ...over,
});

describe("computeStats", () => {
  it("returns zeros for an empty community", () => {
    const s = computeStats([]);
    expect(s).toMatchObject({ totalCo2Saved: 0, contributors: 0, steps: 0 });
    expect(s.byCategory).toEqual([]);
    expect(s.leaderboard).toEqual([]);
  });

  it("aggregates totals, contributors, categories and leaderboard", () => {
    const posts = [
      mk({ authorId: "a", authorName: "Aarav", category: "home", co2SavedKg: 100 }),
      mk({ authorId: "a", authorName: "Aarav", category: "travel", co2SavedKg: 50 }),
      mk({ authorId: "b", authorName: "Bina", category: "home", co2SavedKg: 200 }),
    ];
    const s = computeStats(posts);
    expect(s.totalCo2Saved).toBe(350);
    expect(s.contributors).toBe(2);
    expect(s.steps).toBe(3);
    // category sorted by value desc
    expect(s.byCategory[0]).toEqual({ category: "home", value: 300 });
    expect(s.byCategory[1]).toEqual({ category: "travel", value: 50 });
    // leaderboard sorted by CO2 desc → Bina (200) before Aarav (150)
    expect(s.leaderboard[0]).toMatchObject({ name: "Bina", co2: 200, steps: 1 });
    expect(s.leaderboard[1]).toMatchObject({ name: "Aarav", co2: 150, steps: 2 });
  });

  it("handles posts with zero co2SavedKg without corrupting totals", () => {
    const posts = [
      mk({ authorId: "a", authorName: "A", co2SavedKg: 0 }),
      mk({ authorId: "b", authorName: "B", co2SavedKg: 50 }),
    ];
    const s = computeStats(posts);
    expect(s.totalCo2Saved).toBe(50);
    expect(s.contributors).toBe(2);
    expect(s.steps).toBe(2);
  });

  it("caps the leaderboard at 5 entries regardless of number of contributors", () => {
    const posts = Array.from({ length: 10 }, (_, i) =>
      mk({ authorId: `user-${i}`, authorName: `User ${i}`, co2SavedKg: i * 10 }),
    );
    expect(computeStats(posts).leaderboard).toHaveLength(5);
  });

  it("sorts leaderboard by CO2 desc, then steps desc as tiebreaker", () => {
    const posts = [
      mk({ authorId: "a", authorName: "A", co2SavedKg: 100 }),
      mk({ authorId: "b", authorName: "B", co2SavedKg: 100 }),
      mk({ authorId: "b", authorName: "B", co2SavedKg: 0 }),
    ];
    const lb = computeStats(posts).leaderboard;
    // B has same CO2 (100) but more steps (2) → should rank first
    expect(lb[0].name).toBe("B");
    expect(lb[0].steps).toBe(2);
  });
});

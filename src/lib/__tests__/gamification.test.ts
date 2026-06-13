import { describe, it, expect } from "vitest";
import {
  initGameState,
  registerActivity,
  completePledge,
  refreshBadges,
  nextBadge,
} from "@/lib/gamification";

function isoOffset(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

describe("gamification", () => {
  it("initialises an empty state", () => {
    const s = initGameState();
    expect(s).toMatchObject({ points: 0, streakDays: 0, co2SavedKg: 0, badges: [], completedPledges: [] });
  });

  it("starts a streak and awards the first-step badge on first activity", () => {
    const s = registerActivity(initGameState());
    expect(s.streakDays).toBe(1);
    expect(s.points).toBe(5);
    expect(s.badges).toContain("first-step");
  });

  it("is idempotent within the same day", () => {
    const once = registerActivity(initGameState());
    const twice = registerActivity(once);
    expect(twice).toBe(once);
  });

  it("increments the streak on consecutive days", () => {
    const yesterday = { ...initGameState(), lastActiveDate: isoOffset(-1), streakDays: 3, points: 10 };
    const next = registerActivity(yesterday);
    expect(next.streakDays).toBe(4);
    expect(next.points).toBe(15);
  });

  it("resets the streak after a missed day", () => {
    const stale = { ...initGameState(), lastActiveDate: isoOffset(-3), streakDays: 9 };
    expect(registerActivity(stale).streakDays).toBe(1);
  });

  it("records a pledge once and accumulates CO2 saved + points", () => {
    const pledge = { id: "p1", title: "Test", savingKg: 300, completedAt: 0 };
    const after = completePledge(initGameState(), pledge);
    expect(after.co2SavedKg).toBe(300);
    expect(after.points).toBe(60); // max(20, 300/5)
    expect(after.completedPledges).toHaveLength(1);
    // duplicate pledge id is ignored
    const again = completePledge(after, pledge);
    expect(again.completedPledges).toHaveLength(1);
  });

  it("unlocks threshold badges via refreshBadges", () => {
    const s = refreshBadges({ ...initGameState(), co2SavedKg: 120, streakDays: 7, points: 1 });
    expect(s.badges).toEqual(expect.arrayContaining(["saver-100", "week-streak", "first-step"]));
    expect(s.badges).not.toContain("saver-500");
  });

  it("points to the lowest-threshold unearned badge next", () => {
    const n = nextBadge(initGameState());
    expect(n?.id).toBe("first-step");
  });
});

import type { GamificationState, Pledge } from "@/types";

export const BADGES: { id: string; name: string; desc: string; threshold: number; metric: "points" | "co2" | "streak" }[] = [
  { id: "first-step", name: "First Step", desc: "Logged your first footprint", threshold: 1, metric: "points" },
  { id: "week-streak", name: "Consistent", desc: "7-day tracking streak", threshold: 7, metric: "streak" },
  { id: "saver-100", name: "Century Saver", desc: "Saved 100 kg CO₂e", threshold: 100, metric: "co2" },
  { id: "saver-500", name: "Climate Ally", desc: "Saved 500 kg CO₂e", threshold: 500, metric: "co2" },
  { id: "saver-1000", name: "Carbon Warrior", desc: "Saved 1 tonne CO₂e", threshold: 1000, metric: "co2" },
  { id: "points-500", name: "Changemaker", desc: "Earned 500 points", threshold: 500, metric: "points" },
];

export function initGameState(): GamificationState {
  return {
    points: 0,
    streakDays: 0,
    lastActiveDate: "",
    badges: [],
    completedPledges: [],
    co2SavedKg: 0,
  };
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

/** Call when the user opens / logs activity. Maintains the daily streak. */
export function registerActivity(state: GamificationState): GamificationState {
  const today = todayISO();
  if (state.lastActiveDate === today) return state;
  const gap = state.lastActiveDate ? daysBetween(state.lastActiveDate, today) : 0;
  const streakDays = gap === 1 ? state.streakDays + 1 : 1;
  return refreshBadges({
    ...state,
    streakDays,
    lastActiveDate: today,
    points: state.points + 5,
  });
}

export function completePledge(state: GamificationState, pledge: Pledge): GamificationState {
  if (state.completedPledges.some((p) => p.id === pledge.id)) return state;
  return refreshBadges({
    ...state,
    points: state.points + Math.max(20, Math.round(pledge.savingKg / 5)),
    co2SavedKg: state.co2SavedKg + pledge.savingKg,
    completedPledges: [...state.completedPledges, pledge],
  });
}

export function refreshBadges(state: GamificationState): GamificationState {
  const earned = new Set(state.badges);
  for (const b of BADGES) {
    const value = b.metric === "points" ? state.points : b.metric === "co2" ? state.co2SavedKg : state.streakDays;
    if (value >= b.threshold) earned.add(b.id);
  }
  return { ...state, badges: Array.from(earned) };
}

/** Progress toward the next unearned badge, for the dashboard progress ring. */
export function nextBadge(state: GamificationState) {
  const remaining = BADGES.filter((b) => !state.badges.includes(b.id));
  if (remaining.length === 0) return null;
  return remaining.sort((a, b) => a.threshold - b.threshold)[0];
}

import { describe, it, expect } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { computeFootprint, EMPTY_LIFESTYLE } from "@/lib/emissions";
import { registerActivity } from "@/lib/gamification";

const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>;

describe("AuthContext data mutations (demo mode)", () => {
  it("keeps the footprint when updateGame runs right after saveFootprint (regression)", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signUp("race@prithvi.test", "secret1", "Race Tester");
    });
    await waitFor(() => expect(result.current.userData).toBeTruthy());

    const lifestyle = EMPTY_LIFESTYLE;
    const footprint = computeFootprint(lifestyle);

    // Reproduces the original bug: two sequential commits from the same render.
    await act(async () => {
      await result.current.saveFootprint(lifestyle, footprint);
      await result.current.updateGame(registerActivity(result.current.userData!.game));
    });

    // Before the ref-based fix, updateGame clobbered the footprint here.
    expect(result.current.userData?.footprint?.total).toBe(footprint.total);
    expect(result.current.userData?.lifestyle).toBeTruthy();
    expect(result.current.userData?.game.points).toBeGreaterThan(0);
  });

  it("persists onboarding profile via saveProfile", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.signUp("p@prithvi.test", "secret1", "P");
    });
    await waitFor(() => expect(result.current.userData).toBeTruthy());

    await act(async () => {
      await result.current.saveProfile({ city: "Pune", state: "Maharashtra", householdSize: 4 });
    });

    expect(result.current.userData?.profile.onboarded).toBe(true);
    expect(result.current.userData?.profile.city).toBe("Pune");
  });
});

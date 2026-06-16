import { describe, it, expect } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "@/context/auth-context";
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

  it("throws an error when signing in with the wrong password", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signUp("wrongpw@prithvi.test", "correct-pass", "Test User");
    });

    await act(async () => {
      await result.current.signOut();
    });
    await waitFor(() => expect(result.current.user).toBeNull());

    await expect(
      act(async () => {
        await result.current.signIn("wrongpw@prithvi.test", "wrong-pass");
      }),
    ).rejects.toThrow("Invalid email or password.");
  });

  it("clears user and userData after signOut", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signUp("signout@prithvi.test", "pass123", "Sign Out User");
    });
    await waitFor(() => expect(result.current.user).not.toBeNull());

    await act(async () => {
      await result.current.signOut();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.userData).toBeNull();
  });

  it("allows sign-in after sign-up with the same credentials", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    const email = "signin-roundtrip@prithvi.test";
    await act(async () => {
      await result.current.signUp(email, "mypass123", "Round Trip");
    });
    await act(async () => {
      await result.current.signOut();
    });
    await waitFor(() => expect(result.current.user).toBeNull());

    await act(async () => {
      await result.current.signIn(email, "mypass123");
    });

    expect(result.current.user?.email).toBe(email);
    expect(result.current.userData).not.toBeNull();
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "@/hooks/useDebounce";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("useDebounce", () => {
  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("a", 300));
    expect(result.current).toBe("a");
  });

  it("only updates after the delay has elapsed", () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 300), {
      initialProps: { v: "a" },
    });

    rerender({ v: "b" });
    expect(result.current).toBe("a"); // not yet

    act(() => vi.advanceTimersByTime(299));
    expect(result.current).toBe("a"); // still waiting

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe("b"); // settled
  });

  it("resets the timer on rapid changes (only the last value lands)", () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 300), {
      initialProps: { v: "1" },
    });

    rerender({ v: "2" });
    act(() => vi.advanceTimersByTime(200));
    rerender({ v: "3" });
    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe("1"); // neither settled yet

    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe("3"); // last value wins
  });
});

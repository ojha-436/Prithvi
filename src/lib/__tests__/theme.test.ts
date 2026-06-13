import { describe, it, expect, afterEach } from "vitest";
import { applyStoredTheme } from "@/lib/theme";

afterEach(() => {
  document.documentElement.classList.remove("dark");
  localStorage.clear();
});

describe("applyStoredTheme", () => {
  it("enables dark mode when stored preference is dark", () => {
    localStorage.setItem("prithvi.theme", "dark");
    applyStoredTheme();
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("disables dark mode when stored preference is light", () => {
    document.documentElement.classList.add("dark");
    localStorage.setItem("prithvi.theme", "light");
    applyStoredTheme();
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});

import { STORAGE_KEYS } from "./constants";

/** Apply the saved (or system-preferred) colour theme to <html>. */
export function applyStoredTheme() {
  const stored = localStorage.getItem(STORAGE_KEYS.theme);
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  const dark = stored ? stored === "dark" : prefersDark;
  document.documentElement.classList.toggle("dark", dark);
}

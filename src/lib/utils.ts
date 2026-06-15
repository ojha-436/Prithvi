import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format kilograms of CO2e into a compact, human label. */
export function formatCO2(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toLocaleString("en-IN", { maximumFractionDigits: 2 })} t`;
  return `${Math.round(kg).toLocaleString("en-IN")} kg`;
}

export function formatNumber(n: number, digits = 0): string {
  return n.toLocaleString("en-IN", { maximumFractionDigits: digits });
}

/** Compact relative time, e.g. "just now", "5m ago", "2d ago", or a date. */
export function timeAgo(ms: number): string {
  const seconds = Math.max(1, Math.round((Date.now() - ms) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ms).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

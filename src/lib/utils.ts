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

import { describe, it, expect } from "vitest";
import {
  COUNTRY_STATS,
  INDIA_SOURCE_SPLIT,
  LEARN_FACTS,
  SUSTAINABLE_TARGET_TONNES,
} from "@/lib/countryData";

describe("countryData", () => {
  it("highlights India and keeps it the lowest among listed countries", () => {
    const india = COUNTRY_STATS.find((c) => c.code === "IN");
    expect(india?.highlight).toBe(true);
    const min = Math.min(...COUNTRY_STATS.map((c) => c.perCapitaTonnes));
    expect(india?.perCapitaTonnes).toBe(min);
  });

  it("includes the key comparison countries (India, Japan, USA)", () => {
    const codes = COUNTRY_STATS.map((c) => c.code);
    expect(codes).toEqual(expect.arrayContaining(["IN", "JP", "US"]));
  });

  it("has an India source split that sums to 100%", () => {
    const total = INDIA_SOURCE_SPLIT.reduce((s, x) => s + x.value, 0);
    expect(total).toBe(100);
  });

  it("uses a sane 1.5°C per-capita target", () => {
    expect(SUSTAINABLE_TARGET_TONNES).toBeGreaterThan(1);
    expect(SUSTAINABLE_TARGET_TONNES).toBeLessThan(3);
  });

  it("provides three learn facts", () => {
    expect(LEARN_FACTS).toHaveLength(3);
    LEARN_FACTS.forEach((f) => expect(f.stat && f.label).toBeTruthy());
  });
});

import { describe, it, expect } from "vitest";
import {
  calculateVsIndia,
  computeFootprint,
  EMPTY_LIFESTYLE,
  FACTORS,
  INDIA_PER_CAPITA_KG,
} from "@/lib/emissions";
import type { LifestyleInput } from "@/types";

describe("calculateVsIndia", () => {
  it("expresses a footprint as a percentage of India's per-capita average", () => {
    expect(calculateVsIndia(INDIA_PER_CAPITA_KG)).toBe(100);
    expect(calculateVsIndia(INDIA_PER_CAPITA_KG / 2)).toBe(50);
    expect(calculateVsIndia(INDIA_PER_CAPITA_KG * 2)).toBe(200);
    expect(calculateVsIndia(0)).toBe(0);
  });
});

const base: LifestyleInput = {
  monthlyElectricityKwh: 100,
  hasSolar: false,
  lpgCylindersPerMonth: 0,
  commuteMode: "walk-cycle",
  commuteKmPerDay: 0,
  flightsShortHaulPerYear: 0,
  flightsLongHaulPerYear: 0,
  diet: "vegan",
  shoppingSpendPerMonth: 0,
  dineOutPerWeek: 0,
};

describe("computeFootprint", () => {
  it("computes home + food for a minimal profile", () => {
    const r = computeFootprint(base);
    // 100 kWh * 12 * 0.71 = 852 ; vegan diet = 1000
    expect(r.breakdown.home).toBe(852);
    expect(r.breakdown.food).toBe(1000);
    expect(r.breakdown.travel).toBe(0);
    expect(r.breakdown.goods).toBe(0);
    expect(r.total).toBe(1852);
  });

  it("applies the rooftop-solar offset to home energy", () => {
    const withSolar = computeFootprint({ ...base, hasSolar: true });
    const without = computeFootprint(base);
    expect(withSolar.breakdown.home).toBeLessThan(without.breakdown.home);
    // 60% offset → 40% remains
    expect(withSolar.breakdown.home).toBe(
      Math.round(without.breakdown.home * (1 - FACTORS.solarOffset)),
    );
  });

  it("keeps total equal to the sum of categories", () => {
    const r = computeFootprint(EMPTY_LIFESTYLE);
    const sum = r.breakdown.home + r.breakdown.travel + r.breakdown.food + r.breakdown.goods;
    expect(r.total).toBe(sum);
    expect(r.perCapitaIndia).toBe(INDIA_PER_CAPITA_KG);
  });

  it("ranks an EV commute below a petrol car for the same distance", () => {
    const petrol = computeFootprint({ ...base, commuteMode: "car-petrol", commuteKmPerDay: 30 });
    const ev = computeFootprint({ ...base, commuteMode: "car-ev", commuteKmPerDay: 30 });
    expect(petrol.breakdown.travel).toBeGreaterThan(ev.breakdown.travel);
  });

  it("counts long-haul flights as a major contributor", () => {
    const r = computeFootprint({ ...base, flightsLongHaulPerYear: 1 });
    expect(r.breakdown.travel).toBe(FACTORS.flightLongHaul);
  });

  it("never returns negative numbers", () => {
    const r = computeFootprint(base);
    Object.values(r.breakdown).forEach((v) => expect(v).toBeGreaterThanOrEqual(0));
    expect(r.total).toBeGreaterThanOrEqual(0);
  });

  it("clamps negative inputs to zero so output stays non-negative", () => {
    const r = computeFootprint({
      ...base,
      monthlyElectricityKwh: -500,
      lpgCylindersPerMonth: -10,
      commuteKmPerDay: -50,
      flightsShortHaulPerYear: -3,
      flightsLongHaulPerYear: -1,
      dineOutPerWeek: -7,
      shoppingSpendPerMonth: -9999,
    });
    Object.values(r.breakdown).forEach((v) => expect(v).toBeGreaterThanOrEqual(0));
    expect(r.total).toBeGreaterThanOrEqual(0);
  });

  it("orders diet emissions: vegan < vegetarian < eggetarian < occasional-meat < regular-meat", () => {
    const diets = ["vegan", "vegetarian", "eggetarian", "occasional-meat", "regular-meat"] as const;
    const totals = diets.map((diet) => computeFootprint({ ...base, diet }).breakdown.food);
    for (let i = 1; i < totals.length; i++) {
      expect(totals[i]).toBeGreaterThan(totals[i - 1]);
    }
  });

  it("hasSolar=true always reduces home emissions vs no solar for identical input", () => {
    const profiles: LifestyleInput[] = [
      { ...base, monthlyElectricityKwh: 50 },
      { ...base, monthlyElectricityKwh: 300 },
      { ...base, monthlyElectricityKwh: 0 },
    ];
    for (const p of profiles) {
      const withSolar = computeFootprint({ ...p, hasSolar: true }).breakdown.home;
      const noSolar = computeFootprint({ ...p, hasSolar: false }).breakdown.home;
      expect(withSolar).toBeLessThanOrEqual(noSolar);
    }
  });
});

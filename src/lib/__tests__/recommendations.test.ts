import { describe, it, expect } from "vitest";
import { generateRecommendations } from "@/lib/recommendations";
import { computeFootprint } from "@/lib/emissions";
import type { LifestyleInput } from "@/types";

const heavy: LifestyleInput = {
  monthlyElectricityKwh: 400,
  hasSolar: false,
  lpgCylindersPerMonth: 2,
  commuteMode: "car-petrol",
  commuteKmPerDay: 30,
  flightsShortHaulPerYear: 2,
  flightsLongHaulPerYear: 1,
  diet: "regular-meat",
  shoppingSpendPerMonth: 12000,
  dineOutPerWeek: 5,
};

const light: LifestyleInput = {
  monthlyElectricityKwh: 80,
  hasSolar: true,
  lpgCylindersPerMonth: 0,
  commuteMode: "walk-cycle",
  commuteKmPerDay: 0,
  flightsShortHaulPerYear: 0,
  flightsLongHaulPerYear: 0,
  diet: "vegan",
  shoppingSpendPerMonth: 1000,
  dineOutPerWeek: 0,
};

describe("generateRecommendations", () => {
  it("returns impact-ranked, positive-saving actions for a heavy lifestyle", () => {
    const recs = generateRecommendations(heavy, computeFootprint(heavy));
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.length).toBeLessThanOrEqual(6);
    recs.forEach((r) => {
      expect(r.estimatedSavingKg).toBeGreaterThan(0);
      expect(r.source).toBe("engine");
    });
    // sorted descending by saving
    for (let i = 1; i < recs.length; i++) {
      expect(recs[i - 1].estimatedSavingKg).toBeGreaterThanOrEqual(recs[i].estimatedSavingKg);
    }
  });

  it("surfaces lifestyle-specific actions (commute, flights, diet) for the heavy profile", () => {
    const ids = generateRecommendations(heavy, computeFootprint(heavy)).map((r) => r.id);
    expect(ids).toContain("commute-switch");
    expect(ids).toContain("flights-reduce");
    expect(ids).toContain("meat-free-days");
  });

  it("still gives at least one baseline action to an already-green user", () => {
    const recs = generateRecommendations(light, computeFootprint(light));
    expect(recs.length).toBeGreaterThanOrEqual(1);
    expect(recs.map((r) => r.id)).toContain("led-switch");
  });

  it("triggers dine-in recommendation when eating out more than 3 times per week", () => {
    const dineOut: LifestyleInput = { ...light, dineOutPerWeek: 5 };
    const ids = generateRecommendations(dineOut, computeFootprint(dineOut)).map((r) => r.id);
    expect(ids).toContain("dine-in");
  });

  it("triggers mindful-buying recommendation for high shopping spend", () => {
    const shopper: LifestyleInput = { ...light, shoppingSpendPerMonth: 15000 };
    const ids = generateRecommendations(shopper, computeFootprint(shopper)).map((r) => r.id);
    expect(ids).toContain("mindful-buying");
  });

  it("every recommendation has all required fields with valid values", () => {
    const recs = generateRecommendations(heavy, computeFootprint(heavy));
    for (const r of recs) {
      expect(r.id).toBeTruthy();
      expect(r.title).toBeTruthy();
      expect(r.detail).toBeTruthy();
      expect(["home", "travel", "food", "goods"]).toContain(r.category);
      expect(["easy", "medium", "ambitious"]).toContain(r.effort);
      expect(r.estimatedSavingKg).toBeGreaterThan(0);
      expect(r.source).toBe("engine");
    }
  });
});

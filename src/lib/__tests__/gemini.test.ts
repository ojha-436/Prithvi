import { describe, it, expect } from "vitest";
import { billToMonthlyKwh, getRecommendations, getInsight, extractBillData } from "@/lib/gemini";
import { computeFootprint, EMPTY_LIFESTYLE } from "@/lib/emissions";

describe("billToMonthlyKwh", () => {
  it("divides total units by the billing period", () => {
    expect(billToMonthlyKwh(480, 2)).toBe(240);
    expect(billToMonthlyKwh(250, 1)).toBe(250);
  });

  it("assumes one month when the period is missing", () => {
    expect(billToMonthlyKwh(300, null)).toBe(300);
    expect(billToMonthlyKwh(300, 0)).toBe(300);
  });

  it("rounds to a whole number", () => {
    expect(billToMonthlyKwh(500, 3)).toBe(167);
  });

  it("returns null when there is no usable reading", () => {
    expect(billToMonthlyKwh(null, 2)).toBeNull();
    expect(billToMonthlyKwh(0, 1)).toBeNull();
  });
});

// In test env VITE_GEMINI_API_KEY is undefined and VITE_GEMINI_VIA_FUNCTIONS is not "true",
// so both getRecommendations and getInsight always use the deterministic fallback path.
describe("getRecommendations (fallback mode)", () => {
  it("returns a non-empty array from the rule engine when Gemini is not configured", async () => {
    const footprint = computeFootprint(EMPTY_LIFESTYLE);
    const recs = await getRecommendations(EMPTY_LIFESTYLE, footprint);
    expect(recs.length).toBeGreaterThan(0);
    recs.forEach((r) => {
      expect(r.source).toBe("engine");
      expect(r.estimatedSavingKg).toBeGreaterThan(0);
      expect(r.category).toMatch(/^(home|travel|food|goods)$/);
    });
  });

  it("results are sorted descending by estimatedSavingKg", async () => {
    const footprint = computeFootprint(EMPTY_LIFESTYLE);
    const recs = await getRecommendations(EMPTY_LIFESTYLE, footprint);
    for (let i = 1; i < recs.length; i++) {
      expect(recs[i - 1].estimatedSavingKg).toBeGreaterThanOrEqual(recs[i].estimatedSavingKg);
    }
  });
});

describe("getInsight (fallback mode)", () => {
  it("returns a non-empty string when Gemini is not configured", async () => {
    const footprint = computeFootprint(EMPTY_LIFESTYLE);
    const text = await getInsight(footprint);
    expect(typeof text).toBe("string");
    expect(text.length).toBeGreaterThan(10);
  });

  it("mentions the biggest category for a high-footprint user", async () => {
    const heavyLifestyle = {
      ...EMPTY_LIFESTYLE,
      flightsLongHaulPerYear: 5,
      commuteMode: "car-petrol" as const,
      commuteKmPerDay: 60,
    };
    const footprint = computeFootprint(heavyLifestyle);
    const text = await getInsight(footprint);
    expect(text.length).toBeGreaterThan(10);
  });

  it("returns a below-average message for a low-footprint user", async () => {
    const greenLifestyle = {
      ...EMPTY_LIFESTYLE,
      monthlyElectricityKwh: 50,
      hasSolar: true,
      lpgCylindersPerMonth: 0,
      commuteMode: "walk-cycle" as const,
      commuteKmPerDay: 0,
      diet: "vegan" as const,
      flightsShortHaulPerYear: 0,
      flightsLongHaulPerYear: 0,
      dineOutPerWeek: 0,
      shoppingSpendPerMonth: 500,
    };
    const footprint = computeFootprint(greenLifestyle);
    // total ≈ 1380 kg vs India avg 2000 kg → vsIndia < 100 → below-average branch
    expect(footprint.total).toBeLessThan(footprint.perCapitaIndia);
    const text = await getInsight(footprint);
    expect(text).toMatch(/below|strong|already/i);
  });
});

describe("extractBillData", () => {
  it("throws when Firebase Functions are not configured", async () => {
    const fakeFile = new File([""], "bill.jpg", { type: "image/jpeg" });
    await expect(extractBillData(fakeFile)).rejects.toThrow(
      "Bill scanning is only available in the deployed app.",
    );
  });
});

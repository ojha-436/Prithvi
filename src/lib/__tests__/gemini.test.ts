import { describe, it, expect } from "vitest";
import { billToMonthlyKwh } from "@/lib/gemini";

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

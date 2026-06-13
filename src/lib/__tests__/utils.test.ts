import { describe, it, expect } from "vitest";
import { cn, formatCO2, formatNumber } from "@/lib/utils";

describe("formatCO2", () => {
  it("shows kilograms below a tonne", () => {
    expect(formatCO2(500)).toBe("500 kg");
    expect(formatCO2(999)).toBe("999 kg");
  });

  it("switches to tonnes at and above 1000 kg", () => {
    expect(formatCO2(1500)).toBe("1.5 t");
    expect(formatCO2(2000)).toBe("2 t");
  });

  it("rounds kilograms to whole numbers", () => {
    expect(formatCO2(842.6)).toBe("843 kg");
  });
});

describe("formatNumber", () => {
  it("renders a plain integer", () => {
    expect(formatNumber(500)).toBe("500");
  });
  it("matches Indian locale grouping", () => {
    expect(formatNumber(1234567)).toBe((1234567).toLocaleString("en-IN"));
  });
});

describe("cn", () => {
  it("merges and de-duplicates tailwind classes", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    const isHidden: boolean = false;
    expect(cn("text-sm", isHidden && "hidden", "font-bold")).toBe("text-sm font-bold");
  });
});

import type { FootprintResult, LifestyleInput, Recommendation } from "@/types";
import { FACTORS } from "./emissions";

/**
 * Deterministic, India-aware recommendation engine. Produces personalised,
 * impact-ranked actions from a user's lifestyle inputs. Used directly when no
 * Gemini key is configured, and as a grounding fallback when Gemini fails.
 */
export function generateRecommendations(
  input: LifestyleInput,
  _footprint: FootprintResult,
): Recommendation[] {
  const recs: Recommendation[] = [];
  const push = (r: Omit<Recommendation, "source">) => recs.push({ ...r, source: "engine" });

  // ── Travel ────────────────────────────────────────────────────────────────
  if (["car-petrol", "car-diesel"].includes(input.commuteMode) && input.commuteKmPerDay > 5) {
    const current = FACTORS.commutePerKm[input.commuteMode];
    const saving = Math.round(
      input.commuteKmPerDay *
        FACTORS.workingDaysPerYear *
        (current - FACTORS.commutePerKm["public-transport"]),
    );
    push({
      id: "commute-switch",
      category: "travel",
      title: "Shift 3 commute days a week to metro / bus",
      detail: `Your ${input.commuteKmPerDay} km car commute is a top emitter. Public transport cuts roughly ${Math.round(
        (current - FACTORS.commutePerKm["public-transport"]) * 100,
      )}% per km.`,
      estimatedSavingKg: Math.round(saving * 0.6),
      effort: "medium",
    });
  }
  if (input.flightsLongHaulPerYear >= 1) {
    push({
      id: "flights-reduce",
      category: "travel",
      title: "Replace one long-haul trip with a regional one",
      detail: "A single international return flight can outweigh a year of careful daily choices.",
      estimatedSavingKg: FACTORS.flightLongHaul,
      effort: "ambitious",
    });
  }

  // ── Home energy ─────────────────────────────────────────────────────────────
  if (input.monthlyElectricityKwh > 150 && !input.hasSolar) {
    push({
      id: "ac-efficiency",
      category: "home",
      title: "Set AC to 24°C and switch to a 5-star inverter unit",
      detail: "Each degree higher saves ~6% energy. Star-rated appliances compound the saving.",
      estimatedSavingKg: Math.round(input.monthlyElectricityKwh * 12 * FACTORS.gridKwh * 0.12),
      effort: "easy",
    });
    push({
      id: "rooftop-solar",
      category: "home",
      title: "Explore rooftop solar (PM Surya Ghar subsidy)",
      detail: "India subsidises residential rooftop solar — it can offset most of your grid use.",
      estimatedSavingKg: Math.round(
        input.monthlyElectricityKwh * 12 * FACTORS.gridKwh * FACTORS.solarOffset,
      ),
      effort: "ambitious",
    });
  }

  // ── Food ────────────────────────────────────────────────────────────────────
  if (["regular-meat", "occasional-meat", "eggetarian"].includes(input.diet)) {
    push({
      id: "meat-free-days",
      category: "food",
      title: "Add 2 fully plant-based days each week",
      detail: "Indian vegetarian thalis are among the lowest-carbon meals in the world.",
      estimatedSavingKg: Math.round(
        (FACTORS.dietAnnual[input.diet] - FACTORS.dietAnnual["vegetarian"]) * 0.7 + 120,
      ),
      effort: "easy",
    });
  }
  if (input.dineOutPerWeek > 3) {
    push({
      id: "dine-in",
      category: "food",
      title: "Cook 2 more meals at home each week",
      detail: "Home cooking trims packaging, delivery miles and food waste.",
      estimatedSavingKg: Math.round(2 * 52 * FACTORS.dineOutPerMeal * 0.5),
      effort: "easy",
    });
  }

  // ── Goods ─────────────────────────────────────────────────────────────────
  if (input.shoppingSpendPerMonth > 4000) {
    push({
      id: "mindful-buying",
      category: "goods",
      title: "Buy fewer, longer-lasting things; repair first",
      detail: "Cutting discretionary spend by a fifth meaningfully lowers embodied emissions.",
      estimatedSavingKg: Math.round(input.shoppingSpendPerMonth * 12 * FACTORS.goodsPerRupee * 0.2),
      effort: "medium",
    });
  }

  // Always-useful baseline action
  push({
    id: "led-switch",
    category: "home",
    title: "Replace remaining bulbs & fans with BEE-rated efficient models",
    detail: "A quick, cheap win that keeps paying back every month.",
    estimatedSavingKg: 90,
    effort: "easy",
  });

  return recs
    .filter((r) => r.estimatedSavingKg > 0)
    .sort((a, b) => b.estimatedSavingKg - a.estimatedSavingKg)
    .slice(0, 6);
}

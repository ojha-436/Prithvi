import type { CommuteMode, DietType, FootprintResult, LifestyleInput } from "@/types";

/**
 * India-calibrated emission factors.
 * Sources: CEA grid emission factor (~0.71 kg CO2/kWh), IPCC fuel factors,
 * and consumption-based estimates. All values are kg CO2e.
 */
export const FACTORS = {
  gridKwh: 0.71, // kg CO2e per kWh (Indian grid)
  solarOffset: 0.6, // fraction of electricity offset if rooftop solar present
  lpgCylinder: 42, // kg CO2e per 14.2 kg domestic cylinder burned
  workingDaysPerYear: 300,
  commutePerKm: {
    "walk-cycle": 0,
    "public-transport": 0.03,
    "two-wheeler": 0.05,
    "car-petrol": 0.18,
    "car-diesel": 0.17,
    "car-ev": 0.08,
  } as Record<CommuteMode, number>,
  flightShortHaul: 250, // kg CO2e per domestic return trip
  flightLongHaul: 1800, // kg CO2e per international return trip
  dietAnnual: {
    vegan: 1000,
    vegetarian: 1400,
    eggetarian: 1650,
    "occasional-meat": 2050,
    "regular-meat": 2600,
  } as Record<DietType, number>,
  dineOutPerMeal: 2.5, // kg CO2e per restaurant meal
  goodsPerRupee: 0.035, // kg CO2e per INR of discretionary spend
};

export const INDIA_PER_CAPITA_KG = 2000;

export function computeFootprint(input: LifestyleInput): FootprintResult {
  const electricity =
    input.monthlyElectricityKwh *
    12 *
    FACTORS.gridKwh *
    (input.hasSolar ? 1 - FACTORS.solarOffset : 1);
  const lpg = input.lpgCylindersPerMonth * 12 * FACTORS.lpgCylinder;
  const home = electricity + lpg;

  const commute =
    input.commuteKmPerDay * FACTORS.workingDaysPerYear * FACTORS.commutePerKm[input.commuteMode];
  const flights =
    input.flightsShortHaulPerYear * FACTORS.flightShortHaul +
    input.flightsLongHaulPerYear * FACTORS.flightLongHaul;
  const travel = commute + flights;

  const food = FACTORS.dietAnnual[input.diet] + input.dineOutPerWeek * 52 * FACTORS.dineOutPerMeal;

  const goods = input.shoppingSpendPerMonth * 12 * FACTORS.goodsPerRupee;

  const breakdown = {
    home: Math.round(home),
    travel: Math.round(travel),
    food: Math.round(food),
    goods: Math.round(goods),
  };

  const total = breakdown.home + breakdown.travel + breakdown.food + breakdown.goods;

  return {
    total,
    breakdown,
    perCapitaIndia: INDIA_PER_CAPITA_KG,
    computedAt: Date.now(),
  };
}

export const EMPTY_LIFESTYLE: LifestyleInput = {
  monthlyElectricityKwh: 250,
  hasSolar: false,
  lpgCylindersPerMonth: 1,
  commuteMode: "two-wheeler",
  commuteKmPerDay: 20,
  flightsShortHaulPerYear: 1,
  flightsLongHaulPerYear: 0,
  diet: "vegetarian",
  shoppingSpendPerMonth: 6000,
  dineOutPerWeek: 2,
};

export const CATEGORY_META: Record<
  keyof FootprintResult["breakdown"],
  { label: string; color: string; hint: string }
> = {
  home: { label: "Home energy", color: "#15603F", hint: "Electricity & cooking fuel" },
  travel: { label: "Travel", color: "#C9772B", hint: "Commute & flights" },
  food: { label: "Food", color: "#2E8B7F", hint: "Diet & dining out" },
  goods: { label: "Goods", color: "#9B6A2F", hint: "Shopping & services" },
};

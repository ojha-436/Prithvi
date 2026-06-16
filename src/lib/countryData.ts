/**
 * Per-capita CO2 emissions by country (tonnes CO2 per person per year).
 * Figures are rounded approximations from Global Carbon Project / Our World in
 * Data (latest available year ~2022) and are used for educational comparison.
 */
export interface CountryStat {
  code: string;
  name: string;
  perCapitaTonnes: number;
  flag: string;
  highlight?: boolean;
}

export const COUNTRY_STATS: CountryStat[] = [
  { code: "IN", name: "India", perCapitaTonnes: 2.0, flag: "🇮🇳", highlight: true },
  { code: "WORLD", name: "World average", perCapitaTonnes: 4.7, flag: "🌍" },
  { code: "JP", name: "Japan", perCapitaTonnes: 8.5, flag: "🇯🇵" },
  { code: "CN", name: "China", perCapitaTonnes: 8.0, flag: "🇨🇳" },
  { code: "US", name: "United States", perCapitaTonnes: 14.4, flag: "🇺🇸" },
];

/** A safe-planet target: the per-capita budget compatible with 1.5°C by ~2030. */
export const SUSTAINABLE_TARGET_TONNES = 2.3;

/** Countries shown in the Dashboard comparison bar chart (single source of truth). */
export const DASHBOARD_BENCHMARKS = (["IN", "JP", "US"] as const).map((code) => {
  const c = COUNTRY_STATS.find((s) => s.code === code)!;
  return { name: code === "IN" ? "India avg" : c.name, t: c.perCapitaTonnes };
});

/** Where a typical Indian household's footprint comes from (illustrative share). */
export const INDIA_SOURCE_SPLIT = [
  { name: "Electricity & home energy", value: 38 },
  { name: "Travel & commute", value: 24 },
  { name: "Food & diet", value: 22 },
  { name: "Goods & services", value: 16 },
];

export const LEARN_FACTS = [
  {
    stat: "2.0 t",
    label: "Average CO₂ per person in India each year",
    note: "About one-seventh of the US figure — but rising fast as incomes grow.",
  },
  {
    stat: "1.5°C",
    label: "The warming limit the world is trying to stay under",
    note: "Staying below it needs per-capita emissions near 2.3 t by 2030.",
  },
  {
    stat: "~45%",
    label: "Share of an Indian household footprint from energy & travel",
    note: "Which is exactly where small daily choices add up the fastest.",
  },
];

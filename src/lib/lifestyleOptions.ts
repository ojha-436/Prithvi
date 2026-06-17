import type { CommuteMode, DietType } from "@/types";

export const COMMUTE_OPTIONS: { value: CommuteMode; label: string }[] = [
  { value: "walk-cycle", label: "Walk / cycle" },
  { value: "public-transport", label: "Bus / metro / train" },
  { value: "two-wheeler", label: "Two-wheeler" },
  { value: "car-petrol", label: "Car (petrol)" },
  { value: "car-diesel", label: "Car (diesel)" },
  { value: "car-ev", label: "Car (electric)" },
];

export const DIET_OPTIONS: { value: DietType; label: string }[] = [
  { value: "vegan", label: "Vegan" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "eggetarian", label: "Eggetarian" },
  { value: "occasional-meat", label: "Occasional meat" },
  { value: "regular-meat", label: "Regular meat" },
];

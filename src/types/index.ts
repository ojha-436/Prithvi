export type DietType = "vegan" | "vegetarian" | "eggetarian" | "occasional-meat" | "regular-meat";
export type CommuteMode = "walk-cycle" | "public-transport" | "two-wheeler" | "car-petrol" | "car-diesel" | "car-ev";
export type HomeType = "apartment" | "independent";

/** Personal profile captured on the onboarding "Personal details" page. */
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  city: string;
  state: string;
  householdSize: number;
  homeType: HomeType;
  ageBand?: string;
  occupation?: string;
  createdAt?: number;
  onboarded: boolean;
}

/** Raw lifestyle inputs that feed the emission engine. */
export interface LifestyleInput {
  // Home energy
  monthlyElectricityKwh: number;
  hasSolar: boolean;
  lpgCylindersPerMonth: number;
  // Mobility
  commuteMode: CommuteMode;
  commuteKmPerDay: number;
  flightsShortHaulPerYear: number;
  flightsLongHaulPerYear: number;
  // Food
  diet: DietType;
  // Consumption
  shoppingSpendPerMonth: number; // INR
  dineOutPerWeek: number;
}

export interface CategoryBreakdown {
  home: number;
  travel: number;
  food: number;
  goods: number;
}

export interface FootprintResult {
  total: number; // kg CO2e / year
  breakdown: CategoryBreakdown;
  perCapitaIndia: number;
  computedAt: number;
}

export interface Recommendation {
  id: string;
  category: keyof CategoryBreakdown;
  title: string;
  detail: string;
  estimatedSavingKg: number;
  effort: "easy" | "medium" | "ambitious";
  source: "gemini" | "engine";
}

export interface Pledge {
  id: string;
  title: string;
  savingKg: number;
  completedAt: number;
}

export interface GamificationState {
  points: number;
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  badges: string[];
  completedPledges: Pledge[];
  co2SavedKg: number;
}

export interface UserData {
  profile: UserProfile;
  lifestyle?: LifestyleInput;
  footprint?: FootprintResult;
  game: GamificationState;
}

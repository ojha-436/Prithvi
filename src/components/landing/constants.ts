import { ClipboardList, Factory, Gauge, Globe2, Sprout, Trophy } from "lucide-react";

/** Category colours reused by the hero preview and the comparison donut. */
export const SOURCE_COLORS = ["#15603F", "#C9772B", "#2E8B7F", "#9B6A2F"];

export const STEPS = [
  {
    icon: ClipboardList,
    title: "Tell us about your week",
    body: "Answer a short set of questions on energy, travel, food and shopping — or upload a bill.",
  },
  {
    icon: Gauge,
    title: "See your number",
    body: "Get your yearly footprint, broken down by category, benchmarked against India's average.",
  },
  {
    icon: Trophy,
    title: "Act and earn",
    body: "Follow personalised actions, build streaks, unlock badges and watch your CO₂ saved climb.",
  },
];

export const BASICS = [
  {
    icon: Factory,
    title: "What is a carbon footprint?",
    body: "The total greenhouse gases your daily life causes — from the electricity you use to the food you eat — measured as kilograms of CO₂ equivalent (CO₂e).",
  },
  {
    icon: Globe2,
    title: "Why CO₂e, not just CO₂?",
    body: "Methane and other gases warm the planet too. CO₂e converts them all to a single, comparable unit so you can track everything in one number.",
  },
  {
    icon: Sprout,
    title: "Why India matters",
    body: "India's per-person emissions are low today but its choices over the next decade will shape the global climate. Individual habits scale to 1.4 billion people.",
  },
];

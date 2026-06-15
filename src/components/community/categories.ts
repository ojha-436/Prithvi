import { CATEGORY_META } from "@/lib/emissions";
import type { PostCategory } from "@/lib/community";

/**
 * Display metadata for community post categories. The four footprint categories
 * reuse CATEGORY_META (single source of truth) and we add a neutral "general".
 */
export const POST_CATEGORIES: { value: PostCategory; label: string; color: string }[] = [
  { value: "general", label: "General", color: "#6B7280" },
  { value: "home", label: CATEGORY_META.home.label, color: CATEGORY_META.home.color },
  { value: "travel", label: CATEGORY_META.travel.label, color: CATEGORY_META.travel.color },
  { value: "food", label: CATEGORY_META.food.label, color: CATEGORY_META.food.color },
  { value: "goods", label: CATEGORY_META.goods.label, color: CATEGORY_META.goods.color },
];

export const categoryColor = (c: PostCategory) =>
  POST_CATEGORIES.find((x) => x.value === c)?.color ?? "#6B7280";

export const categoryLabel = (c: PostCategory) =>
  POST_CATEGORIES.find((x) => x.value === c)?.label ?? "General";

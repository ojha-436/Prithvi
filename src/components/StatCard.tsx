import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type StatTone = "primary" | "accent" | "success";

const TONE: Record<StatTone, string> = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/12 text-accent",
  success: "bg-success/12 text-success",
};

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  tone?: StatTone;
  /** "inline" = icon beside label (compact rows); "stacked" = label above a large value. */
  layout?: "inline" | "stacked";
}

/**
 * A single key metric. One component covers both the compact row style used on
 * the Insights/Community pages and the larger stacked style on the Dashboard,
 * so the stat UI lives in exactly one place.
 */
export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = "primary",
  layout = "inline",
}: StatCardProps) {
  if (layout === "stacked") {
    return (
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          <span className={cn("grid size-8 place-items-center rounded-lg", TONE[tone])}>
            <Icon className="size-4" />
          </span>
        </div>
        <p className="tabular mt-3 font-display text-2xl font-semibold">{value}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </Card>
    );
  }

  return (
    <Card className="flex items-center gap-3 p-4">
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-lg", TONE[tone])}>
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs text-muted-foreground">{label}</p>
        <p className="tabular font-display text-lg font-semibold">{value}</p>
        {sub && <p className="truncate text-xs text-muted-foreground">{sub}</p>}
      </div>
    </Card>
  );
}

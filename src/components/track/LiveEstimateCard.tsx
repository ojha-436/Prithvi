import { Gauge, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { calculateVsIndia, CATEGORY_META } from "@/lib/emissions";
import { formatCO2 } from "@/lib/utils";
import type { FootprintResult } from "@/types";

export function LiveEstimateCard({
  footprint,
  saving,
}: {
  footprint: FootprintResult;
  saving: boolean;
}) {
  const vsIndia = calculateVsIndia(footprint.total);

  return (
    <Card className="sticky top-20 overflow-hidden shadow-lift">
      <CardHeader className="flex-row items-center gap-2">
        <Gauge className="size-5 text-primary" aria-hidden />
        <CardTitle>Live estimate</CardTitle>
      </CardHeader>
      <CardContent>
        <div aria-live="polite">
          <p className="tabular font-display text-4xl font-semibold">
            {formatCO2(footprint.total)}
          </p>
          <p className="text-sm text-muted-foreground">CO2e per year</p>
        </div>

        <div className="mt-3">
          <Badge variant={vsIndia > 100 ? "accent" : "success"}>
            {vsIndia}% of India's average
          </Badge>
        </div>

        <div className="mt-6 space-y-3">
          {(Object.keys(CATEGORY_META) as (keyof typeof CATEGORY_META)[]).map((key) => {
            const value = footprint.breakdown[key];
            const pct = footprint.total ? Math.round((value / footprint.total) * 100) : 0;
            return (
              <div key={key}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{CATEGORY_META[key].label}</span>
                  <span className="tabular font-medium">{formatCO2(value)}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: CATEGORY_META[key].color }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <Button type="submit" className="mt-6 w-full" size="lg" disabled={saving}>
          {saving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          Save & see insights
        </Button>
      </CardContent>
    </Card>
  );
}

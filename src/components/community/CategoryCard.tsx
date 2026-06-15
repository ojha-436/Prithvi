import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CommunityStats } from "@/lib/community";
import { formatCO2 } from "@/lib/utils";
import { categoryColor, categoryLabel } from "./categories";

/** Donut of community CO₂ savings split by category. */
export function CategoryCard({ stats }: { stats: CommunityStats }) {
  const data = stats.byCategory.filter((c) => c.value > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Savings by category</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Add a CO₂ saving to your posts to populate this.
          </p>
        ) : (
          <div className="flex items-center gap-4">
            <div
              className="h-36 w-36 shrink-0"
              role="img"
              aria-label={`Community savings by category: ${data
                .map((d) => `${categoryLabel(d.category)} ${formatCO2(d.value)}`)
                .join(", ")}.`}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="category"
                    innerRadius={36}
                    outerRadius={64}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {data.map((d) => (
                      <Cell key={d.category} fill={categoryColor(d.category)} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [formatCO2(v), ""]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex-1 space-y-2 text-sm">
              {data.map((d) => (
                <li key={d.category} className="flex items-center gap-2">
                  <span
                    className="size-3 rounded-sm"
                    style={{ background: categoryColor(d.category) }}
                  />
                  <span className="flex-1 text-muted-foreground">{categoryLabel(d.category)}</span>
                  <span className="tabular font-medium">{formatCO2(d.value)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

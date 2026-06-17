import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Reveal } from "@/components/Reveal";
import { Card } from "@/components/ui/card";
import { COUNTRY_STATS, INDIA_SOURCE_SPLIT, SUSTAINABLE_TARGET_TONNES } from "@/lib/countryData";
import { SectionHeading } from "./SectionHeading";
import { SOURCE_COLORS } from "./constants";

export function ComparisonSection() {
  return (
    <section id="compare" className="border-y border-border bg-card py-20">
      <div className="container grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <Reveal>
          <div>
            <SectionHeading
              eyebrow="India vs the world"
              title="How much CO₂ does one person emit?"
              align="left"
            />
            <p className="mt-4 max-w-md text-muted-foreground">
              The average Indian emits about <strong className="text-foreground">2.0 tonnes</strong>{" "}
              of CO₂ a year — roughly one-seventh of an American and a quarter of a Japanese
              resident. The dashed line marks the{" "}
              <strong className="text-foreground">~2.3 t</strong> per-person budget the world needs
              to stay near 1.5°C.
            </p>
            <div
              className="mt-8 h-72"
              role="img"
              aria-label="Bar chart of annual CO2 emissions per person: India 2 tonnes, world average 4.7, Japan 8.5, China 8, United States 14.4. Sustainable target is about 2.3 tonnes."
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={COUNTRY_STATS} layout="vertical" margin={{ left: 8, right: 24 }}>
                  <XAxis type="number" tickLine={false} axisLine={false} unit=" t" />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={120}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted))" }}
                    formatter={(v: number) => [`${v} t CO₂`, "Per person / yr"]}
                  />
                  <ReferenceLine
                    x={SUSTAINABLE_TARGET_TONNES}
                    stroke="#C9772B"
                    strokeDasharray="5 4"
                  />
                  <Bar dataKey="perCapitaTonnes" radius={[0, 6, 6, 0]} barSize={26}>
                    {COUNTRY_STATS.map((c) => (
                      <Cell
                        key={c.code}
                        fill={c.highlight ? "#15603F" : "hsl(var(--muted-foreground))"}
                        fillOpacity={c.highlight ? 1 : 0.45}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <Card className="p-7">
            <h3 className="font-display text-lg font-semibold">
              Where an Indian footprint comes from
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Typical household share by category.
            </p>
            <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row">
              <div
                className="h-48 w-48 shrink-0"
                role="img"
                aria-label="Donut chart of a typical Indian household footprint: electricity and home energy 38 percent, travel and commute 24 percent, food and diet 22 percent, goods and services 16 percent."
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={INDIA_SOURCE_SPLIT}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={48}
                      outerRadius={88}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {INDIA_SOURCE_SPLIT.map((_, i) => (
                        <Cell key={i} fill={SOURCE_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`${v}%`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="flex-1 space-y-2.5">
                {INDIA_SOURCE_SPLIT.map((s, i) => (
                  <li key={s.name} className="flex items-center gap-2.5 text-sm">
                    <span className="size-3 rounded-sm" style={{ background: SOURCE_COLORS[i] }} />
                    <span className="flex-1 text-muted-foreground">{s.name}</span>
                    <span className="tabular font-medium">{s.value}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}

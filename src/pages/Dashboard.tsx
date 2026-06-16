import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
import {
  ArrowRight,
  Sparkles,
  Leaf,
  Flame,
  TrendingDown,
  Trophy,
  ClipboardList,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/auth-context";
import { calculateVsIndia, CATEGORY_META } from "@/lib/emissions";
import { getInsight, getRecommendations, isGeminiConfigured } from "@/lib/gemini";
import { BADGES, nextBadge } from "@/lib/gamification";
import { DASHBOARD_BENCHMARKS, SUSTAINABLE_TARGET_TONNES } from "@/lib/countryData";
import { cn, formatCO2, formatNumber } from "@/lib/utils";
import type { Recommendation } from "@/types";

export default function Dashboard() {
  const { user, userData } = useAuth();
  const footprint = userData?.footprint;
  const game = userData?.game;
  const [insight, setInsight] = useState<string | null>(null);
  const [topRec, setTopRec] = useState<Recommendation | null>(null);

  useEffect(() => {
    let active = true;
    if (footprint && userData?.lifestyle) {
      getInsight(footprint).then((t) => active && setInsight(t));
      getRecommendations(userData.lifestyle, footprint).then(
        (r) => active && setTopRec(r[0] ?? null),
      );
    }
    return () => {
      active = false;
    };
  }, [footprint, userData?.lifestyle]);

  const breakdownData = useMemo(
    () =>
      footprint
        ? (Object.keys(CATEGORY_META) as (keyof typeof CATEGORY_META)[]).map((k) => ({
            name: CATEGORY_META[k].label,
            value: footprint.breakdown[k],
            color: CATEGORY_META[k].color,
          }))
        : [],
    [footprint],
  );

  const benchmark = useMemo(
    () => [
      { name: "You", t: footprint ? +(footprint.total / 1000).toFixed(2) : 0, you: true },
      ...DASHBOARD_BENCHMARKS.map((b) => ({ ...b, you: false })),
    ],
    [footprint],
  );

  if (!footprint || !game) return <EmptyState />;

  const vsIndia = calculateVsIndia(footprint.total);
  const next = nextBadge(game);
  const nextProgress = next
    ? (next.metric === "co2"
        ? game.co2SavedKg
        : next.metric === "points"
          ? game.points
          : game.streakDays) / next.threshold
    : 1;

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title={`Namaste, ${user?.displayName?.split(" ")[0] ?? "there"}`}
        description="Here's your carbon picture and where to focus next."
        action={
          <Link to="/app/track">
            <Button variant="outline">
              <ClipboardList className="size-4" /> Update footprint
            </Button>
          </Link>
        }
      />

      {/* Insight banner */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/[0.06] to-accent/[0.05]">
        <CardContent className="flex items-start gap-4 py-5">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-5" />
          </span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold">Your insight</p>
              <Badge variant="muted" className="text-[10px]">
                {isGeminiConfigured ? "Gemini" : "Prithvi engine"}
              </Badge>
            </div>
            {insight ? (
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{insight}</p>
            ) : (
              <div className="mt-2 space-y-2">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-4/5" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stat grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          layout="stacked"
          icon={Leaf}
          label="Annual footprint"
          value={formatCO2(footprint.total)}
          sub="CO₂e per year"
          tone="primary"
        />
        <StatCard
          layout="stacked"
          icon={TrendingDown}
          label="vs India average"
          value={`${vsIndia}%`}
          sub={vsIndia > 100 ? "Above average" : "Below average"}
          tone={vsIndia > 100 ? "accent" : "success"}
        />
        <StatCard
          layout="stacked"
          icon={Flame}
          label="CO₂ saved"
          value={formatCO2(game.co2SavedKg)}
          sub="from your pledges"
          tone="success"
        />
        <StatCard
          layout="stacked"
          icon={Trophy}
          label="Points"
          value={formatNumber(game.points)}
          sub={`${game.streakDays}-day streak`}
          tone="primary"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Where your emissions come from</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <div
                className="relative h-52 w-52 shrink-0"
                role="img"
                aria-label={`Your emissions by category: ${breakdownData
                  .map((d) => `${d.name} ${formatCO2(d.value)}`)
                  .join(", ")}. Total ${formatCO2(footprint.total)} per year.`}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={breakdownData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={56}
                      outerRadius={92}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {breakdownData.map((d) => (
                        <Cell key={d.name} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => [formatCO2(v), ""]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="tabular font-display text-2xl font-semibold">
                    {formatCO2(footprint.total)}
                  </span>
                  <span className="text-xs text-muted-foreground">total / yr</span>
                </div>
              </div>
              <ul className="flex-1 space-y-3">
                {breakdownData.map((d) => (
                  <li key={d.name} className="flex items-center gap-3 text-sm">
                    <span className="size-3 rounded-sm" style={{ background: d.color }} />
                    <span className="flex-1 text-muted-foreground">{d.name}</span>
                    <span className="tabular font-medium">{formatCO2(d.value)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How you compare</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="h-56"
              role="img"
              aria-label={`Bar chart comparing your annual footprint of ${(
                footprint.total / 1000
              ).toFixed(
                2,
              )} tonnes against India average 2 tonnes, Japan 8.5, USA 14.4, and the 1.5 degree target of 2.3 tonnes.`}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={benchmark} margin={{ top: 8 }}>
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} unit=" t" width={36} />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted))" }}
                    formatter={(v: number) => [`${v} t CO₂`, "Per yr"]}
                  />
                  <ReferenceLine
                    y={SUSTAINABLE_TARGET_TONNES}
                    stroke="#C9772B"
                    strokeDasharray="5 4"
                    label={{
                      value: "1.5°C target",
                      fontSize: 11,
                      fill: "#C9772B",
                      position: "insideTopRight",
                    }}
                  />
                  <Bar dataKey="t" radius={[6, 6, 0, 0]} barSize={44}>
                    {benchmark.map((b, i) => (
                      <Cell
                        key={i}
                        fill={b.you ? "#15603F" : "hsl(var(--muted-foreground))"}
                        fillOpacity={b.you ? 1 : 0.4}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next action + badges */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Your next best action</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            {topRec ? (
              <div className="flex flex-1 flex-col">
                <Badge variant="accent" className="w-fit capitalize">
                  {topRec.category}
                </Badge>
                <h3 className="mt-3 font-display text-lg font-semibold">{topRec.title}</h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {topRec.detail}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm">
                    Saves ~
                    <strong className="tabular text-success">
                      {formatCO2(topRec.estimatedSavingKg)}
                    </strong>
                    /yr
                  </span>
                  <Link to="/app/insights">
                    <Button size="sm">
                      See all actions <ArrowRight className="size-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            {next && (
              <div className="mb-4 rounded-lg border border-border bg-background p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Next: {next.name}</span>
                  <span className="text-muted-foreground">{next.desc}</span>
                </div>
                <Progress className="mt-2" value={nextProgress * 100} />
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {BADGES.map((b) => {
                const earned = game.badges.includes(b.id);
                return (
                  <span
                    key={b.id}
                    title={b.desc}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
                      earned
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-border bg-muted text-muted-foreground/60",
                    )}
                  >
                    <Trophy className="size-3.5" /> {b.name}
                  </span>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Your dashboard"
        description="Once you log a footprint, your insights appear here."
      />
      <Card className="grid place-items-center py-20 text-center">
        <div className="max-w-sm">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Leaf className="size-7" />
          </span>
          <h3 className="mt-5 font-display text-xl font-semibold">Let's measure your footprint</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Answer a short questionnaire and we'll calculate your yearly CO₂e, benchmark it, and
            suggest actions.
          </p>
          <Link to="/app/track">
            <Button className="mt-6" size="lg">
              Start tracking <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

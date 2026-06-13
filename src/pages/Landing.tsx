import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import {
  ArrowRight,
  ClipboardList,
  Gauge,
  Trophy,
  Factory,
  Globe2,
  Sprout,
  Wind,
} from "lucide-react";
import { PublicNav } from "@/components/layout/PublicNav";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  COUNTRY_STATS,
  INDIA_SOURCE_SPLIT,
  LEARN_FACTS,
  SUSTAINABLE_TARGET_TONNES,
} from "@/lib/countryData";

const SOURCE_COLORS = ["#15603F", "#C9772B", "#2E8B7F", "#9B6A2F"];

const STEPS = [
  { icon: ClipboardList, title: "Tell us about your week", body: "Answer a short set of questions on energy, travel, food and shopping — or upload a bill." },
  { icon: Gauge, title: "See your number", body: "Get your yearly footprint, broken down by category, benchmarked against India's average." },
  { icon: Trophy, title: "Act and earn", body: "Follow personalised actions, build streaks, unlock badges and watch your CO₂ saved climb." },
];

const BASICS = [
  { icon: Factory, title: "What is a carbon footprint?", body: "The total greenhouse gases your daily life causes — from the electricity you use to the food you eat — measured as kilograms of CO₂ equivalent (CO₂e)." },
  { icon: Globe2, title: "Why CO₂e, not just CO₂?", body: "Methane and other gases warm the planet too. CO₂e converts them all to a single, comparable unit so you can track everything in one number." },
  { icon: Sprout, title: "Why India matters", body: "India's per-person emissions are low today but its choices over the next decade will shape the global climate. Individual habits scale to 1.4 billion people." },
];

export default function Landing() {
  return (
    <div className="bg-paper">
      <PublicNav />

      <main id="main">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute inset-0 bg-contour opacity-60" aria-hidden />
        <div className="container relative grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="animate-fade-up">
            <Badge variant="outline" className="mb-5 bg-card">
              <Wind className="size-3.5" /> Built for India · CEA-calibrated estimates
            </Badge>
            <h1 className="text-balance font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Know your <span className="text-gradient">carbon</span>.<br />
              Change your climate.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
              Prithvi helps you understand carbon emissions, measure your personal footprint, and
              take small, India-specific steps that genuinely add up.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/signup">
                <Button size="lg" variant="accent">
                  Measure my footprint <ArrowRight className="size-4" />
                </Button>
              </Link>
              <a href="#learn">
                <Button size="lg" variant="outline">
                  Learn the basics
                </Button>
              </a>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Free · Takes ~5 minutes · No spreadsheets required
            </p>
          </div>

          {/* Preview card */}
          <Reveal delay={0.15}>
            <Card className="relative overflow-hidden p-6 shadow-lift">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Your yearly footprint</p>
                  <p className="mt-1 font-display text-4xl font-semibold tabular">3.24 t</p>
                  <p className="text-sm text-muted-foreground">CO₂e estimate</p>
                </div>
                <Badge variant="success">On track ↓</Badge>
              </div>
              <div className="mt-6 space-y-3">
                {[
                  { label: "Home energy", v: 38, c: SOURCE_COLORS[0] },
                  { label: "Travel", v: 27, c: SOURCE_COLORS[1] },
                  { label: "Food", v: 21, c: SOURCE_COLORS[2] },
                  { label: "Goods", v: 14, c: SOURCE_COLORS[3] },
                ].map((r) => (
                  <div key={r.label}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{r.label}</span>
                      <span className="tabular font-medium">{r.v}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full" style={{ width: `${r.v}%`, background: r.c }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-2 rounded-lg border border-border bg-background p-3 text-sm">
                <Sprout className="size-4 text-primary" />
                <span className="text-muted-foreground">Switching 3 commute days to metro saves ~210 kg/yr.</span>
              </div>
            </Card>
          </Reveal>
        </div>
      </section>

      {/* ── Why it matters ───────────────────────────────────────────────── */}
      <section id="why" className="container py-20">
        <Reveal>
          <SectionHeading eyebrow="Why it matters" title="A small number with a big story" />
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {LEARN_FACTS.map((f, i) => (
            <Reveal key={f.label} delay={i * 0.08}>
              <Card className="h-full p-7">
                <p className="font-display text-4xl font-semibold text-gradient tabular">{f.stat}</p>
                <p className="mt-3 font-medium">{f.label}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.note}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Country comparison ───────────────────────────────────────────── */}
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
                The average Indian emits about <strong className="text-foreground">2.0 tonnes</strong> of CO₂ a
                year — roughly one-seventh of an American and a quarter of a Japanese resident. The dashed line
                marks the <strong className="text-foreground">~2.3 t</strong> per-person budget the world needs to
                stay near 1.5°C.
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
                    <ReferenceLine x={SUSTAINABLE_TARGET_TONNES} stroke="#C9772B" strokeDasharray="5 4" />
                    <Bar dataKey="perCapitaTonnes" radius={[0, 6, 6, 0]} barSize={26}>
                      {COUNTRY_STATS.map((c) => (
                        <Cell key={c.code} fill={c.highlight ? "#15603F" : "hsl(var(--muted-foreground))"} fillOpacity={c.highlight ? 1 : 0.45} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <Card className="p-7">
              <h3 className="font-display text-lg font-semibold">Where an Indian footprint comes from</h3>
              <p className="mt-1 text-sm text-muted-foreground">Typical household share by category.</p>
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

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section id="how" className="container py-20">
        <Reveal>
          <SectionHeading eyebrow="How it works" title="From curiosity to climate action in three steps" />
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08}>
              <Card className="relative h-full p-7">
                <span className="absolute right-6 top-6 font-display text-5xl font-semibold text-muted/60 tabular">
                  0{i + 1}
                </span>
                <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  <s.icon className="size-6" />
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Learn the basics ─────────────────────────────────────────────── */}
      <section id="learn" className="border-t border-border bg-card py-20">
        <div className="container">
          <Reveal>
            <SectionHeading eyebrow="Carbon, explained" title="The basics, without the jargon" />
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {BASICS.map((b, i) => (
              <Reveal key={b.title} delay={i * 0.08}>
                <div className="h-full rounded-lg border border-border bg-background p-7">
                  <span className="grid size-11 place-items-center rounded-xl bg-accent/12 text-accent">
                    <b.icon className="size-5" />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-semibold">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="container py-20">
        <Reveal>
          <Card className="relative overflow-hidden bg-primary p-10 text-center text-primary-foreground sm:p-16">
            <div className="absolute inset-0 bg-contour opacity-40 mix-blend-soft-light" aria-hidden />
            <div className="relative mx-auto max-w-xl">
              <h2 className="font-display text-3xl font-semibold sm:text-4xl">
                Your first tonne saved starts today
              </h2>
              <p className="mt-3 text-primary-foreground/80">
                Join Prithvi, find out where you stand, and get a clear plan to do better.
              </p>
              <div className="mt-8 flex justify-center">
                <Link to="/signup">
                  <Button size="lg" variant="accent">
                    Create my free account <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </Reveal>
      </section>
      </main>

      <Footer />
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-xl"}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">{eyebrow}</p>
      <h2 className="mt-3 text-balance font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h2>
    </div>
  );
}

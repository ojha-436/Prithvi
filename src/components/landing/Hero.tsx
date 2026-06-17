import { Link } from "react-router-dom";
import { ArrowRight, Sprout, Wind } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SOURCE_COLORS } from "./constants";

const PREVIEW_ROWS = [
  { label: "Home energy", v: 38, c: SOURCE_COLORS[0] },
  { label: "Travel", v: 27, c: SOURCE_COLORS[1] },
  { label: "Food", v: 21, c: SOURCE_COLORS[2] },
  { label: "Goods", v: 14, c: SOURCE_COLORS[3] },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-20 pt-32">
      <div className="bg-contour absolute inset-0 opacity-60" aria-hidden />
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
            Prithvi helps you understand carbon emissions, measure your personal footprint, and take
            small, India-specific steps that genuinely add up.
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
                <p className="tabular mt-1 font-display text-4xl font-semibold">3.24 t</p>
                <p className="text-sm text-muted-foreground">CO₂e estimate</p>
              </div>
              <Badge variant="success">On track ↓</Badge>
            </div>
            <div className="mt-6 space-y-3">
              {PREVIEW_ROWS.map((r) => (
                <div key={r.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className="tabular font-medium">{r.v}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${r.v}%`, background: r.c }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-2 rounded-lg border border-border bg-background p-3 text-sm">
              <Sprout className="size-4 text-primary" />
              <span className="text-muted-foreground">
                Switching 3 commute days to metro saves ~210 kg/yr.
              </span>
            </div>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}

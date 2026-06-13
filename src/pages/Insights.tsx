import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Leaf, Sparkles, Trophy, Flame, Target } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { getRecommendations, isGeminiConfigured } from "@/lib/gemini";
import { completePledge } from "@/lib/gamification";
import { CATEGORY_META } from "@/lib/emissions";
import { cn, formatCO2, formatNumber } from "@/lib/utils";
import type { Recommendation } from "@/types";

const EFFORT_STYLE: Record<Recommendation["effort"], string> = {
  easy: "bg-success/12 text-success",
  medium: "bg-accent/12 text-accent",
  ambitious: "bg-primary/10 text-primary",
};

export default function Insights() {
  const { userData, updateGame } = useAuth();
  const footprint = userData?.footprint;
  const game = userData?.game;
  const [recs, setRecs] = useState<Recommendation[] | null>(null);

  useEffect(() => {
    let active = true;
    if (footprint && userData?.lifestyle) {
      getRecommendations(userData.lifestyle, footprint).then((r) => active && setRecs(r));
    }
    return () => {
      active = false;
    };
  }, [footprint, userData?.lifestyle]);

  if (!footprint || !game) {
    return (
      <div className="animate-fade-up">
        <PageHeader title="Insights & actions" description="Personalised actions appear after you log a footprint." />
        <Card className="grid place-items-center py-16 text-center">
          <div className="max-w-sm">
            <Leaf className="mx-auto size-10 text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">No footprint yet — let's fix that.</p>
            <Link to="/app/track">
              <Button className="mt-5">Start tracking <ArrowRight className="size-4" /></Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const pledged = new Set(game.completedPledges.map((p) => p.id));
  const potentialSaving = (recs ?? []).filter((r) => !pledged.has(r.id)).reduce((s, r) => s + r.estimatedSavingKg, 0);

  const pledge = async (rec: Recommendation) => {
    if (pledged.has(rec.id)) return;
    const next = completePledge(game, {
      id: rec.id,
      title: rec.title,
      savingKg: rec.estimatedSavingKg,
      completedAt: Date.now(),
    });
    await updateGame(next);
  };

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title="Insights & actions"
        description="Impact-ranked steps tailored to your lifestyle. Pledge the ones you'll take."
        action={
          <Badge variant="muted" className="h-8 gap-1.5 px-3">
            <Sparkles className="size-3.5" /> {isGeminiConfigured ? "Powered by Gemini" : "Prithvi engine"}
          </Badge>
        }
      />

      {/* Reward summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <MiniStat icon={Flame} label="CO₂ saved so far" value={formatCO2(game.co2SavedKg)} />
        <MiniStat icon={Trophy} label="Points earned" value={formatNumber(game.points)} />
        <MiniStat icon={Target} label="Still available" value={`${formatCO2(potentialSaving)}/yr`} />
      </div>

      {/* Recommendations */}
      <div className="grid gap-4 md:grid-cols-2">
        {!recs &&
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="mt-3 h-5 w-3/4" />
              <Skeleton className="mt-2 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-2/3" />
            </Card>
          ))}

        {recs?.map((rec) => {
          const done = pledged.has(rec.id);
          return (
            <Card key={rec.id} className={cn("flex flex-col p-6 transition-colors", done && "border-success/30 bg-success/[0.04]")}>
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{ background: `${CATEGORY_META[rec.category].color}1f`, color: CATEGORY_META[rec.category].color }}
                >
                  {CATEGORY_META[rec.category].label}
                </span>
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", EFFORT_STYLE[rec.effort])}>
                  {rec.effort}
                </span>
              </div>
              <h3 className="mt-3 font-display text-lg font-semibold leading-snug">{rec.title}</h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">{rec.detail}</p>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <span className="text-sm">
                  Saves ~<strong className="tabular text-success">{formatCO2(rec.estimatedSavingKg)}</strong>/yr
                </span>
                <Button size="sm" variant={done ? "outline" : "default"} onClick={() => pledge(rec)} disabled={done}>
                  {done ? <><Check className="size-4" /> Pledged</> : "I'll do this"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Completed pledges */}
      {game.completedPledges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your pledges</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {game.completedPledges.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-3 text-sm">
                  <span className="grid size-7 place-items-center rounded-full bg-success/12 text-success">
                    <Check className="size-4" />
                  </span>
                  <span className="flex-1">{p.title}</span>
                  <span className="tabular font-medium text-success">{formatCO2(p.savingKg)}/yr</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-display text-lg font-semibold tabular">{value}</p>
      </div>
    </Card>
  );
}

import { Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CommunityStats } from "@/lib/community";
import { cn, formatCO2 } from "@/lib/utils";

/** Top contributors ranked by total CO₂ saved across their shared steps. */
export function Leaderboard({ stats }: { stats: CommunityStats }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2">
        <Award className="size-5 text-accent" />
        <CardTitle>Top changemakers</CardTitle>
      </CardHeader>
      <CardContent>
        {stats.leaderboard.length === 0 ? (
          <p className="text-sm text-muted-foreground">No contributions yet — be the first!</p>
        ) : (
          <ol className="space-y-3">
            {stats.leaderboard.map((member, i) => (
              <li key={member.name + i} className="flex items-center gap-3 text-sm">
                <span
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-full text-xs font-semibold",
                    i === 0 ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground",
                  )}
                >
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate font-medium">{member.name}</span>
                <span className="tabular text-success">{formatCO2(member.co2)}</span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

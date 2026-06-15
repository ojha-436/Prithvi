import { useEffect, useMemo, useState } from "react";
import { Users, Leaf, Sprout, MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Composer } from "@/components/community/Composer";
import { PostCard } from "@/components/community/PostCard";
import { Leaderboard } from "@/components/community/Leaderboard";
import { CategoryCard } from "@/components/community/CategoryCard";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth-context";
import { computeStats, subscribePosts, type CommunityPost } from "@/lib/community";
import { formatCO2, formatNumber } from "@/lib/utils";

/**
 * Community forum + impact dashboard. Subscribes to the shared post feed, derives
 * aggregate stats, and composes the feature's components (composer, feed,
 * leaderboard, category breakdown).
 */
export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[] | null>(null);

  useEffect(() => subscribePosts(setPosts), []);

  const stats = useMemo(() => computeStats(posts ?? []), [posts]);
  const myPosts = useMemo(
    () => (posts ?? []).filter((p) => p.authorId === user?.uid).length,
    [posts, user?.uid],
  );

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title="Community"
        description="Share the steps you're taking and see the impact we're making together."
      />

      {/* Community-wide impact */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Leaf}
          label="Community CO₂ saved"
          value={formatCO2(stats.totalCo2Saved)}
          tone="success"
        />
        <StatCard icon={Users} label="Changemakers" value={formatNumber(stats.contributors)} />
        <StatCard icon={MessageSquare} label="Steps shared" value={formatNumber(stats.steps)} />
        <StatCard icon={Sprout} label="Your posts" value={formatNumber(myPosts)} tone="accent" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <div className="space-y-6">
          <Composer />
          <Feed posts={posts} uid={user?.uid} />
        </div>
        <div className="space-y-6">
          <Leaderboard stats={stats} />
          <CategoryCard stats={stats} />
        </div>
      </div>
    </div>
  );
}

/** The post list — loading skeletons, an empty state, or the feed itself. */
function Feed({ posts, uid }: { posts: CommunityPost[] | null; uid?: string }) {
  if (posts === null) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-2/3" />
          </Card>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className="grid place-items-center py-16 text-center">
        <div className="max-w-xs">
          <MessageSquare className="mx-auto size-9 text-primary" />
          <p className="mt-3 font-medium">No posts yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Be the first to share a step you've taken.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((p) => (
        <PostCard key={p.id} post={p} uid={uid} />
      ))}
    </div>
  );
}

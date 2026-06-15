import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Users, Heart, Trash2, Send, Leaf, Sprout, Award, Loader2, MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { CATEGORY_META } from "@/lib/emissions";
import {
  computeStats,
  createPost,
  deletePost,
  subscribePosts,
  toggleLike,
  type CommunityPost,
  type PostCategory,
} from "@/lib/community";
import { cn, formatCO2, formatNumber } from "@/lib/utils";

const CATS: { value: PostCategory; label: string; color: string }[] = [
  { value: "general", label: "General", color: "#6B7280" },
  { value: "home", label: CATEGORY_META.home.label, color: CATEGORY_META.home.color },
  { value: "travel", label: CATEGORY_META.travel.label, color: CATEGORY_META.travel.color },
  { value: "food", label: CATEGORY_META.food.label, color: CATEGORY_META.food.color },
  { value: "goods", label: CATEGORY_META.goods.label, color: CATEGORY_META.goods.color },
];
const catColor = (c: PostCategory) => CATS.find((x) => x.value === c)?.color ?? "#6B7280";
const catLabel = (c: PostCategory) => CATS.find((x) => x.value === c)?.label ?? "General";

function timeAgo(ms: number): string {
  const s = Math.max(1, Math.round((Date.now() - ms) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(ms).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[] | null>(null);

  useEffect(() => subscribePosts(setPosts), []);

  const stats = useMemo(() => computeStats(posts ?? []), [posts]);
  const mySteps = useMemo(
    () => (posts ?? []).filter((p) => p.authorId === user?.uid).length,
    [posts, user?.uid]
  );

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title="Community"
        description="Share the steps you're taking and see the impact we're making together."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStat icon={Leaf} label="Community CO₂ saved" value={formatCO2(stats.totalCo2Saved)} tone="success" />
        <MiniStat icon={Users} label="Changemakers" value={formatNumber(stats.contributors)} tone="primary" />
        <MiniStat icon={MessageSquare} label="Steps shared" value={formatNumber(stats.steps)} tone="primary" />
        <MiniStat icon={Sprout} label="Your posts" value={formatNumber(mySteps)} tone="accent" />
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

function Composer() {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [category, setCategory] = useState<PostCategory>("general");
  const [co2, setCo2] = useState("");
  const [posting, setPosting] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !text.trim()) return;
    setPosting(true);
    try {
      await createPost(user, { text, category, co2SavedKg: Number(co2) || 0 });
      setText("");
      setCo2("");
      setCategory("general");
    } finally {
      setPosting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={submit} className="space-y-3">
          <Label htmlFor="post-text">Share a step you took to cut your footprint</Label>
          <textarea
            id="post-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={1000}
            rows={3}
            placeholder="e.g. Switched my daily commute to the metro — saving petrol and ~210 kg CO₂ a year."
            className="flex w-full rounded-md border border-input bg-card px-3.5 py-2.5 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[150px] flex-1 space-y-1.5">
              <Label htmlFor="post-cat" className="text-xs">Category</Label>
              <Select id="post-cat" value={category} onChange={(e) => setCategory(e.target.value as PostCategory)}>
                {CATS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </Select>
            </div>
            <div className="w-32 space-y-1.5">
              <Label htmlFor="post-co2" className="text-xs">CO₂ saved/yr</Label>
              <div className="relative">
                <input
                  id="post-co2"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={co2}
                  onChange={(e) => setCo2(e.target.value)}
                  placeholder="0"
                  className="flex h-11 w-full rounded-md border border-input bg-card px-3.5 pr-9 py-2 text-sm shadow-sm focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">kg</span>
              </div>
            </div>
            <Button type="submit" disabled={posting || !text.trim()}>
              {posting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              Post
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

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
          <p className="mt-1 text-sm text-muted-foreground">Be the first to share a step you've taken.</p>
        </div>
      </Card>
    );
  }
  return (
    <div className="space-y-4">
      {posts.map((p) => <PostCard key={p.id} post={p} uid={uid} />)}
    </div>
  );
}

function PostCard({ post, uid }: { post: CommunityPost; uid?: string }) {
  const liked = uid ? post.likedBy.includes(uid) : false;
  const isAuthor = uid === post.authorId;
  const [busy, setBusy] = useState(false);

  const like = async () => {
    if (!uid || busy) return;
    setBusy(true);
    try {
      await toggleLike(post, uid);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 font-display text-sm font-semibold text-primary">
          {post.authorName?.[0]?.toUpperCase() ?? "U"}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold">{post.authorName}</p>
            <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(post.createdAt)}</span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span
              className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{ background: `${catColor(post.category)}1f`, color: catColor(post.category) }}
            >
              {catLabel(post.category)}
            </span>
            {post.co2SavedKg > 0 && (
              <Badge variant="success" className="gap-1"><Leaf className="size-3" /> {formatCO2(post.co2SavedKg)}/yr</Badge>
            )}
          </div>
          <p className="mt-2.5 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{post.text}</p>
          <div className="mt-3 flex items-center gap-1">
            <button
              onClick={like}
              disabled={busy}
              aria-pressed={liked}
              aria-label={liked ? "Unlike" : "Like"}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm transition-colors hover:bg-muted",
                liked ? "text-accent" : "text-muted-foreground"
              )}
            >
              <Heart className={cn("size-4", liked && "fill-current")} />
              <span className="tabular">{post.likedBy.length}</span>
            </button>
            {isAuthor && (
              <button
                onClick={() => deletePost(post.id)}
                aria-label="Delete post"
                className="ml-auto inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function Leaderboard({ stats }: { stats: ReturnType<typeof computeStats> }) {
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
            {stats.leaderboard.map((m, i) => (
              <li key={m.name + i} className="flex items-center gap-3 text-sm">
                <span className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full text-xs font-semibold",
                  i === 0 ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"
                )}>{i + 1}</span>
                <span className="min-w-0 flex-1 truncate font-medium">{m.name}</span>
                <span className="tabular text-success">{formatCO2(m.co2)}</span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

function CategoryCard({ stats }: { stats: ReturnType<typeof computeStats> }) {
  const data = stats.byCategory.filter((c) => c.value > 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Savings by category</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">Add a CO₂ saving to your posts to populate this.</p>
        ) : (
          <div className="flex items-center gap-4">
            <div
              className="h-36 w-36 shrink-0"
              role="img"
              aria-label={`Community savings by category: ${data.map((d) => `${catLabel(d.category)} ${formatCO2(d.value)}`).join(", ")}.`}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} dataKey="value" nameKey="category" innerRadius={36} outerRadius={64} paddingAngle={2} stroke="none">
                    {data.map((d) => <Cell key={d.category} fill={catColor(d.category)} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [formatCO2(v), ""]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex-1 space-y-2 text-sm">
              {data.map((d) => (
                <li key={d.category} className="flex items-center gap-2">
                  <span className="size-3 rounded-sm" style={{ background: catColor(d.category) }} />
                  <span className="flex-1 text-muted-foreground">{catLabel(d.category)}</span>
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

function MiniStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: "primary" | "accent" | "success";
}) {
  const toneMap = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/12 text-accent",
    success: "bg-success/12 text-success",
  };
  return (
    <Card className="flex items-center gap-3 p-4">
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-lg", toneMap[tone])}>
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs text-muted-foreground">{label}</p>
        <p className="font-display text-lg font-semibold tabular">{value}</p>
      </div>
    </Card>
  );
}

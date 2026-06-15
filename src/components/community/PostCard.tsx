import { useState } from "react";
import { Heart, Trash2, Leaf } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toggleLike, deletePost, type CommunityPost } from "@/lib/community";
import { categoryColor, categoryLabel } from "./categories";
import { cn, formatCO2, timeAgo } from "@/lib/utils";

/** A single community post with author, category, optional CO₂ saved, and a like toggle. */
export function PostCard({ post, uid }: { post: CommunityPost; uid?: string }) {
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
            <span className="shrink-0 text-xs text-muted-foreground">
              {timeAgo(post.createdAt)}
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span
              className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{
                background: `${categoryColor(post.category)}1f`,
                color: categoryColor(post.category),
              }}
            >
              {categoryLabel(post.category)}
            </span>
            {post.co2SavedKg > 0 && (
              <Badge variant="success" className="gap-1">
                <Leaf className="size-3" /> {formatCO2(post.co2SavedKg)}/yr
              </Badge>
            )}
          </div>
          <p className="mt-2.5 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
            {post.text}
          </p>
          <div className="mt-3 flex items-center gap-1">
            <button
              onClick={like}
              disabled={busy}
              aria-pressed={liked}
              aria-label={liked ? "Unlike" : "Like"}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm transition-colors hover:bg-muted",
                liked ? "text-accent" : "text-muted-foreground",
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

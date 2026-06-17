import { useState, type FormEvent } from "react";
import { Loader2, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { createPost, type PostCategory } from "@/lib/community";
import { COMMUNITY } from "@/lib/constants";
import { POST_CATEGORIES } from "./categories";

/** Form for sharing a footprint-reduction step: text + category + optional CO₂ saved. */
export function Composer() {
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
          <Textarea
            id="post-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={COMMUNITY.maxPostLength}
            rows={3}
            placeholder="e.g. Switched my daily commute to the metro — saving petrol and ~210 kg CO₂ a year."
          />
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[150px] flex-1 space-y-1.5">
              <Label htmlFor="post-cat" className="text-xs">
                Category
              </Label>
              <Select
                id="post-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value as PostCategory)}
              >
                {POST_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="w-32 space-y-1.5">
              <Label htmlFor="post-co2" className="text-xs">
                CO₂ saved/yr
              </Label>
              <div className="relative">
                <Input
                  id="post-co2"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={co2}
                  onChange={(e) => setCo2(e.target.value)}
                  placeholder="0"
                  className="pr-9"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  kg
                </span>
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

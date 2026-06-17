import { useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { LiveEstimateCard } from "@/components/track/LiveEstimateCard";
import { TrackForm } from "@/components/track/TrackForm";
import { useAuth } from "@/context/auth-context";
import { computeFootprint, EMPTY_LIFESTYLE } from "@/lib/emissions";
import { registerActivity } from "@/lib/gamification";
import { useDebounce } from "@/hooks/useDebounce";
import type { LifestyleInput } from "@/types";

export default function Track() {
  const { userData, saveFootprint, updateGame } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<LifestyleInput>(userData?.lifestyle ?? EMPTY_LIFESTYLE);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof LifestyleInput>(key: K, value: LifestyleInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // Debounce the live preview so the estimate (and its aria-live announcement)
  // settles after typing rather than recomputing on every keystroke.
  const debouncedForm = useDebounce(form, 300);
  const live = useMemo(() => computeFootprint(debouncedForm), [debouncedForm]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // Use the latest form (not the debounced copy) so a fast submit is accurate.
    const footprint = computeFootprint(form);
    await saveFootprint(form, footprint);
    if (userData) await updateGame(registerActivity(userData.game));
    setSaving(false);
    navigate("/app/dashboard");
  };

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Track your footprint"
        description="Answer a few questions about a typical month. Your estimate updates live."
      />

      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <TrackForm form={form} set={set} />
        <LiveEstimateCard footprint={live} saving={saving} />
      </form>
    </div>
  );
}

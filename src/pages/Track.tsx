import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Car,
  Utensils,
  ShoppingBag,
  Upload,
  Loader2,
  Gauge,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth-context";
import {
  computeFootprint,
  EMPTY_LIFESTYLE,
  CATEGORY_META,
  INDIA_PER_CAPITA_KG,
} from "@/lib/emissions";
import { registerActivity } from "@/lib/gamification";
import { extractBillData, isBillScanAvailable } from "@/lib/gemini";
import { COMMUNITY } from "@/lib/constants";
import { cn, formatCO2 } from "@/lib/utils";
import type { CommuteMode, DietType, LifestyleInput } from "@/types";

const COMMUTE_OPTIONS: { value: CommuteMode; label: string }[] = [
  { value: "walk-cycle", label: "Walk / cycle" },
  { value: "public-transport", label: "Bus / metro / train" },
  { value: "two-wheeler", label: "Two-wheeler" },
  { value: "car-petrol", label: "Car (petrol)" },
  { value: "car-diesel", label: "Car (diesel)" },
  { value: "car-ev", label: "Car (electric)" },
];

const DIET_OPTIONS: { value: DietType; label: string }[] = [
  { value: "vegan", label: "Vegan" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "eggetarian", label: "Eggetarian" },
  { value: "occasional-meat", label: "Occasional meat" },
  { value: "regular-meat", label: "Regular meat" },
];

export default function Track() {
  const { userData, saveFootprint, updateGame } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<LifestyleInput>(userData?.lifestyle ?? EMPTY_LIFESTYLE);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof LifestyleInput>(k: K, v: LifestyleInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const live = useMemo(() => computeFootprint(form), [form]);
  const vsIndia = Math.round((live.total / INDIA_PER_CAPITA_KG) * 100);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
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
        <div className="space-y-6">
          <SectionCard icon={Home} title="Home energy">
            <BillScan onScanned={(kwh) => set("monthlyElectricityKwh", kwh)} />
            <NumberField
              label="Monthly electricity"
              unit="kWh"
              value={form.monthlyElectricityKwh}
              onChange={(v) => set("monthlyElectricityKwh", v)}
              hint="Check your last bill — average urban home ≈ 250 kWh."
            />
            <NumberField
              label="LPG cylinders per month"
              unit="cyl"
              step={0.5}
              value={form.lpgCylindersPerMonth}
              onChange={(v) => set("lpgCylindersPerMonth", v)}
            />
            <div className="space-y-1.5">
              <Label>Rooftop solar?</Label>
              <Toggle value={form.hasSolar} onChange={(v) => set("hasSolar", v)} />
            </div>
          </SectionCard>

          <SectionCard icon={Car} title="Mobility">
            <div className="space-y-1.5">
              <Label htmlFor="commuteMode">Main commute mode</Label>
              <Select
                id="commuteMode"
                value={form.commuteMode}
                onChange={(e) => set("commuteMode", e.target.value as CommuteMode)}
              >
                {COMMUTE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </div>
            <NumberField
              label="Commute distance"
              unit="km/day"
              value={form.commuteKmPerDay}
              onChange={(v) => set("commuteKmPerDay", v)}
            />
            <div className="grid grid-cols-2 gap-4">
              <NumberField
                label="Domestic flights"
                unit="/yr"
                value={form.flightsShortHaulPerYear}
                onChange={(v) => set("flightsShortHaulPerYear", v)}
              />
              <NumberField
                label="International flights"
                unit="/yr"
                value={form.flightsLongHaulPerYear}
                onChange={(v) => set("flightsLongHaulPerYear", v)}
              />
            </div>
          </SectionCard>

          <SectionCard icon={Utensils} title="Food">
            <div className="space-y-1.5">
              <Label htmlFor="diet">Your diet</Label>
              <Select
                id="diet"
                value={form.diet}
                onChange={(e) => set("diet", e.target.value as DietType)}
              >
                {DIET_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </div>
            <NumberField
              label="Meals out / ordered in"
              unit="/week"
              value={form.dineOutPerWeek}
              onChange={(v) => set("dineOutPerWeek", v)}
            />
          </SectionCard>

          <SectionCard icon={ShoppingBag} title="Goods & shopping">
            <NumberField
              label="Discretionary spend"
              unit="₹/month"
              step={500}
              value={form.shoppingSpendPerMonth}
              onChange={(v) => set("shoppingSpendPerMonth", v)}
              hint="Clothes, electronics, household goods — not rent or groceries."
            />
          </SectionCard>
        </div>

        {/* Live estimate */}
        <Card className="sticky top-20 overflow-hidden shadow-lift">
          <CardHeader className="flex-row items-center gap-2">
            <Gauge className="size-5 text-primary" />
            <CardTitle>Live estimate</CardTitle>
          </CardHeader>
          <CardContent>
            <div aria-live="polite">
              <p className="tabular font-display text-4xl font-semibold">{formatCO2(live.total)}</p>
              <p className="text-sm text-muted-foreground">CO₂e per year</p>
            </div>

            <div className="mt-3">
              <Badge variant={vsIndia > 100 ? "accent" : "success"}>
                {vsIndia}% of India's average
              </Badge>
            </div>

            <div className="mt-6 space-y-3">
              {(Object.keys(CATEGORY_META) as (keyof typeof CATEGORY_META)[]).map((key) => {
                const value = live.breakdown[key];
                const pct = live.total ? Math.round((value / live.total) * 100) : 0;
                return (
                  <div key={key}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{CATEGORY_META[key].label}</span>
                      <span className="tabular font-medium">{formatCO2(value)}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: CATEGORY_META[key].color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <Button type="submit" className="mt-6 w-full" size="lg" disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              Save & see insights
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-[18px]" />
        </span>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function NumberField({
  label,
  unit,
  value,
  onChange,
  hint,
  step = 1,
}: {
  label: string;
  unit?: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
  step?: number;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="relative">
        <Input
          type="number"
          min={0}
          step={step}
          inputMode="numeric"
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
          className={unit ? "pr-16" : ""}
        />
        {unit && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function BillScan({ onScanned }: { onScanned: (kwh: number) => void }) {
  const [status, setStatus] = useState<"idle" | "scanning" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatus("error");
      setMessage("Please choose an image (JPG or PNG).");
      return;
    }
    if (file.size > COMMUNITY.maxBillSizeMb * 1024 * 1024) {
      setStatus("error");
      setMessage(`Image is too large — keep it under ${COMMUNITY.maxBillSizeMb} MB.`);
      return;
    }
    setStatus("scanning");
    setMessage("");
    try {
      const { monthlyKwh } = await extractBillData(file);
      if (monthlyKwh) {
        onScanned(monthlyKwh);
        setStatus("done");
        setMessage(`Read ~${monthlyKwh} kWh/month from your bill. Adjust if needed.`);
      } else {
        setStatus("error");
        setMessage("Couldn't find the units on that bill — please enter them manually.");
      }
    } catch {
      setStatus("error");
      setMessage("Scan failed — please enter your usage manually.");
    }
  };

  if (!isBillScanAvailable) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-dashed border-border bg-muted/40 px-3.5 py-2.5 text-xs text-muted-foreground">
        <Upload className="size-4 shrink-0" /> Bill scanning is available on the live app.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label
        className={cn(
          "flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed px-4 py-3 text-sm font-medium transition-colors",
          status === "scanning"
            ? "border-primary/40 bg-primary/5 text-primary"
            : "border-primary/30 bg-primary/[0.04] text-primary hover:bg-primary/10",
        )}
      >
        {status === "scanning" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Sparkles className="size-4" />
        )}
        {status === "scanning" ? "Reading your bill…" : "Scan an electricity bill with AI"}
        <input
          id="bill-upload"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFile}
          disabled={status === "scanning"}
        />
      </label>
      {message && (
        <p
          className={cn(
            "flex items-center gap-1.5 text-xs",
            status === "done" ? "text-success" : "text-destructive",
          )}
        >
          {status === "done" ? (
            <CheckCircle2 className="size-3.5" />
          ) : (
            <AlertCircle className="size-3.5" />
          )}
          {message}
        </p>
      )}
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="inline-flex rounded-md border border-border bg-muted p-1">
      {[
        { v: false, label: "No" },
        { v: true, label: "Yes" },
      ].map((o) => (
        <button
          key={o.label}
          type="button"
          onClick={() => onChange(o.v)}
          className={cn(
            "rounded px-5 py-1.5 text-sm font-medium transition-colors",
            value === o.v
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

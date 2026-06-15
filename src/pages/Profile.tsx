import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useAuth } from "@/context/auth-context";
import type { HomeType } from "@/types";

const STATES = [
  "Andhra Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Other",
];

const AGE_BANDS = ["Under 18", "18–24", "25–34", "35–44", "45–54", "55+"];

export default function Profile() {
  const { userData, saveProfile } = useAuth();
  const navigate = useNavigate();
  const profile = userData?.profile;
  const isOnboarding = !profile?.onboarded;

  const [form, setForm] = useState({
    displayName: profile?.displayName ?? "",
    city: profile?.city ?? "",
    state: profile?.state ?? "",
    householdSize: profile?.householdSize ?? 3,
    homeType: (profile?.homeType ?? "apartment") as HomeType,
    ageBand: profile?.ageBand ?? "",
    occupation: profile?.occupation ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await saveProfile({
      ...form,
      householdSize: Number(form.householdSize),
    });
    setSaving(false);
    setSaved(true);
    if (isOnboarding) {
      setTimeout(() => navigate("/app/track"), 700);
    } else {
      setTimeout(() => setSaved(false), 2500);
    }
  };

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={isOnboarding ? "Welcome — let's set you up" : "Personal details"}
        description={
          isOnboarding
            ? "A few details help us tailor your footprint to where and how you live in India."
            : "Update the information we use to personalise your estimates."
        }
      />

      {isOnboarding && (
        <Card className="mb-6 border-primary/20 bg-primary/[0.04]">
          <CardContent className="flex items-center gap-3 py-4 text-sm">
            <Sparkles className="size-5 shrink-0 text-primary" />
            <span className="text-muted-foreground">
              Step 1 of 2 — after this you'll answer a quick lifestyle questionnaire to generate
              your footprint.
            </span>
          </CardContent>
        </Card>
      )}

      <form onSubmit={submit}>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>About you</CardTitle>
              <CardDescription>How we address you and understand your context.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field id="displayName" label="Full name" required>
                <Input
                  id="displayName"
                  value={form.displayName}
                  onChange={(e) => set("displayName", e.target.value)}
                  required
                  placeholder="Aarav Sharma"
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field id="ageBand" label="Age group">
                  <Select
                    id="ageBand"
                    value={form.ageBand}
                    onChange={(e) => set("ageBand", e.target.value)}
                  >
                    <option value="">Select</option>
                    {AGE_BANDS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field id="occupation" label="Occupation">
                  <Input
                    id="occupation"
                    value={form.occupation}
                    onChange={(e) => set("occupation", e.target.value)}
                    placeholder="e.g. Student"
                  />
                </Field>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your home</CardTitle>
              <CardDescription>Location and household shape your energy footprint.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field id="city" label="City / town" required>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                    required
                    placeholder="Pune"
                  />
                </Field>
                <Field id="state" label="State" required>
                  <Select
                    id="state"
                    value={form.state}
                    onChange={(e) => set("state", e.target.value)}
                    required
                  >
                    <option value="">Select state</option>
                    {STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field id="householdSize" label="People in household" required>
                  <Input
                    id="householdSize"
                    type="number"
                    min={1}
                    max={20}
                    value={form.householdSize}
                    onChange={(e) => set("householdSize", Number(e.target.value))}
                    required
                  />
                </Field>
                <Field id="homeType" label="Home type">
                  <Select
                    id="homeType"
                    value={form.homeType}
                    onChange={(e) => set("homeType", e.target.value as HomeType)}
                  >
                    <option value="apartment">Apartment / flat</option>
                    <option value="independent">Independent house</option>
                  </Select>
                </Field>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Button type="submit" size="lg" disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            {isOnboarding ? "Save & continue" : "Save changes"}
          </Button>
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
              <CheckCircle2 className="size-4" /> Saved
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

function Field({
  id,
  label,
  required,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label} {required && <span className="text-accent">*</span>}
      </Label>
      {children}
    </div>
  );
}

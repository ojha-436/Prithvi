import { Car, Home, ShoppingBag, Utensils } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { BillScan } from "@/components/track/BillScan";
import { NumberField } from "@/components/track/NumberField";
import { SectionCard } from "@/components/track/SectionCard";
import { SolarToggle } from "@/components/track/SolarToggle";
import { COMMUTE_OPTIONS, DIET_OPTIONS } from "@/lib/lifestyleOptions";
import type { CommuteMode, DietType, LifestyleInput } from "@/types";

/** Type-safe field setter shared between the page and the form. */
export type SetField = <K extends keyof LifestyleInput>(key: K, value: LifestyleInput[K]) => void;

/** The grouped lifestyle questionnaire (home, mobility, food, goods). */
export function TrackForm({ form, set }: { form: LifestyleInput; set: SetField }) {
  return (
    <div className="space-y-6">
      <SectionCard icon={Home} title="Home energy">
        <BillScan onScanned={(kwh) => set("monthlyElectricityKwh", kwh)} />
        <NumberField
          id="monthlyElectricityKwh"
          label="Monthly electricity"
          unit="kWh"
          value={form.monthlyElectricityKwh}
          onChange={(v) => set("monthlyElectricityKwh", v)}
          hint="Check your last bill - average urban home is about 250 kWh."
        />
        <NumberField
          id="lpgCylindersPerMonth"
          label="LPG cylinders per month"
          unit="cyl"
          step={0.5}
          value={form.lpgCylindersPerMonth}
          onChange={(v) => set("lpgCylindersPerMonth", v)}
        />
        <SolarToggle value={form.hasSolar} onChange={(v) => set("hasSolar", v)} />
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
          id="commuteKmPerDay"
          label="Commute distance"
          unit="km/day"
          value={form.commuteKmPerDay}
          onChange={(v) => set("commuteKmPerDay", v)}
        />
        <div className="grid grid-cols-2 gap-4">
          <NumberField
            id="flightsShortHaulPerYear"
            label="Domestic flights"
            unit="/yr"
            value={form.flightsShortHaulPerYear}
            onChange={(v) => set("flightsShortHaulPerYear", v)}
          />
          <NumberField
            id="flightsLongHaulPerYear"
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
          id="dineOutPerWeek"
          label="Meals out / ordered in"
          unit="/week"
          value={form.dineOutPerWeek}
          onChange={(v) => set("dineOutPerWeek", v)}
        />
      </SectionCard>

      <SectionCard icon={ShoppingBag} title="Goods & shopping">
        <NumberField
          id="shoppingSpendPerMonth"
          label="Discretionary spend"
          unit="INR/month"
          step={500}
          value={form.shoppingSpendPerMonth}
          onChange={(v) => set("shoppingSpendPerMonth", v)}
          hint="Clothes, electronics, household goods - not rent or groceries."
        />
      </SectionCard>
    </div>
  );
}

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function NumberField({
  id,
  label,
  unit,
  value,
  onChange,
  hint,
  step = 1,
}: {
  id: string;
  label: string;
  unit?: string;
  value: number;
  onChange: (value: number) => void;
  hint?: string;
  step?: number;
}) {
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type="number"
          min={0}
          step={step}
          inputMode="decimal"
          aria-describedby={hintId}
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
      {hint && (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}

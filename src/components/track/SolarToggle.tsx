import { cn } from "@/lib/utils";

const SOLAR_OPTIONS = [
  { value: false, label: "No" },
  { value: true, label: "Yes" },
];

export function SolarToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <fieldset className="space-y-1.5">
      <legend className="text-sm font-medium leading-none">Rooftop solar?</legend>
      <div className="inline-flex rounded-md border border-border bg-muted p-1" role="radiogroup">
        {SOLAR_OPTIONS.map((option) => {
          const selected = value === option.value;
          return (
            <label
              key={option.label}
              className={cn(
                "min-w-16 cursor-pointer rounded px-5 py-2 text-center text-sm font-medium transition-colors",
                selected
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <input
                type="radio"
                name="hasSolar"
                value={String(option.value)}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

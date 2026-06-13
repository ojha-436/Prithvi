import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Logo({ className, to = "/" }: { className?: string; to?: string }) {
  return (
    <Link to={to} className={cn("group inline-flex items-center gap-2.5", className)}>
      <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-soft">
        <svg viewBox="0 0 64 64" className="size-5" aria-hidden>
          <path
            d="M32 14c-9 6-14 13-14 22a14 14 0 0 0 28 0c0-9-5-16-14-22Z"
            fill="none"
            stroke="hsl(var(--accent))"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path
            d="M32 22v24M32 34l7-6M32 40l-7-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg font-semibold tracking-tight">Prithvi</span>
        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Carbon Intelligence
        </span>
      </span>
    </Link>
  );
}

import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Leaf, ShieldCheck, TrendingDown } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/context/auth-context";

const HIGHLIGHTS = [
  { icon: Leaf, text: "Personalised to Indian grid, diet and travel patterns" },
  { icon: TrendingDown, text: "See your footprint and a clear path to lower it" },
  { icon: ShieldCheck, text: "Your data stays private to your account" },
];

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const { demoMode } = useAuth();
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        <div className="bg-contour absolute inset-0 opacity-[0.5] mix-blend-soft-light" />
        <div className="relative">
          <Logo className="[&_span]:text-primary-foreground" />
        </div>
        <div className="relative max-w-md">
          <p className="font-display text-3xl font-medium leading-tight">
            “What gets measured gets managed.”
          </p>
          <p className="mt-3 text-primary-foreground/70">
            Every tonne counts. Prithvi turns your daily choices into a number you can actually
            move.
          </p>
          <ul className="mt-10 space-y-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-primary-foreground/90">
                <span className="grid size-9 place-items-center rounded-lg bg-primary-foreground/10">
                  <Icon className="size-[18px]" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-primary-foreground/50">
          Built for India · Hosted on Google Cloud
        </p>
      </div>

      {/* Form panel */}
      <div className="bg-paper flex flex-col">
        <div className="flex items-center justify-between p-6 lg:hidden">
          <Logo />
        </div>
        <main id="main" className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="w-full max-w-sm animate-fade-up">
            <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
            {demoMode && (
              <div className="mt-5 rounded-md border border-primary/25 bg-primary/[0.06] px-3.5 py-2.5 text-xs leading-relaxed text-foreground/80">
                <span className="font-semibold text-primary">Demo mode.</span> No Firebase keys
                detected — accounts are saved locally in this browser so you can explore the full
                app.
              </div>
            )}
            <div className="mt-6">{children}</div>
            <p className="mt-8 text-center text-xs text-muted-foreground">
              By continuing you agree to use Prithvi for personal, educational tracking.{" "}
              <Link to="/" className="underline underline-offset-2 hover:text-foreground">
                Back to home
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

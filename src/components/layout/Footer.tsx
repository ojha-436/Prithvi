import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Prithvi helps people in India understand, measure and shrink their carbon footprint —
            one informed choice at a time.
          </p>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold">Product</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li>
              <a href="#how" className="hover:text-foreground">
                How it works
              </a>
            </li>
            <li>
              <a href="#compare" className="hover:text-foreground">
                India vs world
              </a>
            </li>
            <li>
              <a href="#learn" className="hover:text-foreground">
                Learn carbon basics
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold">Data & methodology</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li>Grid factors: CEA, India</li>
            <li>Per-capita: Global Carbon Project</li>
            <li>Estimates are indicative, not audited</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container flex flex-col items-center justify-between gap-2 py-5 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Prithvi. Built for a low-carbon India.</p>
          <p>Created by Prince Kumar Ojha</p>
        </div>
      </div>
    </footer>
  );
}

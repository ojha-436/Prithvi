import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, ClipboardList, Sparkles, UserRound, Flame, Trophy, LogOut, Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { SkipLink } from "@/components/SkipLink";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { cn, formatNumber } from "@/lib/utils";

const NAV = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/track", label: "Track footprint", icon: ClipboardList },
  { to: "/app/insights", label: "Insights & actions", icon: Sparkles },
  { to: "/app/profile", label: "Personal details", icon: UserRound },
];

export function AppShell() {
  const { user, userData, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const game = userData?.game;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const SidebarBody = (
    <div className="flex h-full flex-col gap-2 p-4">
      <div className="px-2 py-3">
        <Logo to="/app/dashboard" />
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            <Icon className="size-[18px]" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="rounded-lg border border-border bg-background p-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="grid size-8 place-items-center rounded-full bg-accent/12 font-display text-sm font-semibold text-accent">
            {user?.displayName?.[0]?.toUpperCase() ?? "U"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="mt-3 w-full" onClick={handleSignOut}>
          <LogOut className="size-4" /> Sign out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-background">
      <SkipLink />
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-card lg:block">
        {SidebarBody}
      </aside>

      {/* Mobile overlay sidebar */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 border-r border-border bg-card shadow-lift">
            {SidebarBody}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md sm:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            {open ? <X /> : <Menu />}
          </Button>
          <div className="flex-1" />
          {game && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium">
                <Flame className="size-4 text-accent" />
                <span className="tabular">{game.streakDays}</span>
                <span className="text-muted-foreground">day streak</span>
              </span>
              <span className="hidden items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium sm:inline-flex">
                <Trophy className="size-4 text-primary" />
                <span className="tabular">{formatNumber(game.points)}</span>
                <span className="text-muted-foreground">pts</span>
              </span>
            </div>
          )}
          <ThemeToggle />
        </header>

        <main id="main" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

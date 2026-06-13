import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { applyStoredTheme } from "@/lib/theme";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute, RequireOnboarded } from "@/routes/ProtectedRoute";

// Route-level code splitting — each page ships as its own chunk and loads on
// demand, keeping the initial bundle small.
const Landing = lazy(() => import("@/pages/Landing"));
const Login = lazy(() => import("@/pages/Login"));
const Signup = lazy(() => import("@/pages/Signup"));
const Profile = lazy(() => import("@/pages/Profile"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Track = lazy(() => import("@/pages/Track"));
const Insights = lazy(() => import("@/pages/Insights"));

function RouteFallback() {
  return (
    <div className="grid min-h-dvh place-items-center bg-paper" role="status" aria-live="polite">
      <div className="h-1 w-32 overflow-hidden rounded-full bg-muted">
        <div className="h-full w-1/2 animate-shimmer rounded-full bg-primary" />
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    applyStoredTheme();
  }, []);

  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<AppShell />}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="profile" element={<Profile />} />
            <Route element={<RequireOnboarded />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="track" element={<Track />} />
              <Route path="insights" element={<Insights />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
